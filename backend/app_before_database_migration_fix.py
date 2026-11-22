from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import sqlite3
import os

app = Flask(__name__)
# Intentionally permissive configuration for the local scanner demonstration.
CORS(app)
logging.basicConfig(level=logging.INFO)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "quickrupee.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn



def calculate_emi(principal, annual_rate, months):
    principal = float(principal)
    monthly_rate = float(annual_rate) / 12 / 100
    if months <= 0:
        return 0.0
    if monthly_rate == 0:
        return round(principal / months, 2)
    factor = (1 + monthly_rate) ** months
    return round(principal * monthly_rate * factor / (factor - 1), 2)


def migrate_loan_terms(conn):
    existing = {row[1] for row in conn.execute("PRAGMA table_info(borrowers)").fetchall()}
    additions = {
        "duration_months": "INTEGER DEFAULT 6",
        "annual_interest_rate": "REAL DEFAULT 12",
        "emi": "REAL DEFAULT 0",
        "total_repayment": "REAL DEFAULT 0",
        "total_interest": "REAL DEFAULT 0"
    }
    for column, definition in additions.items():
        if column not in existing:
            conn.execute(f"ALTER TABLE borrowers ADD COLUMN {column} {definition}")
    rows = conn.execute("SELECT id, loan, duration_months, annual_interest_rate FROM borrowers").fetchall()
    for row in rows:
        months = row["duration_months"] or 6
        rate = row["annual_interest_rate"] or 12
        emi = calculate_emi(row["loan"] or 0, rate, months)
        total = round(emi * months, 2)
        conn.execute("UPDATE borrowers SET duration_months=?, annual_interest_rate=?, emi=?, total_repayment=?, total_interest=? WHERE id=?",
                     (months, rate, emi, total, round(total - (row["loan"] or 0), 2), row["id"]))


def initialize_database():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS borrowers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            email TEXT,
            pan TEXT,
            loan INTEGER DEFAULT 0,
            income INTEGER DEFAULT 0,
            address TEXT DEFAULT '',
            dob TEXT DEFAULT '',
            status TEXT DEFAULT 'Under review',
            consent INTEGER DEFAULT 0,
            demo_third_party_share_flag INTEGER DEFAULT 0
        )
    """)
    if conn.execute("SELECT COUNT(*) FROM borrowers").fetchone()[0] == 0:
        conn.executemany("""\n            INSERT INTO borrowers
            (id, name, phone, email, pan, loan, income, address, dob,
             status, consent, demo_third_party_share_flag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1001, "Aarav Demo", "9000000001", "aarav@example.test", "ABCDE0001F", 10000, 0, "", "", "Under review", 0, 0),
            (1002, "Meera Sample", "9000000002", "meera@example.test", "ABCDE0002F", 15000, 0, "", "", "Approved", 1, 0),
            (1003, "Kabir Fiction", "9000000003", "kabir@example.test", "ABCDE0003F", 8000, 0, "", "", "Pending documents", 0, 0)
        ])
    conn.commit()
    conn.close()



def get_all_borrowers():
    conn = get_db()
    rows = conn.execute("SELECT * FROM borrowers ORDER BY id").fetchall()
    conn.close()
    result = []
    for row in rows:
        item = dict(row)
        item["consent"] = bool(item["consent"])
        item["demo_third_party_share_flag"] = bool(item["demo_third_party_share_flag"])
        result.append(item)
    return result


initialize_database()


@app.get("/")
def home():
    return jsonify({
        "app": "QuickRupee Demo API",
        "notice": "Fictional local scanner target; synthetic data only."
    })



@app.get("/api/borrowers")
def get_borrowers():
    # Intentionally exposed for scanner testing: no authentication and full-record response.
    return jsonify(get_all_borrowers())



