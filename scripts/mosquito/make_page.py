"""Write mosquito.html from page_template.html with the base map embedded.

  python3 scripts/mosquito/make_page.py
"""
import os
here = os.path.dirname(os.path.abspath(__file__))
page = open(os.path.join(here, "page_template.html"), encoding="utf-8").read()
tokyo = open(os.path.join(here, "tokyo_map.json"), encoding="utf-8").read().strip().replace("</", "<\\/")
open(os.path.join(here, "..", "..", "mosquito.html"), "w", encoding="utf-8").write(page.replace("__TOKYO_MAP__", tokyo))
