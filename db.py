import sqlite3
import os

DB_PATH = "data/vulnerabilities.db"

def init_db():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Create the vulnerabilities table with 'evidence' after 'description'
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vulnerabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT UNIQUE,
        severity TEXT,
        cvss_score TEXT,
        cvss_vector TEXT,
        description TEXT,
        evidence TEXT,
        recommendation TEXT,
        reference TEXT
    )
    """)

    # Populate only if empty
    cur.execute("SELECT COUNT(*) FROM vulnerabilities")
    if cur.fetchone()[0] == 0:
        insert_default_vulnerabilities(cur)

    conn.commit()
    conn.close()


def get_all_vulnerabilities():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT title, severity FROM vulnerabilities ORDER BY severity DESC")
    rows = cur.fetchall()
    conn.close()
    return [{"title": row[0], "severity": row[1]} for row in rows]


def get_full_vulnerability(title):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM vulnerabilities WHERE title = ?", (title,))
    row = cur.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "title": row[1],
            "severity": row[2],
            "cvss_score": row[3],
            "cvss_vector": row[4],
            "description": row[5],
            "evidence": row[6],
            "recommendation": row[7],
            "reference": row[8]
        }
    return {}


def insert_default_vulnerabilities(cur):
    default_data = [
        ("Broken Access Control", "High", "8.2", "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
         "Access control failures typically lead to unauthorized access.",
         "",  # Evidence
         "Implement robust access control mechanisms.",
         "https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control/"),

        ("SQL Injection", "Critical", "9.1", "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
         "SQL injection allows attackers to interfere with queries.",
         "",
         "Use parameterized queries or stored procedures.",
         "https://owasp.org/www-community/attacks/SQL_Injection"),

        ("XSS - Stored", "High", "7.4", "CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N",
         "Stored XSS allows input to be stored and executed later.",
         "",
         "Sanitize user inputs and use CSP.",
         "https://owasp.org/www-community/attacks/xss/")
    ]

    for vuln in default_data:
        cur.execute("""
            INSERT OR IGNORE INTO vulnerabilities
            (title, severity, cvss_score, cvss_vector, description, evidence, recommendation, reference)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, vuln)
