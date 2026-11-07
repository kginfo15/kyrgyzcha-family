# 省庁ページのデータ（script#orgs in monitor.html）

1. `.github/workflows/org-db.yml` (monthly) collects every ministry/agency regulation and
   management scheme from cbd.minjust.gov.kg into the `org-db` branch (text only).
   `.github/workflows/org-ocr.yml` adds `ocr/*.txt`: text read off the drawn schemes
   (the pictures are read and thrown away; they are never published).
2. Rebuild the data (ROOT = a folder holding a copy of the org-db branch as `orgdb/`):

       python3 scripts/org/units.py ROOT    # units found in the titles of their regulations -> ROOT/units.json
       python3 scripts/org/build.py ROOT    # -> ROOT/orgs.json, paste into <script id="orgs">

   `spec.py` = the ministries (Japanese names, role, sectors, strategies), `ja.py` = Japanese
   names of units found in titles, `extra.py` = units read off the schemes (OCR, checked by eye).
3. The site reads `org-db/status.json` and marks a ministry 「見直し待ち」 when its regulation
   has a newer edition than the one read here (`basis.ed`).
