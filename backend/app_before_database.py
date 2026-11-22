from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from demo_config import DEMO_API_SECRET


app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Synthetic-only records. Never use real borrower information in this demo.
borrowers = [
    {"id": 1001, "name": "Aarav Demo", "phone": "9000000001", "email": "aarav@example.test", "pan": "ABCDE0001F", "loan": 10000, "status": "Under review", "consent": False},
    {"id": 1002, "name": "Meera Sample", "phone": "9000000002", "email": "meera@example.test", "pan": "ABCDE0002F", "loan": 15000, "status": "Approved", "consent": True},
    {"id": 1003, "name": "Kabir Fiction", "phone": "9000000003", "email": "kabir@example.test", "pan": "ABCDE0003F", "loan": 8000, "status": "Pending documents", "consent": False},
]


@app.get("/")
def home():
    return jsonify({"app": "QuickRupee Demo API", "notice": "Fictional local scanner target; synthetic data only."})


@app.get("/api/borrowers")
def get_borrowers():
    # QR-02: intentionally excessive personal-data exposure in this demo endpoint.
    return jsonify(borrowers)


@app.post("/api/apply")
def apply_loan():
    data = request.get_json(silent=True) or {}
    # QR-01: deliberately logs synthetic personal data for scanner detection.
    logging.info("Loan application: name=%s email=%s phone=%s pan=%s", data.get("name"), data.get("email"), data.get("phone"), data.get("pan"))
    # QR-03: consent field is accepted but not enforced before processing in this demo.
    record = {"id": 1000 + len(borrowers) + 1, "name": data.get("name", "Demo User"), "phone": data.get("phone", "9000000099"), "email": data.get("email", "demo@example.test"), "pan": data.get("pan", "ABCDE0099F"), "loan": int(data.get("loan", 10000)), "income": int(data.get("income", 0) or 0), "address": data.get("address", ""), "dob": data.get("dob", ""), "status": "Under review", "consent": bool(data.get("consent", False))}
    borrowers.append(record)
    # QR-08: simulated sharing flag; no outbound request is made.
    record["demo_third_party_share_flag"] = True
    return jsonify({"success": True, "message": "Demo application submitted", "application_id": record["id"]}), 201


@app.get("/api/demo-permissions")
def demo_permissions():
    # Simulated only. No operating-system permissions are requested.
    return jsonify({"contacts": "simulated requested", "photos_media": "simulated requested", "location": "simulated requested", "actual_device_access": False})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
