# QuickRupee - Deliberately Vulnerable Loan App Demo

A fictional, local-only fintech demo for testing a DPDP/privacy scanner. All records are synthetic. The app **does not** access device contacts, photos, location, SMS, make real loans, send messages, or contact external services.


## Requirements
- Node.js 20.19+ (or 22.12+)
- Python 3.10+

## Run backend (Windows PowerShell)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
Backend: http://127.0.0.1:5000


## Run frontend (Windows PowerShell, new terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally http://localhost:5173

## Scanner test notes
See `SCANNER_TEST_CASES.md` for ground truth. Vulnerabilities are intentionally represented using synthetic data and simulated permission indicators. Run only locally; do not deploy publicly.
