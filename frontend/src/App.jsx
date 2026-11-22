
import React, { useEffect, useState } from 'react';
import './style.css';

const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

const demoRecords = [
  {
    id: 101,
    name: 'Aarav Mehta',
    email: 'aarav.demo@example.test',
    phone: '9000000101',
    pan: 'ABCDE0001X',
    loan: 10000,
    status: 'Review'
  },
  {
    id: 102,
    name: 'Isha Verma',
    email: 'isha.demo@example.test',
    phone: '9000000102',
    pan: 'ABCDE0002X',
    loan: 15000,
    status: 'Approved'
  },
  {
    id: 103,
    name: 'Kabir Rao',
    email: 'kabir.demo@example.test',
    phone: '9000000103',
    pan: 'ABCDE0003X',
    loan: 5000,
    status: 'Pending'
  }
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [records, setRecords] = useState(demoRecords);
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    address: '',
    dob: '',
    income: '',
    loan: '10000',
    consent: false
  });

  // Local date in YYYY-MM-DD format
  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/borrowers')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length) setRecords(d);
      })
      .catch(() => {});
  }, []);

  const nav = [
    ['overview', 'Overview', '⌂'],
    ['apply', 'Apply for loan', '＋'],
    ['records', 'Borrower records', '▤'],
    ['repayment', 'Repayment', '↻']
  ];

  function submit() {
    setNotice(
      'Demo application submitted successfully · QR-DEMO-' +
      Math.floor(1000 + Math.random() * 9000)
    );
    setPage('overview');
    setStep(1);
  }

  function validatePersonalDetails() {
    setNotice('');

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.pan.trim() ||
      !form.dob ||
      !form.address.trim()
    ) {
      setNotice('Please complete all personal details before continuing.');
      return false;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) {
      setNotice('Please enter a valid PAN format (AAAAA9999A).');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setNotice('Please enter a valid 10-digit mobile number.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setNotice('Please enter a valid email address.');
      return false;
    }

    if (form.dob > today) {
      setNotice('Date of birth cannot be in the future.');
      return false;
    }

    const birthDate = new Date(`${form.dob}T00:00:00`);
    const currentDate = new Date();

    let age =
      currentDate.getFullYear() - birthDate.getFullYear();

    const birthdayPassed =
      currentDate.getMonth() > birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() &&
        currentDate.getDate() >= birthDate.getDate());

    if (!birthdayPassed) age--;

    if (age < 18) {
      setNotice('Applicant must be at least 18 years old.');
      return false;
    }

    setNotice('');
    return true;
  }

  const title =
    nav.find(n => n[0] === page)?.[1] || 'QuickRupee';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <strong>QuickRupee</strong>
            <small>DEMO FINANCE</small>
          </div>
        </div>

        <p className="nav-caption">WORKSPACE</p>

        {nav.map(([id, label, icon]) => (
          <button
            key={id}
            className={'nav-item ' + (page === id ? 'selected' : '')}
            onClick={() => {
              setPage(id);
              setNotice('');
            }}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        <div className="sidebar-bottom">
          <span className="sim-badge">● DEMO MODE</span>
          <small>
            Fictional app
            <br />
            Demo account
          </small>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <div className="eyebrow">DIGITAL FINANCE</div>
            <h1>
              {page === 'overview'
                ? 'Your loan dashboard'
                : title}
            </h1>
            <p className="sub">
              A simple digital lending experience
            </p>
          </div>

          <div className="user-chip">
            <div className="avatar">QD</div>
            <span>Demo User</span>
            <span className="chevron">⌄</span>
          </div>
        </header>

        {notice && (
          <div className="notice">
            <span className="notice-icon">!</span>
            <div>
              <b>Notification</b>
              <p>{notice}</p>
            </div>
          </div>
        )}

        {/* OVERVIEW */}
        {page === 'overview' && (
          <>
            <div className="metrics">
              <div className="metric">
                <span>AVAILABLE LOAN RANGE</span>
                <b>₹5K – ₹50K</b>
                <small>Flexible loan options</small>
              </div>

              <div className="metric">
                <span>APPLICATIONS</span>
                <b>{records.length}</b>
                <small>Application records</small>
              </div>

              <div className="metric">
                <span>PROCESS</span>
                <b>Simple &amp; Digital</b>
                <small>Apply in a few steps</small>
              </div>
            </div>

            <section className="hero">
              <div className="hero-copy">
                <span className="tag">
                  QUICK · SIMPLE · DIGITAL
                </span>

                <h2>
                  Money when you need it.
                  <br />
                  <em>Simple as that.</em>
                </h2>

                <p>
                  Explore convenient loan options and complete
                  your application in just a few simple steps.
                </p>

                <button
                  className="btn-primary"
                  onClick={() => {
                    setPage('apply');
                    setStep(1);
                    setNotice('');
                  }}
                >
                  Start application <span>→</span>
                </button>

                <div className="hero-footnote">
                  Simple application · Easy process · Demo account
                </div>
              </div>

              <div className="hero-visual">
                <div className="orb orb-a" />
                <div className="orb orb-b" />

                <div className="offer-card">
                  <div className="offer-top">
                    <span>QUICKRUPEE OFFER</span>
                    <span className="offer-symbol">↗</span>
                  </div>

                  <div className="offer-amount">₹10,000</div>
                  <small>Example loan amount</small>

                  <div className="offer-divider" />

                  <div className="offer-row">
                    <span>Illustrative APR</span>
                    <strong>18%*</strong>
                  </div>

                  <div className="offer-row">
                    <span>Tenure</span>
                    <strong>6 months</strong>
                  </div>
                </div>

                <div className="float-note">
                  <span className="check">✓</span>
                  <div>
                    <small>Application status</small>
                    <b>Ready to apply</b>
                  </div>
                </div>
              </div>
            </section>

            <section className="section-title">
              <div>
                <h2>Explore QuickRupee</h2>
                <p>Choose an area of your account</p>
              </div>
            </section>

            <div className="action-grid">
              {[
                [
                  'apply',
                  '＋',
                  'Apply for a loan',
                  'Explore available loan options'
                ],
                [
                  'records',
                  '▤',
                  'Application records',
                  'View application details'
                ],
                [
                  'repayment',
                  '↻',
                  'Repayment overview',
                  'View repayment schedule'
                ]
              ].map(([p, icon, name, desc]) => (
                <button
                  className="action-card"
                  onClick={() => {
                    setPage(p);
                    setNotice('');
                  }}
                  key={p}
                >
                  <span className="action-icon">{icon}</span>
                  <b>{name}</b>
                  <small>{desc}</small>
                  <span className="action-arrow">↗</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* APPLY FOR LOAN */}
        {page === 'apply' && (
          <section className="surface application">
            <div className="surface-head">
              <div>
                <h2>Personal loan application</h2>
                <p>Complete your application in a few simple steps.</p>
              </div>
              <span className="demo-label">DEMO ACCOUNT</span>
            </div>

            <div className="stepper">
              <div className={'step ' + (step >= 1 ? 'done' : '')}>
                <span>1</span>Personal details
              </div>
              <i />
              <div className={'step ' + (step >= 2 ? 'done' : '')}>
                <span>2</span>Loan details
              </div>
              <i />
              <div className={'step ' + (step >= 3 ? 'done' : '')}>
                <span>3</span>Review
              </div>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="form-grid">
                {[
                  ['name', 'Full name', 'text'],
                  ['email', 'Email address', 'email'],
                  ['phone', 'Phone number', 'tel'],
                  ['dob', 'Date of birth', 'date'],
                  ['pan', 'PAN number', 'text'],
                  ['address', 'Address', 'text']
                ].map(([k, l, t]) => (
                  <label key={k}>
                    {l}

                    <input
                      type={t}
                      max={k === 'dob' ? today : undefined}
                      maxLength={k === 'pan' ? 10 : undefined}
                      placeholder={
                        t === 'date'
                          ? ''
                          : k === 'pan'
                            ? 'ABCDE1234F'
                            : 'Enter ' + l.toLowerCase()
                      }
                      value={form[k]}
                      onChange={e => {
                        let value = e.target.value;

                        if (k === 'pan') {
                          value = value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, '')
                            .slice(0, 10);
                        }

                        if (k === 'phone') {
                          value = value
                            .replace(/\D/g, '')
                            .slice(0, 10);
                        }

                        setForm({
                          ...form,
                          [k]: value
                        });
                      }}
                    />
                  </label>
                ))}

                <div className="form-actions">
                  <small>
                    Please enter your details to continue.
                  </small>

                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (validatePersonalDetails()) {
                        setStep(2);
                      }
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="form-grid">
                <label>
                  Monthly income (₹)
                  <input
                    type="number"
                    min="0"
                    value={form.income}
                    onChange={e =>
                      setForm({
                        ...form,
                        income: e.target.value
                      })
                    }
                    placeholder="e.g. 25000"
                  />
                </label>

                <label>
                  Requested loan amount
                  <select
                    value={form.loan}
                    onChange={e =>
                      setForm({
                        ...form,
                        loan: e.target.value
                      })
                    }
                  >
                    {[
                      '5000',
                      '10000',
                      '15000',
                      '25000',
                      '50000'
                    ].map(v => (
                      <option key={v} value={v}>
                        {money(v)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={e =>
                      setForm({
                        ...form,
                        consent: e.target.checked
                      })
                    }
                  />
                  I consent to processing synthetic information
                  for this demonstration.
                </label>

                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setStep(1);
                      setNotice('');
                    }}
                  >
                    ← Back
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => {
                      setNotice('');
                      setStep(3);
                    }}
                  >
                    Review →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="review-box">
                <h3>Review your application</h3>

                <p>
                  <b>Applicant:</b>{' '}
                  {form.name || 'Demo Applicant'}
                </p>

                <p>
                  <b>Requested amount:</b> {money(form.loan)}
                </p>

                <p>
                  <b>Monthly income:</b>{' '}
                  {form.income ? money(form.income) : 'Not provided'}
                </p>

                <p>
                  <b>PAN:</b> {form.pan}
                </p>

                <p>
                  <b>Date of birth:</b> {form.dob}
                </p>

                <p>
                  <b>Consent:</b>{' '}
                  {form.consent
                    ? 'Demo consent checked'
                    : 'Not checked'}
                </p>

                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setStep(2);
                      setNotice('');
                    }}
                  >
                    ← Back
                  </button>

                  <button
                    className="btn-primary"
                    onClick={submit}
                  >
                    Submit application ✓
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* BORROWER RECORDS */}
        {page === 'records' && (
          <section className="surface">
            <div className="surface-head">
              <div>
                <h2>Application records</h2>
                <p>View application information and status.</p>
              </div>

              <button
                className="btn-secondary"
                onClick={() => setRecords(demoRecords)}
              >
                ↻ Reset samples
              </button>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>REFERENCE</th>
                    <th>APPLICANT</th>
                    <th>CONTACT</th>
                    <th>PAN</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id || i}>
                      <td>QR-{r.id}</td>
                      <td><b>{r.name}</b></td>
                      <td>
                        {r.email}
                        <br />
                        {r.phone}
                      </td>
                      <td>{r.pan || '—'}</td>
                      <td>{money(r.loan)}</td>
                      <td>
                        <span className="status-pill">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* REPAYMENT */}
        {page === 'repayment' && (
          <section className="surface">
            <div className="surface-head">
              <div>
                <h2>Repayment overview</h2>
                <p>Track your loan and upcoming instalments.</p>
              </div>
              <span className="demo-label">DEMO ACCOUNT</span>
            </div>

            <div className="repay-summary">
              <div>
                <small>Outstanding balance</small>
                <b>₹8,333</b>
                <span>Illustrative balance</span>
              </div>

              <div>
                <small>Next instalment</small>
                <b>₹1,833</b>
                <span>Demo due date · 05 Dec 2026</span>
              </div>

              <div>
                <small>Loan status</small>
                <b>Active</b>
                <span>Demo account</span>
              </div>
            </div>

            <h3 className="table-title">Payment schedule</h3>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>INSTALMENT</th>
                    <th>DUE DATE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <tr key={n}>
                      <td>#{n}</td>
                      <td>
                        {[
                          '05 Dec 2026',
                          '05 Jan 2027',
                          '05 Feb 2027',
                          '05 Mar 2027',
                          '05 Apr 2027',
                          '05 May 2027'
                        ][n - 1]}
                      </td>
                      <td>₹1,833</td>
                      <td>
                        <span
                          className={
                            n === 1
                              ? 'status-pill'
                              : 'status-muted'
                          }
                        >
                          {n === 1 ? 'Upcoming' : 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer>
          QuickRupee · Demo account
        </footer>
      </main>
    </div>
  );
}
