# -*- coding: utf-8 -*-
"""
ComposeSDGs | Fetch SDG data from UN SDG API and save as JSON keyed by ISO3 codes.
Fully compatible with API responses that lack 'geoAreaType'.
"""

import requests, json, csv, sys, time
from pathlib import Path
from tqdm import tqdm

# ---------------------- CONFIG ----------------------
TARGET_YEAR = 2020
CSV_REL_PATH = Path(__file__).with_name("UNSDMethodology.csv")
OUT_JSON = Path(__file__).with_name("sdg_data_mapped.json")

SDG_SERIES = {
    "1": "SI_COV_BENFTS",
    "2": "AG_LND_SUST_PRXTS",
    "3": "SH_ACS_UNHC",
    "4": "SE_TOT_CPLR",
    "5": "SG_GEN_PARL",
    "6": "SH_SAN_HNDWSH",
    "7": "EG_ACS_ELEC",
    "8": "FB_BNK_ACCSS",
    "9": "SL_TLF_MANF",
    "10": "SL_EMP_GTOTL",
    "11": "SP_TRN_PUBL",
    "12": "EN_MWT_RCYR",
    "13": "SG_DSR_SILS",
    "14": "ER_H2O_FWTL",
    "15": "AG_LND_FRST",
    "16": "VC_SNS_WALN_DRK",
    "17": "GR_G14_GDP",
}

HEADERS = {"User-Agent": "ComposeSDGs/1.0 (academic non-commercial)"}


# ---------------------- HELPERS ----------------------
def log(msg):
    print(msg, flush=True)


def fetch_json(url, retry=2, timeout=20):
    for i in range(retry + 1):
        try:
            r = requests.get(url, headers=HEADERS, timeout=timeout)
            if r.status_code == 200:
                return r.json()
            log(f"⚠️ HTTP {r.status_code} {url}")
        except Exception as e:
            log(f"⚠️ Request error: {e}")
        if i < retry:
            time.sleep(1)
    return None


# ---------------------- STEP 1: 读取 CSV ----------------------
log(f"📂 Reading mapping CSV: {CSV_REL_PATH}")
if not CSV_REL_PATH.exists():
    log("❌ File not found.")
    sys.exit(1)

iso_map = {}
with CSV_REL_PATH.open("r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f, delimiter=";")
    for row in reader:
        m49_str = (row.get("M49 Code") or "").strip()
        iso3 = (row.get("ISO-alpha3 Code") or "").strip()
        name = (row.get("Country or Area") or "").strip()
        try:
            m49 = int(m49_str)
        except ValueError:
            continue
        if iso3 and len(iso3) == 3:
            iso_map[m49] = {"iso3": iso3, "name": name}

log(f"✅ Loaded {len(iso_map)} mappings from CSV.")
if not iso_map:
    sys.exit("❌ No mappings loaded, check CSV header and delimiter.")

# ---------------------- STEP 2: 获取 API 国家列表 ----------------------
geo_url = "https://unstats.un.org/SDGAPI/v1/sdg/GeoArea/List"
log("🌍 Fetching geo areas ...")
geo_data = fetch_json(geo_url)
if not geo_data:
    sys.exit("❌ Failed to fetch geo area list.")

log(f"✅ Geo areas returned: {len(geo_data)} (showing first 3)")
for g in geo_data[:3]:
    log("   " + json.dumps(g, ensure_ascii=False))

# 直接使用所有返回项，不过滤
countries = geo_data
log(f"✅ Using all {len(countries)} geo areas from API")

m49s_from_api = {int(g["geoAreaCode"]) for g in countries}
m49s_from_csv = set(iso_map.keys())
intersect = m49s_from_api & m49s_from_csv
log(f"🔎 Mapping intersection: {len(intersect)} / {len(m49s_from_csv)} CSV codes")

if len(intersect) == 0:
    log("⚠️ Warning: intersection = 0, check that 'M49 Code' column matches geoAreaCode integers.")


# ---------------------- STEP 3: 拉取数据 ----------------------
def get_country_sdg_values(area_code, year):
    out = {}
    for sdg, series in SDG_SERIES.items():
        url = (
            f"https://unstats.un.org/SDGAPI/v1/sdg/Series/Data?"
            f"seriesCode={series}&areaCode={area_code}&timePeriod={year}"
        )
        js = fetch_json(url, retry=1, timeout=15)
        if not js:
            continue
        arr = js.get("data", [])
        if not arr:
            continue
        val = arr[0].get("value")
        try:
            if val:
                out[f"SDG{sdg}"] = float(val)
        except Exception:
            pass
    return out


# ---------------------- STEP 4: 主循环 ----------------------
output = {}
log("🎯 Fetching SDG series per country ...")

for g in tqdm(countries, desc="Processing countries"):
    try:
        m49 = int(g["geoAreaCode"])
    except Exception:
        continue
    if m49 not in iso_map:
        continue
    iso3 = iso_map[m49]["iso3"]
    name = iso_map[m49]["name"]
    data = get_country_sdg_values(m49, TARGET_YEAR)
    if data:
        output[iso3] = {"name": name, str(TARGET_YEAR): data}

# ---------------------- STEP 5: 保存 ----------------------
OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
with OUT_JSON.open("w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

log(f"\n✅ Done! {len(output)} countries saved to {OUT_JSON}")
if len(output) == 0:
    log("⚠️ No data found — some series have limited coverage; try TARGET_YEAR = 2019 or 2021.")
