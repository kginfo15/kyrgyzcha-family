"""Read the unit names off the drawn management schemes (OCR), as text only.

Most "схема управления" annexes in the legal database are pictures. This script takes the
acts listed in org-db/index.json that have a scheme (adopted 2021 or later), fetches their
latest edition again, runs Tesseract OCR (Russian) on the scheme pictures and writes
ocr/<file>.txt next to the other org-db files. The pictures themselves are not kept.

usage: org_ocr.py ORG_DB_DIR
"""
import json
import os
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import org_db  # noqa: E402


def main():
    root = sys.argv[1]
    os.makedirs(os.path.join(root, "ocr"), exist_ok=True)
    index = json.load(open(os.path.join(root, "index.json"), encoding="utf-8"))
    done = 0
    for row in index:
        if not row.get("scheme") or row.get("date", "") < "2021" or not row.get("images"):
            continue
        try:
            ed = org_db.call(f"/GetEdition?editionId={row['edition']}&lang=ru")
            content = ed.get("contentRu") or ""
            with tempfile.TemporaryDirectory() as tmp:
                names = [n for n in org_db.save_images(content, tmp, "p") if not n.startswith("ERROR")]
                texts = []
                for n in names:
                    r = subprocess.run(["tesseract", os.path.join(tmp, n), "-", "-l", "rus", "--psm", "11"],
                                       capture_output=True, text=True, timeout=180)
                    texts.append(f"--- picture {n}\n{r.stdout.strip()}")
            open(os.path.join(root, "ocr", row["file"] + ".txt"), "w", encoding="utf-8").write(
                f"{row['title']}\nversion {row.get('editionDate', '')}\n\n" + "\n\n".join(texts) + "\n")
            done += 1
        except Exception as e:
            print("failed", row["code"], e)
        time.sleep(1)
    print("OCR done for", done, "acts")


if __name__ == "__main__":
    main()
