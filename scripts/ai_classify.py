"""Classify collected items and donor projects with Claude.

Used by fetch_sectors.py when ANTHROPIC_API_KEY is set (a GitHub Actions
secret); without it the keyword classification stays in place.

For each news item Claude decides whether it concerns Kyrgyzstan's
development at all, which of the 20 sectors it belongs to, whether it is a
move by the Kyrgyz government, whether it reports actual cooperation (a loan,
grant, signing, project, handover - not a forecast or a passing mention), which
donors take part, and gives a Japanese headline. Projects get their sectors.

Every item is judged once (marked with "ai": AI_VERSION); raising AI_VERSION
re-judges everything on the following runs.
"""
import json
import os
import sys
import time

AI_VERSION = 1
# Haiku: sorting news into sectors is a light task, and it costs a small fraction of Opus
MODEL = os.environ.get("MONITOR_MODEL") or "claude-haiku-5-5"
ITEM_BATCH = 25
REFUSED = "refused"
REFUSAL_LIMIT = 2  # a record in a batch refused this many times keeps its keyword sorting


def _refused(records):
    """Count a refusal against each record of the batch; give up on it after REFUSAL_LIMIT."""
    for r in records:
        r["air"] = r.get("air", 0) + 1
        if r["air"] >= REFUSAL_LIMIT:
            r["ai"] = AI_VERSION
PROJECT_BATCH = 40


def log(*a):
    print(*a, file=sys.stderr)


def enabled():
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def _client():
    import anthropic
    return anthropic.Anthropic(max_retries=4, timeout=300)


def _guide(sectors, donors):
    sec = "\n".join(f"- {sid}: {ja}" for sid, ja in sectors)
    don = "\n".join(f"- {did}: {ja}" for did, ja in donors)
    return f"""You sort news and project records for a monitoring page used by Japanese development-cooperation staff who follow Kyrgyzstan.

Sectors (use only these ids; give 0 to 3, most relevant first; none if no sector clearly fits):
{sec}

Donors and partners (use only these ids):
{don}

For each record decide:
- relevant: true if it concerns Kyrgyzstan's economy, society, governance, infrastructure, environment, disasters, or its cooperation with other countries and organisations. false for crime blotter items, celebrity or entertainment news, sports results, advertisements, subscription offers, and stories that mention Kyrgyzstan only in passing.
- gov: true only when the Kyrgyz government (president, cabinet, a ministry or state agency, parliament, the national bank) decides, announces, adopts or carries out a policy, law, programme, budget or project. A court case, a pardon request, a police warning or a minister merely attending a meeting is false.
- coop: true only when a donor, international organisation, foreign government or NGO provides or agrees on concrete support in Kyrgyzstan: a loan, grant, technical assistance, signed agreement, project launch or completion, equipment handover, training programme. Forecasts, reports, conferences, statements and generic praise are false.
- donors: the ids of the donors/partners actually involved (only when coop is true; otherwise empty). Use "jica" for JICA and "jp" for other Japanese government support; "ngo" for NGOs and foundations not listed; "obi" for other bilateral donors (Nordic countries, France, Canada ...).
- title_ja: a natural, concise Japanese headline (not a literal translation; keep names of people and places in standard Japanese katakana). For project records, return the existing Japanese title if one is given.

Records may be in Russian, Kyrgyz, English or Japanese. Judge from the title and lead only."""


def _schema(sector_ids, donor_ids, with_flags):
    props = {
        "id": {"type": "string"},
        "sectors": {"type": "array", "items": {"type": "string", "enum": sector_ids}},
    }
    req = ["id", "sectors"]
    if with_flags:
        props.update({
            "relevant": {"type": "boolean"},
            "gov": {"type": "boolean"},
            "coop": {"type": "boolean"},
            "donors": {"type": "array", "items": {"type": "string", "enum": donor_ids}},
            "title_ja": {"type": "string"},
        })
        req += ["relevant", "gov", "coop", "donors", "title_ja"]
    return {
        "type": "object",
        "properties": {"results": {"type": "array", "items": {
            "type": "object", "properties": props, "required": req, "additionalProperties": False}}},
        "required": ["results"],
        "additionalProperties": False,
    }


