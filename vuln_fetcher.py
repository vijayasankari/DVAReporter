import requests
import pandas as pd

SOURCES = {
    "Web": "https://raw.githubusercontent.com/OWASP/Top10/master/2021/en/0xA.json",
    "API": "https://raw.githubusercontent.com/OWASP/API-Security/main/2023/assets/api-security-top-10.json",
    "Mobile": "https://raw.githubusercontent.com/OWASP/owasp-masvs/master/MASTG/JSON/mastg.json"
}

def fetch_owasp_web_api():
    rows = []
    for source_name, url in SOURCES.items():
        if source_name == "Mobile":
            continue

        try:
            res = requests.get(url)
            res.raise_for_status()
            data = res.json()

            items = data.get("items") or data.get("api_top_10", [])
            for item in items:
                title = item.get("title", "").strip()
                desc = item.get("description", "").strip()
                rem = item.get("how_to_prevent", "").strip()
                refs = "\n".join(item.get("references", [])) if "references" in item else ""
                severity = "Medium"  # OWASP doesn't assign CVSS

                rows.append({
                    "title": title,
                    "severity": severity,
                    "description": desc,
                    "recommendation": rem,
                    "reference": refs,
                    "source": source_name
                })
        except Exception as e:
            print(f"Error fetching {source_name}: {e}")
    return rows

def fetch_owasp_mobile():
    rows = []
    try:
        res = requests.get(SOURCES["Mobile"])
        res.raise_for_status()
        data = res.json()
        for category in data.get("categories", []):
            for test in category.get("tests", []):
                title = test.get("name", "").strip()
                desc = test.get("description", "").strip()
                rem = test.get("remediation", "").strip()
                ref = "\n".join(test.get("links", []))
                severity = "Medium"

                rows.append({
                    "title": title,
                    "severity": severity,
                    "description": desc,
                    "recommendation": rem,
                    "reference": ref,
                    "source": "Mobile"
                })
    except Exception as e:
        print(f"Error fetching Mobile data: {e}")
    return rows

def main():
    all_vulns = fetch_owasp_web_api() + fetch_owasp_mobile()

    if not all_vulns:
        print("❌ No vulnerabilities fetched. Please check the URLs.")
        return

    df = pd.DataFrame(all_vulns)
    df.drop_duplicates(subset=["title"], inplace=True)
    df = df[["title", "severity", "description", "recommendation", "reference", "source"]]
    df.sort_values(by=["source", "title"], inplace=True)

    out_path = "owasp_combined_vulnerabilities.xlsx"
    df.to_excel(out_path, index=False)
    print(f"✅ Excel file created: {out_path} with {len(df)} unique vulnerabilities.")

if __name__ == "__main__":
    main()
