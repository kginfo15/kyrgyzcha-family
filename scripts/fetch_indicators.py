#!/usr/bin/env python3
"""Fetch Kyrgyzstan's indicator series from free, keyless APIs for the
per-pillar indicator charts in monitor.html.

Sources (no registration, no cost):
  - World Bank WDI / WGI   https://api.worldbank.org/v2/
  - UN SDG Global Database https://unstats.un.org/sdgapi/v1/
  - WHO GHO OData          https://ghoapi.azureedge.net/api/

Writes <out>/indicators-raw.json:
  {"fetched": "...", "wb": {code: {"name", "src", "s": [[year, value], ...]}},
   "sdg": {series: {"name", "s", "dims"}}, "who": {code: {"s"}}, "errors": [...]}
A failing code is listed in "errors" and the rest still go through.
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = {"User-Agent": "kyrgyzcha-family-indicators/1.0 (GitHub Actions)"}

# World Bank codes, grouped by the monitor's sectors (a code may serve several)
WB = {
    "macro": ["NY.GDP.PCAP.CD", "NY.GDP.MKTP.CD", "NY.GDP.MKTP.KD.ZG", "NE.GDI.FTOT.ZS", "SL.UEM.TOTL.ZS",
              "DT.DOD.DECT.GN.ZS", "GC.DOD.TOTL.GD.ZS", "FP.CPI.TOTL.ZG", "NE.EXP.GNFS.ZS"],
    "urban": ["SP.URB.TOTL.IN.ZS", "EN.POP.SLUM.UR.ZS", "SH.H2O.SMDW.UR.ZS", "SH.H2O.SMDW.RU.ZS", "EN.ATM.PM25.MC.M3"],
    "transport": ["IS.AIR.PSGR", "IS.AIR.GOOD.MT.K1", "IS.RRS.GOOD.MT.K6", "IS.RRS.TOTL.KM", "LP.LPI.OVRL.XQ",
                  "SH.STA.TRAF.P5", "NV.SRV.TOTL.ZS"],
    "energy": ["EG.ELC.RNEW.ZS", "EG.FEC.RNEW.ZS", "EG.ELC.LOSS.ZS", "EG.EGY.PRIM.PP.KD", "EG.ELC.ACCS.ZS",
               "EG.CFT.ACCS.ZS", "EG.ELC.HYRO.ZS", "EG.USE.PCAP.KG.OE", "EG.ELC.FOSL.ZS"],
    "private": ["NV.IND.TOTL.KD", "NV.IND.TOTL.ZS", "NV.IND.MANF.ZS", "BX.KLT.DINV.WD.GD.ZS", "ST.INT.ARVL",
                "ST.INT.RCPT.CD", "ST.INT.RCPT.XP.ZS", "SL.EMP.SELF.ZS"],
    "agri": ["NV.AGR.TOTL.ZS", "NV.AGR.TOTL.KD", "AG.PRD.FOOD.XD", "AG.PRD.CROP.XD", "AG.PRD.LVSK.XD",
             "AG.LND.IRIG.AG.ZS", "SL.AGR.EMPL.ZS", "AG.YLD.CREL.KG", "ER.H2O.FWAG.ZS", "AG.LND.AGRI.ZS"],
    "nutrition": ["SH.STA.STNT.ZS", "SH.STA.WAST.ZS", "SH.STA.OWGH.ZS", "SH.ANM.ALLW.ZS", "SH.ANM.CHLD.ZS",
                  "SN.ITK.DEFC.ZS", "SN.ITK.MSFI.ZS", "SH.STA.BFED.ZS", "SH.STA.BRTW.ZS"],
    "education": ["SE.PRE.ENRR", "SE.PRM.NENR", "SE.SEC.NENR", "SE.TER.ENRR", "SE.XPD.TOTL.GD.ZS",
                  "GB.XPD.RSDV.GD.ZS", "SE.PRM.CMPT.ZS", "SE.LPV.PRIM", "SE.SEC.CMPT.LO.ZS", "SE.PRM.UNER",
                  "SE.SEC.ENRR", "SE.PRE.ENRL.TC.ZS"],
    "social": ["SI.POV.NAHC", "SI.POV.DDAY", "SI.POV.LMIC", "SI.POV.UMIC", "SI.POV.GINI", "SL.EMP.TOTL.SP.ZS",
               "per_allsp.cov_pop_tot", "per_sa_allsa.cov_pop_tot", "BX.TRF.PWKR.DT.GD.ZS", "SL.TLF.CACT.ZS",
               "SP.POP.65UP.TO.ZS"],
    "peace": ["VC.IHR.PSRC.P5", "GOV_WGI_PV.EST", "VC.BTL.DETH", "SM.POP.REFG", "SM.POP.NETM"],
    "governance": ["GOV_WGI_GE.EST", "GOV_WGI_CC.EST", "GOV_WGI_RL.EST", "GOV_WGI_RQ.EST", "GOV_WGI_VA.EST", "IQ.SPI.OVRL", "GC.TAX.TOTL.GD.ZS"],
    "finance": ["FS.AST.PRVT.GD.ZS", "FX.OWN.TOTL.ZS", "FX.OWN.TOTL.FE.ZS", "GC.REV.XGRT.GD.ZS", "FB.AST.NPER.ZS",
                "FB.BNK.CAPA.ZS", "FR.INR.LEND", "CM.MKT.LCAP.GD.ZS", "GC.NLD.TOTL.GD.ZS"],
    "gender": ["SG.GEN.PARL.ZS", "SL.TLF.CACT.FE.ZS", "SL.TLF.CACT.FM.ZS", "SP.M18.2024.FE.ZS", "SG.VAW.1549.ZS",
               "SL.EMP.SMGT.FE.ZS", "SL.UEM.TOTL.FE.ZS", "SE.ENR.TERT.FM.ZS"],
    "digital": ["IT.NET.USER.ZS", "IT.NET.BBND.P2", "IT.CEL.SETS.P2", "BX.GSR.CCIS.ZS", "BX.GSR.CCIS.CD",
                "IT.NET.SECR.P6"],
    "climate": ["EN.GHG.ALL.MT.CE.AR5", "EN.GHG.CO2.MT.CE.AR5", "EN.GHG.ALL.PC.CE.AR5", "EN.GHG.CO2.PC.CE.AR5"],
    "nature": ["ER.PTD.TOTL.ZS", "ER.LND.PTLD.ZS", "AG.LND.FRST.ZS", "AG.LND.FRST.K2", "EN.MAM.THRD.NO",
               "EN.BIR.THRD.NO"],
    "envmgmt": ["EN.ATM.PM25.MC.ZS", "SH.STA.AIRP.P5", "EN.H2O.BDYS.ZS"],
    "water": ["SH.H2O.SMDW.ZS", "SH.H2O.BASW.ZS", "SH.STA.SMSS.ZS", "SH.STA.BASS.ZS", "SH.STA.HYGN.ZS",
              "ER.H2O.FWST.ZS", "ER.GDP.FWTL.M3.KD", "ER.H2O.FWTL.ZS", "SH.STA.WASH.P5", "ER.H2O.INTR.PC"],
    "drr": ["EN.CLC.DRSK.XQ", "EN.POP.DNST", "EN.CLC.MDAT.ZS"],
}

# UN SDG Global Database series (indicator in brackets)
SDG = [
    "SI_COV_BENFT",   # 1.3.1 social protection coverage
    "SI_POV_NAHC",    # 1.2.1 national poverty
    "VC_DSR_MTMP",    # 1.5.1 / 11.5.1 deaths + missing from disasters per 100k
    "VC_DSR_AFFCT",   # 1.5.1 affected people
    "VC_DSR_GDPLS",   # 1.5.2 economic loss from disasters
    "SG_DSR_LGRGSR",  # 1.5.4 / 11.b.2 local governments with DRR strategies
    "SG_DSR_SILS",    # 1.5.3 national DRR strategy (Sendai) score
    "SN_ITK_DEFC",    # 2.1.1 undernourishment
    "AG_PRD_FIESMS",  # 2.1.2 food insecurity (moderate or severe)
    "SH_STA_STNT",    # 2.2.1 stunting
    "SH_STA_WAST",    # 2.2.2 wasting
    "SH_STA_OVRW",    # 2.2.2 overweight
    "SH_STA_ANEM",    # 2.2.3 anaemia in women
    "SE_TOT_PRFL",    # 4.1.1 minimum proficiency
    "SE_PRE_PARTN",   # 4.2.2 participation one year before primary
    "SE_INF_DSBL",    # 4.a.1 schools with disability-adapted infrastructure
    "SE_ACC_INTN",    # 4.a.1 schools with internet
    "SG_GEN_PARL",    # 5.5.1 women in parliament
    "SG_GEN_LOCGELS", # 5.5.1 women in local government
    "IC_GEN_MGTL",    # 5.5.2 women in managerial positions
    "VC_VAW_MARR",    # 5.2.1 intimate partner violence
    "SP_DYN_MRBF18",  # 5.3.1 child marriage
    "SH_H2O_SAFE",    # 6.1.1 safely managed drinking water
    "SH_SAN_SAFE",    # 6.2.1 safely managed sanitation
    "EN_H2O_WBAMBQ",  # 6.3.2 good ambient water quality
    "ER_H2O_WUEYST",  # 6.4.1 water-use efficiency
    "ER_H2O_STRESS",  # 6.4.2 water stress
    "ER_H2O_IWRMD",   # 6.5.1 IWRM implementation
    "EG_ELC_ACCS",    # 7.1.1 access to electricity
    "EG_FEC_RNEW",    # 7.2.1 renewable share
    "EG_EGY_PRIM",    # 7.3.1 energy intensity
    "SL_ISV_IFEM",    # 8.3.1 informal employment
    "SL_TLF_UEM",     # 8.5.2 unemployment
    "FB_BNK_ACCSS",   # 8.10.2 account ownership
    "IS_RDP_PFVOL",   # 9.1.2 passenger volume
    "IS_RDP_FRGVOL",  # 9.1.2 freight volume
    "NV_IND_MANF",    # 9.2.1 manufacturing value added share
    "GB_XPD_RSDV",    # 9.5.1 R&D expenditure
    "IT_MOB_4GNTWK",  # 9.c.1 4G coverage
    "EN_LND_SLUM",    # 11.1.1 urban slum population
    "EN_ATM_PM25",    # 11.6.2 PM2.5
    "EN_REF_WASCOL",  # 11.6.1 municipal waste collected
    "EN_ATM_GHGT_NAIP",  # 13.2.2 GHG (non-Annex I)
    "ER_PTD_TERR",    # 15.1.2 KBAs covered by protected areas
    "AG_LND_FRST",    # 15.1.1 forest area
    "AG_LND_FRSTPRCT",# 15.2.1 forest under management plan
    "ER_RSK_LST",     # 15.5.1 Red List index
    "AG_LND_DGRD",    # 15.3.1 degraded land
    "VC_IHR_PSRC",    # 16.1.1 homicide
    "VC_VOV_ROBB",    # 16.1.4 feeling safe? (and robbery)
    "VC_PRS_UNSEC",   # 16.3.2 unsentenced detainees
    "GF_XPD_GBPC",    # 16.6.1 budget outturn
    "IU_DMS_ARBS",    # 16.9? birth registration placeholder
    "SG_REG_BRTH",    # 16.9.1 birth registration
    "IT_USE_ii99",    # 17.8.1 internet users
    "IT_NET_BBND",    # 17.6.1 fixed broadband
    "GR_G14_GDP",     # 17.1.1 government revenue
    "DT_TDS_DECT",    # 17.4.1 debt service
]

# WHO GHO codes (sports = physical activity; nutrition = obesity, anaemia)
WHO = ["NCD_PAC", "NCD_PAC_ADO", "NCD_BMI_30A", "NCD_BMI_30C", "NUTRITION_ANAEMIA_REPRODUCTIVEAGE_PREV",
       "NUTRITION_ANAEMIA_CHILDREN_PREV", "NCD_BMI_PLUS2C", "RS_198", "AIR_41", "SDGPM25"]


def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # network hiccup or a 5xx: back off and retry
            last = e
            time.sleep(2 * (i + 1))
    raise last


def wb_series(code):
    url = f"https://api.worldbank.org/v2/country/KGZ/indicator/{urllib.parse.quote(code)}?format=json&per_page=200&date=1995:2030"
    js = get(url)
    if not isinstance(js, list) or len(js) < 2 or not js[1]:
        msg = js[0].get("message") if isinstance(js, list) and js and isinstance(js[0], dict) else None
        raise ValueError(f"no data {msg or ''}")
    rows = js[1]
    s = sorted([int(r["date"]), r["value"]] for r in rows if r.get("value") is not None and r["date"].isdigit())
    return {"name": rows[0]["indicator"]["value"], "src": "World Bank WDI", "s": s}


def sdg_series(code):
    url = f"https://unstats.un.org/sdgapi/v1/sdg/Series/Data?seriesCode={code}&areaCode=417&pageSize=2000"
    js = get(url)
    data = js.get("data") or []
    if not data:
        raise ValueError("no data")
    out = {}
    for d in data:
        dims = {k: v for k, v in (d.get("dimensions") or {}).items() if v not in ("ALLAREA", "BOTHSEX", "ALLAGE", "_T", "_Z")}
        key = json.dumps(dims, ensure_ascii=False, sort_keys=True)
        try:
            v = float(d["value"])
        except (TypeError, ValueError):
            continue
        out.setdefault(key, []).append([int(float(d["timePeriodStart"])), v])
    return {"name": data[0].get("seriesDescription"), "unit": (data[0].get("attributes") or {}).get("Units"),
            "dims": {k: sorted(v) for k, v in out.items()}}


def who_series(code):
    url = f"https://ghoapi.azureedge.net/api/{code}?$filter=SpatialDim%20eq%20'KGZ'"
    js = get(url)
    rows = js.get("value") or []
    if not rows:
        raise ValueError("no data")
    out = {}
    for r in rows:
        if r.get("NumericValue") is None:
            continue
        key = "|".join(str(r.get(k) or "") for k in ("Dim1", "Dim2", "Dim3") if r.get(k))
        out.setdefault(key or "all", []).append([int(r["TimeDim"]), round(r["NumericValue"], 3)])
    return {"dims": {k: sorted(v) for k, v in out.items()}}


def main(outdir):
    res = {"fetched": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "wb": {}, "sdg": {}, "who": {}, "errors": [],
           "groups": WB}
    for code in sorted({c for cs in WB.values() for c in cs}):
        try:
            res["wb"][code] = wb_series(code)
        except Exception as e:
            res["errors"].append(f"wb {code}: {e}")
    for code in SDG:
        try:
            res["sdg"][code] = sdg_series(code)
        except Exception as e:
            res["errors"].append(f"sdg {code}: {e}")
    for code in WHO:
        try:
            res["who"][code] = who_series(code)
        except Exception as e:
            res["errors"].append(f"who {code}: {e}")
    with open(f"{outdir}/indicators-raw.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=0)
    print(f"wb {len(res['wb'])}, sdg {len(res['sdg'])}, who {len(res['who'])}, errors {len(res['errors'])}")
    for e in res["errors"]:
        print("  ", e)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