@app.post("/api/apply")
def apply_loan():
    data = request.get_json(silent=True) or {}
    logging.info("Demo loan application received")
    try:
        loan = int(data.get("loan", 10000))
        income = int(data.get("income", 0) or 0)
        months = int(data.get("duration_months", 6) or 6)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Invalid loan, income, or duration"}), 400
    if months not in (1, 3, 6, 9, 12):
        return jsonify({"success": False, "message": "Choose a supported loan duration"}), 400
    annual_rate = 12.0
    emi = calculate_emi(loan, annual_rate, months)
    total_repayment = round(emi * months, 2)
    total_interest = round(total_repayment - loan, 2)
    # Fictional automated review; no real credit checks or external services.
    if income > 0 and loan <= income * 0.5:
        status = "Approved"
    elif income <= 0:
        status = "Under review"
    else:
        status = "Rejected"
    record = (
        data.get("name", "Demo User"), data.get("phone", "9000000099"),
        data.get("email", "demo@example.test"), data.get("pan", "ABCDE0099F"),
        loan, income, data.get("address", ""), data.get("dob", ""), status,
        int(bool(data.get("consent", False))), 1, months, annual_rate, emi,
        total_repayment, total_interest
    )
    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO borrowers
        (name, phone, email, pan, loan, income, address, dob, status, consent,
         demo_third_party_share_flag, duration_months, annual_interest_rate, emi,
         total_repayment, total_interest)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, record)
    application_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({
        "success": True, "message": "Demo application reviewed automatically",
        "application_id": application_id, "status": status,
        "duration_months": months, "annual_interest_rate": annual_rate,
        "emi": emi, "total_repayment": total_repayment,
        "total_interest": total_interest
    }), 201



@app.get("/api/borrowers/<int:borrower_id>/repayment-schedule")
def repayment_schedule(borrower_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM borrowers WHERE id=?", (borrower_id,)).fetchone()
    conn.close()
    if row is None:
        return jsonify({"success": False, "message": "Application not found"}), 404
    months = int(row["duration_months"] or 6)
    rate = float(row["annual_interest_rate"] or 12)
    emi = float(row["emi"] or calculate_emi(row["loan"], rate, months))
    return jsonify({
        "application_id": borrower_id, "status": row["status"],
        "duration_months": months, "annual_interest_rate": rate,
        "emi": emi, "total_repayment": row["total_repayment"],
        "schedule": [{"installment": n, "amount": emi} for n in range(1, months + 1)]
    })



@app.get("/api/demo-permissions")
def demo_permissions():
    # Permission requests are descriptive only; this server does not access device data.
    return jsonify({
        "contacts": "simulated requested",
        "photos_media": "simulated requested",
        "location": "simulated requested",
        "actual_device_access": False
    })



@app.get("/api/demo/privacy-exposure")
def privacy_exposure_demo():
    # Synthetic privacy-risk example for a scanner/demo dashboard.
    return jsonify({
        "scenario": "synthetic_privacy_exposure",
        "warning": "Simulation only. No real contacts or device data are accessed.",
        "collected_categories": ["profile", "phone", "email", "loan_details", "location_permission_request", "contacts_permission_request"],
        "purpose_declared": "Loan processing",
        "purpose_simulated": "Broad data collection demonstration",
        "consent_enforced": False
    })



@app.get("/api/demo/recovery-threats")
def recovery_threats_demo():
    # Mock coercive recovery content; it is not sent to anyone.
    return jsonify({
        "simulation": True,
        "actual_messages_sent": False,
        "synthetic_contact_names": ["Demo Contact One", "Demo Contact Two", "Demo Contact Three"],
        "mock_messages": [
            "SIMULATION: Threat to contact your acquaintances about an overdue loan.",
            "SIMULATION: Threat to disclose private borrower information.",
            "SIMULATION: Intimidating repayment demand with fabricated urgency."
        ],
        "risk_labels": ["coercion", "privacy misuse", "harassment"]
    })



@app.get("/api/demo/scanner-ground-truth")
def scanner_ground_truth():
    # A reference list for the demo; the scanner should independently identify issues.
    return jsonify({
        "demo_only": True,
        "known_findings": [
            {"id": "QR-02", "title": "Excessive borrower data exposure", "endpoint": "/api/borrowers"},
            {"id": "QR-03", "title": "Consent is not enforced", "endpoint": "/api/apply"},
            {"id": "QR-13", "title": "Borrower endpoint lacks authentication", "endpoint": "/api/borrowers"},
            {"id": "QR-30", "title": "No request rate limiting", "scope": "API"},
            {"id": "QR-52", "title": "Permissive CORS configuration", "scope": "API"},
            {"id": "QR-62", "title": "Debug mode enabled", "scope": "local development"}
        ]
    })



if __name__ == "__main__":
    # Debug is intentionally enabled for the local scanner target. Keep this server local.
    app.run(host="127.0.0.1", port=5000, debug=True)