class Classifier:
    def __init__(self, sectors, donors):
        self.client = _client()
        self.sector_ids = [s for s, _ in sectors]
        self.donor_ids = [d for d, _ in donors]
        self.system = [{"type": "text", "text": _guide(sectors, donors), "cache_control": {"type": "ephemeral"}}]
        self.usage = {"in": 0, "out": 0, "cache_read": 0, "requests": 0, "refused": 0}

    def _ask(self, task, records, with_flags):
        import anthropic
        body = task + "\n\nRecords (JSON):\n" + json.dumps(records, ensure_ascii=False)
        try:
            resp = self.client.beta.messages.create(
                model=MODEL,
                max_tokens=16000,
                # server-side fallback on refusals exists for Opus/Sonnet/Fable, not for Haiku
                **({} if "haiku" in MODEL else {"betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default"}),
                system=self.system,
                output_config={"effort": "low", "format": {
                    "type": "json_schema", "schema": _schema(self.sector_ids, self.donor_ids, with_flags)}},
                messages=[{"role": "user", "content": body}],
            )
        except anthropic.RateLimitError as e:
            wait = int(e.response.headers.get("retry-after", "30"))
            log(f"ai: rate limited, waiting {wait}s")
            time.sleep(wait)
            return None
        except anthropic.APIStatusError as e:
            log(f"ai: API error {e.status_code}: {e.message}")
            return None
        except anthropic.APIConnectionError as e:
            log(f"ai: connection error: {e}")
            return None
        u = resp.usage
        self.usage["requests"] += 1
        self.usage["in"] += u.input_tokens or 0
        self.usage["out"] += u.output_tokens or 0
        self.usage["cache_read"] += getattr(u, "cache_read_input_tokens", 0) or 0
        if resp.stop_reason == "refusal":
            self.usage["refused"] += 1
            log(f"ai: refused ({getattr(resp.stop_details, 'category', None)})")
            return REFUSED
        if resp.stop_reason == "max_tokens":
            log("ai: output cut off, batch skipped")
            return None
        text = next((b.text for b in resp.content if b.type == "text"), "")
        try:
            return {r["id"]: r for r in json.loads(text)["results"]}
        except Exception as e:
            log(f"ai: unreadable answer: {e}")
            return None

    def items(self, store, budget, time_left):
        """Judge stored news items not yet judged by this AI_VERSION, newest first."""
        todo = [x for x in store.values() if x.get("ai") != AI_VERSION]
        todo.sort(key=lambda x: x["p"], reverse=True)
        done = 0
        for i in range(0, min(len(todo), budget), ITEM_BATCH):
            if time_left() < 10 * 60:
                break
            chunk = todo[i:i + ITEM_BATCH]
            recs = [{"id": x["i"], "title": x["t"], "lead": (x.get("l") or "")[:300], "source": x.get("s", ""),
                     "date": x["p"][:10]} for x in chunk]
            got = self._ask("Classify each news record.", recs, True)
            if got == REFUSED:
                _refused(chunk)
                continue
            if not got:
                continue
            for x in chunk:
                r = got.get(x["i"])
                if not r:
                    continue
                x["c"] = [c for c in r["sectors"] if c in self.sector_ids][:3]
                x["g"] = 1 if r["gov"] else 0
                x["d"] = sorted(set(r["donors"])) if r["coop"] else []
                if r["relevant"]:
                    x.pop("hide", None)
                else:
                    x["hide"] = 1
                if r.get("title_ja") and x.get("lang") != "ja":
                    x["tj"] = r["title_ja"]
                x["ai"] = AI_VERSION
                x.pop("air", None)
                done += 1
        log(f"ai items: {done} judged, {len(todo) - done} left; usage {self.usage}")

    def projects(self, projs, budget, time_left):
        """Give sectors to projects not yet judged, running and planned ones first."""
        todo = [p for p in projs if p.get("ai") != AI_VERSION]
        todo.sort(key=lambda p: (p.get("st") not in ("active", "pipeline"), -(int((p.get("a") or "0")[:4] or 0))))
        done = 0
        for i in range(0, min(len(todo), budget), PROJECT_BATCH):
            if time_left() < 8 * 60:
                break
            chunk = todo[i:i + PROJECT_BATCH]
            recs = [{"id": p["id"], "title": p.get("t", ""), "title_ja": p.get("tj", ""),
                     "description": (p.get("x") or "")[:300], "donor": p.get("org", ""), "type": p.get("kind", "")}
                    for p in chunk]
            got = self._ask("Give the sectors of each donor project record.", recs, False)
            if got == REFUSED:
                _refused(chunk)
                continue
            if not got:
                continue
            for p in chunk:
                r = got.get(p["id"])
                if r is None:
                    continue
                p["c"] = [c for c in r["sectors"] if c in self.sector_ids][:3]
                p["ai"] = AI_VERSION
                done += 1
        log(f"ai projects: {done} judged, {len(todo) - done} left; usage {self.usage}")
