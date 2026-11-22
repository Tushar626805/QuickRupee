from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import sqlite3
import os

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "quickrupee.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


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
        conn.executemany("""
            INSERT INTO borrowers
            (id, name, phone, email, pan, loan, income, address, dob,
             status, consent, demo_third_party_share_flag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1001, "Aarav Demo", "9000000001", "aarav@example.test",
             "ABCDE0001F", 10000, 0, "", "", "Under review", 0, 0),
            (1002, "Meera Sample", "9000000002", "meera@example.test",
             "ABCDE0002F", 15000, 0, "", "", "Approved", 1, 0),
            (1003, "Kabir Fiction", "9000000003", "kabir@example.test",
             "ABCDE0003F", 8000, 0, "", "", "Pending documents", 0, 0)
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
        item["demo_third_party_share_flag"] = bool(
            item["demo_third_party_share_flag"]
        )
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
    return jsonify(get_all_borrowers())


@app.post("/api/apply")
def apply_loan():
    data = request.get_json(silent=True) or {}

    logging.info("Demo loan application received")

    try:
        loan = int(data.get("loan", 10000))
        income = int(data.get("income", 0) or 0)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Invalid loan or income"}), 400

    record = (
        data.get("name", "Demo User"),
        data.get("phone", "9000000099"),
        data.get("email", "demo@example.test"),
        data.get("pan", "ABCDE0099F"),
        loan,
        income,
        data.get("address", ""),
        data.get("dob", ""),
        "Under review",
        int(bool(data.get("consent", False))),
        1
    )

    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO borrowers
        (name, phone, email, pan, loan, income, address, dob,
         status, consent, demo_third_party_share_flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, record)

    application_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Demo application submitted",
        "application_id": application_id
    }), 201


@app.get("/api/demo-permissions")
def demo_permissions():
    return jsonify({
        "contacts": "simulated requested",
        "photos_media": "simulated requested",
        "location": "simulated requested",
        "actual_device_access": False
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
