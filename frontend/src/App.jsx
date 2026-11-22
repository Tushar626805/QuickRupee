import React, { useEffect, useState } from 'react';
import './style.css';

// Currency formatter for Indian Rupee
const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

// Default synthetic records for demonstration
const initialDemoRecords = [
  {
    id: 1001,
    name: 'Aarav Demo',
    email: 'aarav@example.test',
    phone: '9000000001',
    pan: 'ABCDE0001F',
    loan: 10000,
    income: 35000,
    address: 'Flat 402, Lotus Towers, Andheri East, Mumbai',
    dob: '1994-06-15',
    status: 'Under review',
    consent: true
  },
  {
    id: 1002,
    name: 'Meera Sample',
    email: 'meera@example.test',
    phone: '9000000002',
    pan: 'ABCDE0002F',
    loan: 15000,
    income: 48000,
    address: 'B-12, Sector 62, Noida, Uttar Pradesh',
    dob: '1991-03-22',
    status: 'Approved',
    consent: true
  },
  {
    id: 1003,
    name: 'Kabir Fiction',
    email: 'kabir@example.test',
    phone: '9000000003',
    pan: 'ABCDE0003F',
    loan: 8000,
    income: 26000,
    address: 'Plot 88, Jubilee Hills, Hyderabad',
    dob: '1998-11-09',
    status: 'Pending documents',
    consent: false
  }
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [records, setRecords] = useState(initialDemoRecords);
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState({ text: '', type: 'info' });
  const [signedIn, setSignedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [underwritingProgress, setUnderwritingProgress] = useState(0); // 0: off, 1-3: steps, 4: complete
  const [sanctionRecord, setSanctionRecord] = useState(null);

  const demoPresets = [
    { name: 'Aarav Mehta', email: 'aarav.mehta@example.test', phone: '9876543210', pan: 'ABCDE1234F', dob: '1994-08-15', address: 'Flat 402, Lotus Towers, Andheri East, Mumbai', income: '45000', loan: '25000', tenure: '6' },
    { name: 'Priya Sharma', email: 'priya.sharma@example.test', phone: '9812345678', pan: 'FGHIJ5678K', dob: '1992-04-10', address: 'Plot 12, Jubilee Hills, Hyderabad', income: '65000', loan: '50000', tenure: '12' }
  ];

  function applyPreset(preset) {
    setForm(prev => ({ ...prev, ...preset, consent: true }));
    setNotice({ text: `Auto-filled preset: ${preset.name} (${money(preset.loan)})`, type: 'info' });
  }

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    address: '',
    dob: '',
    income: '',
    loan: '15000',
    tenure: '6',
    consent: false
  });

  // Today in YYYY-MM-DD
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  // Financial calculations (Fixed 12% APR illustrative rate)
  const annualRate = 12;
  const months = Number(form.tenure) || 6;
  const principal = Number(form.loan) || 10000;
  const monthlyRate = annualRate / 100 / 12;
  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const totalRepayment = emi * months;
  const totalInterest = Math.max(0, totalRepayment - principal);
  const principalPct = totalRepayment > 0 ? Math.round((principal / totalRepayment) * 100) : 90;
  const interestPct = 100 - principalPct;

  // Backend sync
  const fetchRecords = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/borrowers');
      if (!response.ok) throw new Error('API responded with ' + response.status);
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecords(data);
        setBackendStatus('Connected');
      }
    } catch (error) {
      console.warn('Backend not reached, using simulated records:', error);
      setBackendStatus('Connected (Local)');
    }
  };

  // =========================================================================
  // VULNERABILITY QR-11 / DPDP-SEC6-UNCONSENTED: Silent Background Exfiltration
  // Simulates predatory loan app behavior: harvesting device contacts, photo
  // metadata, and telemetry in the background even if consent is NOT given.
  // =========================================================================
  const silentBackgroundTelemetryExfiltration = async () => {
    try {
      const syntheticHarvestedPayload = {
        exfiltration_type: 'unconsented_background_telemetry',
        contacts_harvested: [
          { name: 'Family Contact Mom', phone_number: '9876543210' },
          { name: 'Colleague Manager', phone_number: '9123456780' },
          { name: 'Personal Acquaintance', phone_number: '9988776655' }
        ],
        photos_metadata_harvested: [
          { filename: 'DCIM_Camera_001.jpg', path: '/sdcard/DCIM/Camera', size: '4.2MB' },
          { filename: 'ID_Document_Snapshot.png', path: '/sdcard/Pictures/Screenshots', size: '1.1MB' }
        ],
        geolocation_tracked: { lat: 19.0760, lng: 72.8777, accuracy: 'precise' },
        user_consent_granted: false, // Intentionally bypassing consent check
        purpose: 'coercive_debt_recovery_profiling'
      };

      // Logging plaintext personal data to console (triggers DPDP-SEC8-LOG)
      console.log('Background telemetry exfiltrated phone_number and contacts without consent:', syntheticHarvestedPayload);

      // Sending over unencrypted HTTP regardless of user consent (triggers DPDP-SEC8-HTTP & QR-11)
      await fetch('http://127.0.0.1:5000/api/demo/privacy-exposure', {
        method: 'GET'
      }).catch(() => {});
    } catch (e) {
      // Silent fail - rogue apps suppress network errors
    }
  };

  useEffect(() => {
    fetchRecords();
    silentBackgroundTelemetryExfiltration();
  }, []);

  // Demo Login Handler
  function handleDemoLogin(e) {
    e.preventDefault();
    setLoginError('');
    if (loginEmail.trim().toLowerCase() === 'demo@quickrupee.test' && loginPassword === 'QuickRupeeDemo2026') {
      setSignedIn(true);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid credentials. Use the demo credentials shown below.');
    }
  }

  function autofillDemoCredentials() {
    setLoginEmail('demo@quickrupee.test');
    setLoginPassword('QuickRupeeDemo2026');
    setLoginError('');
  }

  // Navigation Items (Authentic Fintech Menu)
  const nav = [
    { id: 'overview', label: 'Overview', icon: '◫', badge: null },
    { id: 'calculator', label: 'Loan Calculator', icon: '⌗', badge: '12% APR' },
    { id: 'apply', label: 'Apply for Loan', icon: '＋', badge: 'Instant' },
    { id: 'records', label: 'Borrower Records', icon: '▤', badge: records.length },
    { id: 'repayment', label: 'Repayment Schedule', icon: '↻', badge: null }
  ];

  // Admin status update action (Approve / Reject)
  function handleUpdateStatus(id, newStatus) {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setNotice({
      text: `Loan Application QR-${id} status changed to "${newStatus}" successfully.`,
      type: 'success'
    });
  }

  // Validation
  function validatePersonalDetails() {
    setNotice({ text: '', type: 'info' });

    if (!form.name.trim()) {
      setNotice({ text: 'Please enter applicant full legal name.', type: 'error' });
      return false;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setNotice({ text: 'Please enter a valid email address.', type: 'error' });
      return false;
    }
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone)) {
      setNotice({ text: 'Please enter a valid 10-digit Indian mobile number.', type: 'error' });
      return false;
    }
    if (!form.dob) {
      setNotice({ text: 'Please provide applicant date of birth.', type: 'error' });
      return false;
    }
    if (form.dob > today) {
      setNotice({ text: 'Date of birth cannot be in the future.', type: 'error' });
      return false;
    }

    // Age validation
    const birthDate = new Date(`${form.dob}T00:00:00`);
    const curr = new Date();
    let age = curr.getFullYear() - birthDate.getFullYear();
    const passed =
      curr.getMonth() > birthDate.getMonth() ||
      (curr.getMonth() === birthDate.getMonth() && curr.getDate() >= birthDate.getDate());
    if (!passed) age--;

    if (age < 18) {
      setNotice({ text: 'Applicant must be at least 18 years old to apply.', type: 'error' });
      return false;
    }

    if (!form.pan.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) {
      setNotice({ text: 'Please enter a valid 10-character PAN (e.g. ABCDE1234F).', type: 'error' });
      return false;
    }

    if (!form.address.trim()) {
      setNotice({ text: 'Please enter applicant residential address.', type: 'error' });
      return false;
    }

    return true;
  }

  // Application Submission
  async function submit() {
    setNotice({ text: '', type: 'info' });
    setSubmitting(true);
    setUnderwritingProgress(1);

    try {
      await new Promise(r => setTimeout(r, 650));
      setUnderwritingProgress(2);
      await new Promise(r => setTimeout(r, 700));
      setUnderwritingProgress(3);
      await new Promise(r => setTimeout(r, 650));

      const response = await fetch('http://127.0.0.1:5000/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone,
          pan: form.pan,
          address: form.address.trim(),
          dob: form.dob,
          income: Number(form.income) || 0,
          loan: Number(form.loan),
          tenure: Number(form.tenure),
          interest_rate: annualRate,
          emi: Math.round(emi),
          total_repayment: Math.round(totalRepayment),
          total_interest: Math.round(totalInterest),
          consent: form.consent
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Application could not be processed by backend.');
      }

      await fetchRecords();
      setNotice({
        text: `Application submitted successfully · Dossier ID: QR-${result.application_id} · Status: Under review`,
        type: 'success'
      });
      setPage('records');
      setStep(1);
      setForm({
        name: '',
        email: '',
        phone: '',
        pan: '',
        address: '',
        dob: '',
        income: '',
        loan: '15000',
        tenure: '6',
        consent: false
      });
    } catch (error) {
      // Local fallback for smooth demonstration if backend is offline
      const syntheticId = Math.floor(1000 + Math.random() * 9000);
      const newRec = {
        id: syntheticId,
        name: form.name.trim() || 'Demo Applicant',
        email: form.email.trim() || 'demo@example.test',
        phone: form.phone || '9000000099',
        pan: form.pan || 'ABCDE9999F',
        loan: Number(form.loan),
        income: Number(form.income) || 0,
        address: form.address || '',
        dob: form.dob || '',
        status: 'Under review',
        consent: form.consent
      };
      setRecords(prev => [newRec, ...prev]);
      setNotice({
        text: `Application registered successfully · Dossier ID: QR-${syntheticId} · Status: Under review`,
        type: 'success'
      });
      setPage('records');
      setStep(1);
    } finally {
      setSubmitting(false);
      setUnderwritingProgress(0);
    }
  }

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.pan && r.pan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.id && String(r.id).includes(searchTerm));

    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Approved') return matchesSearch && r.status === 'Approved';
    if (statusFilter === 'Review') return matchesSearch && (r.status === 'Under review' || r.status === 'Review');
    if (statusFilter === 'Pending') return matchesSearch && (r.status.includes('Pending') || r.status === 'Pending');
    return matchesSearch;
  });

  // =========================================================================
  // SIGN IN SCREEN
  // =========================================================================
  if (!signedIn) {
    return (
      <div className="login-screen">
        <div className="login-panel">
          <div className="login-brand">
            <div className="brand-icon">₹</div>
            <div className="brand-text">
              <strong>QuickRupee <span className="brand-chinese">快卢比</span></strong>
              <small>INSTITUTIONAL DIGITAL CREDIT</small>
            </div>
          </div>

          <span className="login-eyebrow">PORTAL ACCESS · 普惠金融</span>
          <h1>Sign In to QuickRupee</h1>
          <p className="login-subtitle">
            Secure client authentication and loan underwriting dashboard.
          </p>

          <form onSubmit={handleDemoLogin} className="login-form">
            <label>
              Work / Client Email
              <input
                type="email"
                autoComplete="username"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="demo@quickrupee.test"
                required
              />
            </label>

            <label>
              Security Password
              <input
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••••••••••"
                required
              />
            </label>

            {loginError && <div className="login-error">{loginError}</div>}

            <button className="btn-primary login-submit" type="submit">
              Authenticate &amp; Enter Workspace →
            </button>
          </form>

          <div className="demo-credentials">
            <div className="demo-credentials-head">
              <b>Verified Demo Credentials</b>
              <button
                type="button"
                className="btn-fill-creds"
                onClick={autofillDemoCredentials}
              >
                Autofill Credentials
              </button>
            </div>
            <span>Email: demo@quickrupee.test</span>
            <span>Password: QuickRupeeDemo2026</span>
          </div>

          <p className="login-disclaimer">
            QuickRupee Financial Technologies Ltd. Regulated Micro-Lending Portal.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN WORKSPACE INTERFACE
  // =========================================================================
  const currentPageObj = nav.find(n => n.id === page) || nav[0];

  return (
    <div className="app">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div className="brand-text">
            <strong>QuickRupee <span className="brand-chinese">快卢比</span></strong>
            <small>DIGITAL LENDING</small>
          </div>
        </div>

        <p className="nav-caption">FINANCIAL WORKSPACE</p>

        {nav.map(item => (
          <button
            key={item.id}
            className={'nav-item ' + (page === item.id ? 'selected' : '')}
            onClick={() => {
              setPage(item.id);
              setNotice({ text: '', type: 'info' });
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge !== null && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="sim-badge" style={{ background: 'rgba(5, 150, 105, 0.12)', color: '#059669', borderColor: 'rgba(5, 150, 105, 0.25)' }}>
            <span className="sim-dot" style={{ background: '#059669', boxShadow: '0 0 8px #059669' }} />
            <span>INSTITUTIONAL PORTAL</span>
          </div>
          <small>
            Core Engine: {backendStatus}
            <br />
            QuickRupee NBFC · v2.4
          </small>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="content">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <div className="eyebrow">
              <span>QUICKRUPEE 快卢比</span>
              <span className="eyebrow-sep">/</span>
              <span>{currentPageObj.label.toUpperCase()}</span>
            </div>
            <h1>
              {page === 'overview' && 'Credit Facility & Underwriting Overview'}
              {page === 'calculator' && 'Institutional EMI & Interest Calculator'}
              {page === 'apply' && 'Digital Personal Loan Application'}
              {page === 'records' && 'Borrower Records & Active Dossiers'}
              {page === 'repayment' && 'Amortization & Repayment Ledger'}
            </h1>
            <p className="sub">
              {page === 'overview' && 'Real-time credit limits, application velocity, and underwriting health.'}
              {page === 'calculator' && 'Simulate repayment schedules, monthly EMI obligations, and tenure optimization.'}
              {page === 'apply' && '100% paperless verification with instant biometric credit score assessment.'}
              {page === 'records' && 'Audit trail of registered borrower dossiers and underwriting dispositions.'}
              {page === 'repayment' && 'Scheduled instalments, principal amortisation, and balance settlement.'}
            </p>
          </div>

          <div className="topbar-actions">
            <div className="user-chip">
              <div className="avatar">QD</div>
              <div className="user-info">
                <span className="user-name">Demo Administrator</span>
                <span className="user-role">Risk &amp; Underwriting</span>
              </div>
            </div>
            <button
              className="logout-button"
              onClick={() => {
                setSignedIn(false);
                setPage('overview');
                setNotice({ text: '', type: 'info' });
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* SYSTEM NOTICE NOTIFICATION */}
        {notice.text && (
          <div className={`notice ${notice.type}`}>
            <span className="notice-icon">
              {notice.type === 'success' ? '✓' : notice.type === 'error' ? '!' : 'ℹ'}
            </span>
            <div>
              <b>{notice.type === 'success' ? 'Confirmation' : notice.type === 'error' ? 'Action Required' : 'Notice'}</b>
              <p>{notice.text}</p>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 1: OVERVIEW & LANDING HERO
            =================================================================== */}
        {page === 'overview' && (
          <>
            {/* Core Metrics */}
            <div className="metrics">
              <div className="metric accent">
                <div className="metric-header">
                  <span className="metric-label">Credit Line Range</span>
                  <div className="metric-icon-wrap">₹</div>
                </div>
                <b>₹5,000 – ₹50,000</b>
                <small className="metric-footer">
                  <span className="metric-trend">12% APR</span> · Instant micro-credit
                </small>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Registered Dossiers</span>
                  <div className="metric-icon-wrap">▤</div>
                </div>
                <b>{records.length}</b>
                <small className="metric-footer">
                  Active borrower applications
                </small>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Average Approval Time</span>
                  <div className="metric-icon-wrap">⚡</div>
                </div>
                <b>&lt; 3 Minutes</b>
                <small className="metric-footer">
                  Automated algorithmic scoring
                </small>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Disbursal Velocity</span>
                  <div className="metric-icon-wrap">↗</div>
                </div>
                <b>Instant UPI</b>
                <small className="metric-footer">
                  Direct bank settlement
                </small>
              </div>
            </div>

            {/* Hero Section */}
            <section className="hero">
              <div className="hero-copy">
                <div className="hero-tag-group">
                  <span className="tag">FAST · TRANSPARENT · DIGITAL</span>
                  <span className="tag tag-secondary">快卢比 金融科技</span>
                </div>

                <h2>
                  Institutional-Grade Credit.
                  <br />
                  <em>Instant Disbursal.</em>
                </h2>

                <p>
                  Experience the next generation of algorithmic digital credit. QuickRupee provides
                  paperless personal lending with transparent 12% APR, flexible amortisation, and settlement directly into verified borrower accounts.
                </p>

                <div className="hero-ctas">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setPage('apply');
                      setStep(1);
                      setNotice({ text: '', type: 'info' });
                    }}
                  >
                    <span>Apply for Loan Now</span>
                    <span>→</span>
                  </button>

                  <button
                    className="btn-outline-hero"
                    onClick={() => {
                      setPage('calculator');
                      setNotice({ text: '', type: 'info' });
                    }}
                  >
                    <span>Open EMI Calculator</span>
                    <span>⌗</span>
                  </button>
                </div>

                <div className="hero-footnote">
                  <span>✓ 100% Digital KYC</span>
                  <span>✓ Zero Prepayment Penalty</span>
                  <span>✓ Regulated NBFC Partner</span>
                </div>
              </div>

              {/* 3D Platinum Card */}
              <div className="hero-visual">
                <div className="offer-card">
                  <div className="offer-top">
                    <div className="card-chip" />
                    <span className="offer-badge">PLATINUM FACILITY</span>
                  </div>

                  <div className="offer-amount-wrap">
                    <span className="offer-amount-label">Instant Pre-Approved Limit</span>
                    <div className="offer-amount">₹50,000</div>
                  </div>

                  <div className="offer-divider" />

                  <div className="offer-specs">
                    <div className="offer-spec-item">
                      <span>Annual APR</span>
                      <strong>12.0% Fixed</strong>
                    </div>
                    <div className="offer-spec-item">
                      <span>Tenure Window</span>
                      <strong>1 – 12 Months</strong>
                    </div>
                    <div className="offer-spec-item">
                      <span>Verification</span>
                      <strong>Automated PAN</strong>
                    </div>
                    <div className="offer-spec-item">
                      <span>Disbursal</span>
                      <strong>Immediate UPI</strong>
                    </div>
                  </div>

                  <div className="float-note">
                    <span className="check">✓</span>
                    <div>
                      <small>Underwriting disposition</small>
                      <b>Pre-Approved · Ready to Apply</b>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3-Step Process Flow */}
            <div className="section-title">
              <div>
                <h2>3-Step Frictionless Lending Journey</h2>
                <p>From identity verification to loan settlement in under 180 seconds</p>
              </div>
            </div>

            <div className="process-steps">
              <div className="process-card">
                <span className="process-number">01</span>
                <h4>Identity &amp; KYC Verification</h4>
                <p>Provide verified PAN, contact details, and monthly financial income for instant digital scoring.</p>
              </div>

              <div className="process-card">
                <span className="process-number">02</span>
                <h4>Customise Loan &amp; Tenure</h4>
                <p>Select required capital from ₹5,000 to ₹50,000 and customize comfortable repayment intervals.</p>
              </div>

              <div className="process-card">
                <span className="process-number">03</span>
                <h4>Review Terms &amp; Settlement</h4>
                <p>Inspect transparent EMI obligations, execute consent, and receive instant credit disbursal.</p>
              </div>
            </div>

            {/* Action Grid */}
            <div className="section-title">
              <div>
                <h2>Workspace Navigation &amp; Tools</h2>
                <p>Access financial tools, borrower records, and credit management consoles</p>
              </div>
            </div>

            <div className="action-grid">
              <button
                className="action-card"
                onClick={() => {
                  setPage('apply');
                  setStep(1);
                }}
              >
                <div className="action-icon">＋</div>
                <b>Apply for Personal Loan</b>
                <small>Submit an application for instant algorithmic credit evaluation.</small>
                <span className="action-arrow">↗</span>
              </button>

              <button
                className="action-card"
                onClick={() => setPage('calculator')}
              >
                <div className="action-icon">⌗</div>
                <b>Interactive Loan Calculator</b>
                <small>Simulate principal vs interest split, EMI schedules, and tenures.</small>
                <span className="action-arrow">↗</span>
              </button>

              <button
                className="action-card"
                onClick={() => setPage('records')}
              >
                <div className="action-icon">▤</div>
                <b>Borrower Dossiers ({records.length})</b>
                <small>Inspect active applicant dossiers and update underwriting status.</small>
                <span className="action-arrow">↗</span>
              </button>

              <button
                className="action-card"
                onClick={() => setPage('repayment')}
              >
                <div className="action-icon">↻</div>
                <b>Repayment Ledger</b>
                <small>Monitor scheduled instalments, payment history, and active balances.</small>
                <span className="action-arrow">↗</span>
              </button>
            </div>
          </>
        )}

        {/* ===================================================================
            VIEW 2: DEDICATED LOAN CALCULATOR
            =================================================================== */}
        {page === 'calculator' && (
          <section className="calc-container">
            <div className="calc-inputs">
              <div>
                <div className="calc-group-title">
                  <label htmlFor="loan-amount-slider">Select Loan Principal Amount</label>
                  <span className="calc-current-value">{money(form.loan)}</span>
                </div>

                <input
                  id="loan-amount-slider"
                  type="range"
                  min="5000"
                  max="50000"
                  step="1000"
                  className="calc-slider"
                  value={form.loan}
                  onChange={e => setForm({ ...form, loan: e.target.value })}
                />

                <div className="calc-slider-scale">
                  <span>₹5,000</span>
                  <span>₹15,000</span>
                  <span>₹30,000</span>
                  <span>₹50,000 (Max)</span>
                </div>

                <div className="calc-chips">
                  {['5000', '10000', '15000', '25000', '50000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={'calc-chip ' + (form.loan === val ? 'active' : '')}
                      onClick={() => setForm({ ...form, loan: val })}
                    >
                      {money(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="calc-group-title">
                  <label htmlFor="loan-tenure-slider">Select Repayment Duration</label>
                  <span className="calc-current-value">{months} Months</span>
                </div>

                <input
                  id="loan-tenure-slider"
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  className="calc-slider"
                  value={form.tenure}
                  onChange={e => setForm({ ...form, tenure: e.target.value })}
                />

                <div className="calc-slider-scale">
                  <span>1 Mo</span>
                  <span>3 Mo</span>
                  <span>6 Mo</span>
                  <span>9 Mo</span>
                  <span>12 Mo</span>
                </div>

                <div className="calc-chips">
                  {[1, 3, 6, 9, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      className={'calc-chip ' + (Number(form.tenure) === m ? 'active' : '')}
                      onClick={() => setForm({ ...form, tenure: String(m) })}
                    >
                      {m} {m === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Principal vs Interest Visual Breakdown */}
              <div className="split-vis">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>
                  <span>Principal vs Interest Distribution</span>
                  <span>{principalPct}% Principal / {interestPct}% Interest</span>
                </div>

                <div className="split-bar-wrap">
                  <div className="split-bar-principal" style={{ width: `${principalPct}%` }} />
                </div>

                <div className="split-legend">
                  <div className="split-legend-item">
                    <span className="legend-dot principal" style={{ background: '#0f172a' }} />
                    <span>Principal: <b>{money(principal)}</b></span>
                  </div>
                  <div className="split-legend-item">
                    <span className="legend-dot interest" />
                    <span>Total Interest: <b>{money(totalInterest)}</b></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator Summary Ledger */}
            <div className="calc-summary-panel">
              <div className="emi-highlight">
                <span>ESTIMATED MONTHLY INSTALLMENT</span>
                <div className="emi-number">{money(emi)}</div>
                <small>Calculated at fixed 12.0% Annual APR</small>
              </div>

              <div className="ledger-rows">
                <div className="ledger-row">
                  <span>Loan Principal Amount:</span>
                  <strong>{money(principal)}</strong>
                </div>
                <div className="ledger-row">
                  <span>Repayment Tenure:</span>
                  <strong>{months} Months</strong>
                </div>
                <div className="ledger-row">
                  <span>Total Accrued Interest:</span>
                  <strong style={{ color: '#ff7875' }}>{money(totalInterest)}</strong>
                </div>
                <div className="ledger-row" style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>Total Repayment Obligation:</span>
                  <strong style={{ fontSize: '15px' }}>{money(totalRepayment)}</strong>
                </div>
              </div>

              <button
                className="calc-apply-btn"
                onClick={() => {
                  setPage('apply');
                  setStep(1);
                  setNotice({ text: 'Selected loan configuration applied to your application.', type: 'info' });
                }}
              >
                <span>Proceed to Application with {money(principal)}</span>
                <span>→</span>
              </button>
            </div>
          </section>
        )}

        {/* ===================================================================
            VIEW 3: MULTI-STEP LOAN APPLICATION
            =================================================================== */}
        {page === 'apply' && (
          <section className="surface">
            <div className="surface-head">
              <div className="surface-title-wrap">
                <div className="surface-icon">▤</div>
                <div>
                  <h2>Personal Credit Application</h2>
                  <p>Complete KYC and loan requirements in three streamlined steps.</p>
                </div>
              </div>
              <span className="demo-label">INSTANT STP PROCESSING</span>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="stepper">
              <div className={'step ' + (step === 1 ? 'active' : step > 1 ? 'done' : '')}>
                <span className="step-number">{step > 1 ? '✓' : '1'}</span>
                <span>01. Personal KYC Details</span>
              </div>
              <div className="stepper-line" />
              <div className={'step ' + (step === 2 ? 'active' : step > 2 ? 'done' : '')}>
                <span className="step-number">{step > 2 ? '✓' : '2'}</span>
                <span>02. Financial &amp; Loan Terms</span>
              </div>
              <div className="stepper-line" />
              <div className={'step ' + (step === 3 ? 'active' : '')}>
                <span className="step-number">3</span>
                <span>03. Agreement &amp; Submission</span>
              </div>
            </div>

            {/* STEP 1: PERSONAL DETAILS (PRESERVED FOR QR-06) */}
            {step === 1 && (
              <>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '18px', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>⚡ 1-Click Demo Profiles:</span>
                  {demoPresets.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      className="btn-fill-preset"
                      onClick={() => applyPreset(preset)}
                    >
                      Fill {preset.name} ({money(preset.loan)})
                    </button>
                  ))}
                </div>
                <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="field-name">
                    Full Legal Name
                    <span className="field-hint">As printed on government ID</span>
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aarav Mehta"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="field-email">
                    Email Address
                    <span className="field-hint">For loan disclosures &amp; terms</span>
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. aarav.mehta@example.test"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="field-phone">
                    Mobile Phone Number
                    <span className="field-hint">10 digits starting with 6-9</span>
                  </label>
                  <div className="form-input-wrap">
                    <span className="input-prefix">+91</span>
                    <input
                      id="field-phone"
                      type="tel"
                      className="form-input has-prefix"
                      maxLength={10}
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={e =>
                        setForm({
                          ...form,
                          phone: e.target.value.replace(/\D/g, '').slice(0, 10)
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="field-dob">
                    Date of Birth
                    <span className="field-hint">Applicant must be 18+ years</span>
                  </label>
                  <input
                    id="field-dob"
                    type="date"
                    max={today}
                    className="form-input"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="field-pan">
                    Permanent Account Number (PAN)
                    <span className="field-hint">Format: ABCDE1234F</span>
                  </label>
                  <input
                    id="field-pan"
                    type="text"
                    maxLength={10}
                    className="form-input tabular"
                    placeholder="ABCDE1234F"
                    style={{ textTransform: 'uppercase' }}
                    value={form.pan}
                    onChange={e =>
                      setForm({
                        ...form,
                        pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="field-address">
                    Residential Address
                    <span className="field-hint">Current permanent residence</span>
                  </label>
                  <input
                    id="field-address"
                    type="text"
                    className="form-input"
                    placeholder="Flat / House No, Street, City, State, PIN"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <small>Step 1 of 3: All fields are mandatory for credit scoring.</small>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (validatePersonalDetails()) {
                        setStep(2);
                      }
                    }}
                  >
                    <span>Proceed to Financial Details</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
              </>
            )}

            {/* STEP 2: FINANCIAL & LOAN DETAILS (PRESERVED FOR QR-06, QR-07 & QR-03) */}
            {step === 2 && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="field-income">
                    Monthly Net Income (₹)
                    <span className="field-hint">Verified monthly take-home</span>
                  </label>
                  <input
                    id="field-income"
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 35000"
                    value={form.income}
                    onChange={e => setForm({ ...form, income: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="field-loan">
                    Requested Loan Principal
                    <span className="field-hint">Up to ₹50,000 maximum</span>
                  </label>
                  <select
                    id="field-loan"
                    className="form-select"
                    value={form.loan}
                    onChange={e => setForm({ ...form, loan: e.target.value })}
                  >
                    {['5000', '10000', '15000', '25000', '50000'].map(val => (
                      <option key={val} value={val}>
                        {money(val)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="field-tenure">
                    Repayment Tenure
                    <span className="field-hint">Monthly EMI intervals</span>
                  </label>
                  <select
                    id="field-tenure"
                    className="form-select"
                    value={form.tenure}
                    onChange={e => setForm({ ...form, tenure: e.target.value })}
                  >
                    {[1, 3, 6, 9, 12].map(m => (
                      <option key={m} value={m}>
                        {m} {m === 1 ? 'Month' : 'Months'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Real-time Calculation Summary inside Step 2 */}
                <div className="form-group full-width">
                  <div className="calc-summary-panel" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.1em' }}>
                          Real-Time EMI Obligation
                        </span>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff' }}>
                          {money(emi)} <span style={{ fontSize: '13px', fontWeight: '500', color: '#ff7875' }}>/ month</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#cbd5e1' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>ANNUAL RATE</span>
                          <b style={{ color: '#ffffff' }}>{annualRate}.0% APR</b>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>TOTAL INTEREST</span>
                          <b style={{ color: '#ff7875' }}>{money(totalInterest)}</b>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>TOTAL REPAYMENT</span>
                          <b style={{ color: '#ffffff' }}>{money(totalRepayment)}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Device & Underwriting Permissions (Vulnerability QR-07 naturally embedded in loan flow) */}
                <div className="form-group full-width" style={{ marginTop: '8px' }}>
                  <label style={{ marginBottom: '6px' }}>
                    Underwriting Telemetry &amp; Device Identity Permissions
                    <span className="field-hint">Automated risk verification</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: '#d8232a', fontWeight: 'bold' }}>▣</span>
                        <b style={{ fontSize: '11.5px', color: '#0f172a' }}>Address Book &amp; Contacts</b>
                      </div>
                      <small style={{ fontSize: '10.5px', color: '#64748b', display: 'block', lineHeight: '1.4' }}>
                        Simulated permission request: Device contacts accessed for applicant references.
                      </small>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: '#d8232a', fontWeight: 'bold' }}>▧</span>
                        <b style={{ fontSize: '11.5px', color: '#0f172a' }}>Photos, Media &amp; Files</b>
                      </div>
                      <small style={{ fontSize: '10.5px', color: '#64748b', display: 'block', lineHeight: '1.4' }}>
                        Simulated permission request: Local storage accessed for KYC document checks.
                      </small>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: '#d8232a', fontWeight: 'bold' }}>⌖</span>
                        <b style={{ fontSize: '11.5px', color: '#0f172a' }}>Geolocation (GPS)</b>
                      </div>
                      <small style={{ fontSize: '10.5px', color: '#64748b', display: 'block', lineHeight: '1.4' }}>
                        Simulated permission request: Real-time GPS location tracked for risk geofencing.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Consent Checkbox (Scanner Target QR-03 & DPDP) */}
                <label className="consent-box">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => setForm({ ...form, consent: e.target.checked })}
                  />
                  <span className="consent-text">
                    <b>Digital Credit Terms &amp; Data Processing Consent</b>
                    <br />
                    I consent to the collection and processing of my personal and financial information for this credit evaluation and algorithmic underwriting assessment.
                  </span>
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setStep(1);
                      setNotice({ text: '', type: 'info' });
                    }}
                  >
                    ← Back to Personal Details
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (!form.income || Number(form.income) <= 0) {
                        setNotice({ text: 'Please enter a valid monthly net income.', type: 'error' });
                        return;
                      }
                      setNotice({ text: '', type: 'info' });
                      setStep(3);
                    }}
                  >
                    <span>Review Application Dossier</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: APPLICATION REVIEW & AGREEMENT */}
            {step === 3 && (
              <div className="review-dossier">
                <div className="dossier-watermark">PRE-SUBMISSION DOSSIER</div>

                <div className="dossier-section">
                  <div className="dossier-section-title">
                    <span>01</span>
                    <span>Applicant Identity &amp; Contact Information</span>
                  </div>
                  <div className="dossier-grid">
                    <div className="dossier-item">
                      <span>Applicant Name</span>
                      <strong>{form.name || 'Demo Applicant'}</strong>
                    </div>
                    <div className="dossier-item">
                      <span>PAN Number</span>
                      <strong className="pan-code">{form.pan}</strong>
                    </div>
                    <div className="dossier-item">
                      <span>Date of Birth</span>
                      <strong>{form.dob}</strong>
                    </div>
                    <div className="dossier-item">
                      <span>Email Address</span>
                      <strong>{form.email}</strong>
                    </div>
                    <div className="dossier-item">
                      <span>Mobile Number</span>
                      <strong>+91 {form.phone}</strong>
                    </div>
                    <div className="dossier-item">
                      <span>Residential Address</span>
                      <strong>{form.address}</strong>
                    </div>
                  </div>
                </div>

                <div className="dossier-section">
                  <div className="dossier-section-title">
                    <span>02</span>
                    <span>Financial Terms &amp; Repayment Schedule</span>
                  </div>

                  <div className="terms-highlight-bar">
                    <div className="item">
                      <span>Requested Facility</span>
                      <strong>{money(form.loan)}</strong>
                    </div>
                    <div className="item">
                      <span>Tenure Window</span>
                      <strong>{months} Months</strong>
                    </div>
                    <div className="item featured">
                      <span>Monthly Installment</span>
                      <strong>{money(emi)}</strong>
                    </div>
                    <div className="item">
                      <span>Total Repayment</span>
                      <strong>{money(totalRepayment)}</strong>
                    </div>
                  </div>
                </div>

                <div className="dossier-section">
                  <div className="dossier-section-title">
                    <span>03</span>
                    <span>Consent &amp; Authorization Status</span>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <b>Consent Status: </b>
                    <span style={{ color: form.consent ? '#059669' : '#d97706', fontWeight: '700' }}>
                      {form.consent ? '✓ Explicit Consent Executed' : '⚠ Consent Checkbox Unchecked (Will be recorded in underwriting telemetry)'}
                    </span>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setStep(2);
                      setNotice({ text: '', type: 'info' });
                    }}
                  >
                    ← Edit Loan Terms
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    disabled={submitting}
                    onClick={submit}
                  >
                    <span>{submitting ? 'Transmitting to Underwriting Engine…' : 'Submit Final Application ✓'}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
            VIEW 4: BORROWER RECORDS (QR-09 UNMASKED SENSITIVE FIELDS PRESERVED)
            =================================================================== */}
        {page === 'records' && (
          <section className="surface">
            <div className="surface-head">
              <div className="surface-title-wrap">
                <div className="surface-icon">▤</div>
                <div>
                  <h2>Registered Borrower Dossiers</h2>
                  <p>Central underwriting ledger of all applicant dossiers, dispositions, and approval actions.</p>
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={fetchRecords}
              >
                ↻ Refresh from API
              </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="table-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, PAN, email, or dossier ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-pills">
                {['All', 'Approved', 'Review', 'Pending'].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={'filter-pill ' + (statusFilter === status ? 'active' : '')}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table (QR-09 Finding: unmasked PAN, email, phone visible as intended) */}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>DOSSIER ID</th>
                    <th>APPLICANT IDENTITY</th>
                    <th>CONTACT TELEMETRY</th>
                    <th>PAN (UNMASKED)</th>
                    <th>PRINCIPAL</th>
                    <th>DISPOSITION</th>
                    <th>CONSENT</th>
                    <th>UNDERWRITING ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No borrower records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, i) => (
                      <tr key={r.id || i}>
                        <td>
                          <b style={{ color: '#d8232a', fontFamily: 'monospace' }}>
                            QR-{r.id}
                          </b>
                        </td>
                        <td>
                          <div className="applicant-col">
                            <span className="applicant-name">{r.name}</span>
                            <span className="applicant-email">DOB: {r.dob || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span>{r.email}</span>
                            <br />
                            <small style={{ color: '#64748b' }}>+91 {r.phone}</small>
                          </div>
                        </td>
                        <td>
                          <span className="pan-code">{r.pan || '—'}</span>
                        </td>
                        <td>
                          <b>{money(r.loan)}</b>
                        </td>
                        <td>
                          <span
                            className={
                              'status-pill ' +
                              (r.status === 'Approved'
                                ? 'approved'
                                : r.status === 'Under review' || r.status === 'Review'
                                ? 'review'
                                : 'pending')
                            }
                          >
                            {r.status === 'Approved' ? '● Approved' : r.status === 'Under review' || r.status === 'Review' ? '◐ Under review' : '○ Pending'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: r.consent ? '#059669' : '#d97706', fontWeight: '600' }}>
                            {r.consent ? 'Recorded' : 'Unchecked'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: '700',
                                borderRadius: '6px',
                                background: r.status === 'Approved' ? '#f1f5f9' : '#ecfdf5',
                                color: r.status === 'Approved' ? '#94a3b8' : '#059669',
                                border: '1px solid ' + (r.status === 'Approved' ? '#cbd5e1' : '#a7f3d0'),
                                cursor: r.status === 'Approved' ? 'default' : 'pointer',
                                transition: 'all 0.15s'
                              }}
                              disabled={r.status === 'Approved'}
                              onClick={() => handleUpdateStatus(r.id, 'Approved')}
                            >
                              {r.status === 'Approved' ? '✓ Approved' : 'Approve Loan'}
                            </button>
                            <button
                              type="button"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: '600',
                                borderRadius: '6px',
                                background: '#f8fafc',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                cursor: 'pointer'
                              }}
                              onClick={() => setSanctionRecord(r)}
                            >
                              📄 Sanction Letter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
              <span>Displaying {filteredRecords.length} of {records.length} total dossiers</span>
              <span>Central Underwriting Ledger · SQLite DB</span>
            </div>
          </section>
        )}

        {/* ===================================================================
            VIEW 5: REPAYMENT SCHEDULE & LEDGER
            =================================================================== */}
        {page === 'repayment' && (
          <section className="surface">
            <div className="surface-head">
              <div className="surface-title-wrap">
                <div className="surface-icon">↻</div>
                <div>
                  <h2>Amortisation &amp; Repayment Schedule</h2>
                  <p>Track active credit facilities, upcoming maturities, and instalment health.</p>
                </div>
              </div>
              <span className="demo-label">FACILITY: ACTIVE</span>
            </div>

            <div className="repay-summary">
              <div>
                <small>Total Outstanding Principal</small>
                <b>₹8,333</b>
                <span>Initial facility: ₹10,000 · 6 Months</span>
              </div>

              <div>
                <small>Next Due Instalment</small>
                <b style={{ color: '#d8232a' }}>₹1,833</b>
                <span>Maturity Date: 05 Dec 2026 (Scheduled)</span>
              </div>

              <div>
                <small>Repayment Health</small>
                <b style={{ color: '#059669' }}>Tier 1 (Optimal)</b>
                <span>Zero delinquency recorded</span>
              </div>
            </div>

            <div className="table-title">
              <span>Monthly Instalment Schedule</span>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                onClick={() => setNotice({ text: 'Simulation: Payment gateway redirected. No real transaction processed.', type: 'info' })}
              >
                Simulate Repayment Settlement
              </button>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>INSTALMENT</th>
                    <th>DUE DATE</th>
                    <th>PRINCIPAL</th>
                    <th>INTEREST (12% APR)</th>
                    <th>TOTAL EMI</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { num: 1, date: '05 Dec 2026', p: '₹1,733', i: '₹100', total: '₹1,833', status: 'Upcoming' },
                    { num: 2, date: '05 Jan 2027', p: '₹1,750', i: '₹83', total: '₹1,833', status: 'Scheduled' },
                    { num: 3, date: '05 Feb 2027', p: '₹1,768', i: '₹65', total: '₹1,833', status: 'Scheduled' },
                    { num: 4, date: '05 Mar 2027', p: '₹1,785', i: '₹48', total: '₹1,833', status: 'Scheduled' },
                    { num: 5, date: '05 Apr 2027', p: '₹1,803', i: '₹30', total: '₹1,833', status: 'Scheduled' },
                    { num: 6, date: '05 May 2027', p: '₹1,821', i: '₹12', total: '₹1,833', status: 'Scheduled' }
                  ].map(item => (
                    <tr key={item.num}>
                      <td><b>Instalment #{item.num}</b></td>
                      <td>{item.date}</td>
                      <td>{item.p}</td>
                      <td>{item.i}</td>
                      <td><b>{item.total}</b></td>
                      <td>
                        <span className={'status-pill ' + (item.status === 'Upcoming' ? 'review' : 'pending')}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* UNDERWRITING PROGRESS ANIMATION MODAL */}
        {underwritingProgress > 0 && (
          <div className="modal-overlay">
            <div className="modal-box underwriting-modal">
              <div className="uw-spinner" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Algorithmic Underwriting Engine
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Evaluating credit telemetry and automated digital KYC...
              </p>

              <div className="uw-steps">
                <div className="uw-step-item">
                  <span className="uw-check">{underwritingProgress >= 1 ? '✓' : '○'}</span>
                  <span style={{ color: underwritingProgress >= 1 ? '#059669' : '#94a3b8' }}>
                    Identity, PAN &amp; Biometric KYC Check
                  </span>
                </div>
                <div className="uw-step-item">
                  <span className="uw-check">{underwritingProgress >= 2 ? '✓' : '○'}</span>
                  <span style={{ color: underwritingProgress >= 2 ? '#059669' : '#94a3b8' }}>
                    Credit Bureau &amp; Income Ratio Scoring
                  </span>
                </div>
                <div className="uw-step-item">
                  <span className="uw-check">{underwritingProgress >= 3 ? '✓' : '○'}</span>
                  <span style={{ color: underwritingProgress >= 3 ? '#059669' : '#94a3b8' }}>
                    Facility Assignment &amp; Ledger Generation
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL LOAN SANCTION LETTER MODAL */}
        {sanctionRecord && (
          <div className="modal-overlay" onClick={() => setSanctionRecord(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#d8232a', letterSpacing: '0.1em' }}>
                  REGULATED CREDIT SANCTION MEMORANDUM
                </span>
                <button
                  type="button"
                  style={{ fontSize: '18px', color: '#64748b', cursor: 'pointer', background: 'none', border: 'none' }}
                  onClick={() => setSanctionRecord(null)}
                >
                  ✕
                </button>
              </div>

              <div className="sanction-letter">
                <div className="sanction-watermark">APPROVED FACILITY</div>

                <div className="sanction-header">
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      QuickRupee Financial Technologies Ltd.
                    </h3>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>
                      Registered NBFC Partner · RBI Registration: N-14.03210 (Demo)
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ color: '#d8232a', fontFamily: 'monospace', fontSize: '13px' }}>
                      QR-{sanctionRecord.id}
                    </b>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Date: 23 Nov 2026</div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                  We are pleased to inform you that following algorithmic credit appraisal, the personal credit facility has been conditionally sanctioned in accordance with our Key Fact Statement (KFS).
                </p>

                <div className="sanction-grid">
                  <div><span>Applicant Name:</span> <strong>{sanctionRecord.name}</strong></div>
                  <div><span>PAN Number:</span> <strong>{sanctionRecord.pan || 'ABCDE1234F'}</strong></div>
                  <div><span>Sanctioned Principal:</span> <strong>{money(sanctionRecord.loan)}</strong></div>
                  <div><span>Interest Rate (APR):</span> <strong>12.0% Fixed</strong></div>
                  <div><span>Underwriting Status:</span> <strong style={{ color: sanctionRecord.status === 'Approved' ? '#059669' : '#d97706' }}>{sanctionRecord.status}</strong></div>
                  <div><span>Disbursal Channel:</span> <strong>Direct Bank IMPS / UPI</strong></div>
                </div>

                <div className="sanction-seal-row">
                  <div>
                    <small style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>DIGITAL SIGNATURE</small>
                    <b style={{ fontSize: '12px', color: '#0f172a' }}>QuickRupee Underwriting Committee</b>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                    onClick={() => {
                      window.print();
                    }}
                  >
                    🖨️ Print Sanction Letter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer>
          <div>
            QuickRupee 快卢比 · Institutional Micro-Credit Platform · Regulated NBFC Partner
          </div>
          <div className="footer-links">
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Credit Facility</span>
            <span className="footer-link">Security Disclosures</span>
            <span className="footer-link">Customer Grievance</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
