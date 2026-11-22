# Scanner ground truth (demo only)

This project is intentionally flawed for local scanner testing. All data is fake.


| ID | Expected finding | Evidence location | Suggested severity |
|---|---|---|
| QR-01 | PII in application logs | backend/app.py, apply_loan | High |
| QR-02 | Excessive borrower data returned by demo endpoint | backend/app.py, /api/borrowers | High |
| QR-03 | Consent state recorded but not enforced in demo flow | backend/app.py, apply_loan | High |
| QR-04 | Demo secret hard-coded in config | backend/demo_config.py | High |
| QR-05 | No borrower deletion endpoint | backend routes | Medium |
| QR-06 | Excessive collection in loan application form | frontend/src/App.jsx | Medium |
| QR-07 | Simulated permissions unrelated to loan purpose | frontend/src/App.jsx | High |
| QR-08 | Third-party sharing represented without disclosure workflow | backend/app.py | High |
| QR-09 | Sensitive fields shown unmasked in admin view | frontend/src/App.jsx | Medium |
| QR-10 | Retention duration not defined | backend/app.py | Medium |

Severity is illustrative. Static findings are potential issues, not legal conclusions. The app is a local demo and never requests real device permissions or sends data to external recipients.
