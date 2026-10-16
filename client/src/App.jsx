import { useEffect, useState } from 'react';
import { Chart as C, registerables } from 'chart.js'; import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from './api.js'; C.register(...registerables);

const CLINIC_NAME = 'SmileCraft Dental Clinic';
const inr = n => '₹' + (n || 0).toLocaleString('en-IN');
const INDIAN_INSURERS = ['Star Health', 'Care Health', 'Max Bupa', 'Niva Bupa', 'ICICI Lombard', 'Self Pay'];
const APPOINTMENT_STATUS = ['Booked', 'Confirmed', 'Completed', 'Cancelled'];
const NAV_ITEMS = [
  ['Dashboard', 'dashboard'], ['Appointments', 'calendar'], ['Patients', 'patients'],
  ['Billing', 'billing'], ['Inventory', 'inventory'], ['Reports', 'reports'],
  ['AI Assistant', 'assistant'],
];
function Icon({ name, size = 20 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
    patients: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    billing: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h3M15 15h1M8 18h3" /></>,
    inventory: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5M12 13v4" /></>,
    reports: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /><path d="M17 7h2v2" /></>,
    assistant: <><path d="M12 3a8 8 0 0 0-4.2 14.8L7 21l4-2a8 8 0 1 0 1-16Z" /><path d="M9 10h.01M12 10h.01M15 10h.01M9 14h6" /></>,
    patientsCount: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 11a3 3 0 1 0 0-6M18 14a5 5 0 0 1 3 5v1" /></>,
    rupee: <><path d="M6 4h12M6 8h12M8 4c4 0 6 1.8 6 4s-2 4-6 4h-.5L16 20" /></>,
    tooth: <><path d="M12 4c-2-2-7-1-8 3-1 5 2 14 5 14 2 0 1-7 3-7s1 7 3 7c3 0 6-9 5-14-1-4-6-5-8-3Z" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...common}>{paths[name] || paths.dashboard}</svg>;
}
const RESOURCES = {
  Appointments: { path: 'appointments', fields: [['patient', 'Patient'], ['date', 'Date', 'date'], ['time', 'Time', 'time'], ['type', 'Type'], ['status', 'Status', APPOINTMENT_STATUS]] },
  Inventory: { path: 'inventory', fields: [['name', 'Item'], ['qty', 'In stock', 'number'], ['minQty', 'Reorder at', 'number']] },
};

function Login({ onDone }) {
  const [registering, setRegistering] = useState(false);
  const [f, setF] = useState({ name: '', email: 'dr.smith@dentalsaas.com', phone: '', password: 'smile123' });
  const [err, setErr] = useState('');
  const go = async e => {
    e.preventDefault();
    setErr('');
    try {
      const d = registering
        ? await api('auth/patient/register', 'POST', f)
        : await api('auth/login', 'POST', { email: f.email, password: f.password });
      localStorage.token = d.token;
      localStorage.name = d.name;
      localStorage.role = d.role;
      if (d.patientId) localStorage.patientId = d.patientId;
      else localStorage.removeItem('patientId');
      onDone(d);
    } catch (error) {
      setErr(error.message);
    }
  };
  const changeMode = next => {
    setRegistering(next);
    setErr('');
    setF(next
      ? { name: '', email: '', phone: '', password: '' }
      : { name: '', email: 'dr.smith@dentalsaas.com', phone: '', password: 'smile123' });
  };
  return <div className="login"><form className="card" onSubmit={go}>
    <img className="clinic-logo login-logo" src="/clinic-logo.png" alt={`${CLINIC_NAME} logo`} />
    <h1>{CLINIC_NAME}</h1><p className="muted">Appointments and patient care for your Indian dental practice</p>
    <div className="auth-mode"><button type="button" className={!registering ? '' : 'ghost'} onClick={() => changeMode(false)}>Sign in</button><button type="button" className={registering ? '' : 'ghost'} onClick={() => changeMode(true)}>Patient registration</button></div>
    {registering && <input required autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Full name" />}
    {registering && <input required type="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="Phone number" />}
    <input required type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="Email" />
    <input required type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 8 : undefined} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} placeholder={registering ? 'Create password (8+ characters)' : 'Password'} />
    {err && <p className="err" role="alert">{err}</p>}
    <button type="submit">{registering ? 'Create patient account' : 'Sign in'}</button>
    {!registering && <p className="muted demo-login">Demo doctor: dr.smith@dentalsaas.com / smile123<br />Demo patient: aarav.patient@dentalsaas.com / patient123</p>}
  </form></div>;
}

function Resource({ title, path, fields }) {
  const [rows, setRows] = useState([]), [form, setForm] = useState({}), [q, setQ] = useState('');
  const load = () => api(path).then(setRows); useEffect(() => { load(); }, [path]);
  const add = async () => { await api(path, 'POST', form); setForm({}); load(); };
  const del = async id => { await api(`${path}/${id}`, 'DELETE'); load(); };
  const updateRow = async (id, patch) => {
    const row = rows.find(r => r._id === id); if (!row) return;
    await api(`${path}/${id}`, 'PUT', { ...row, ...patch });
    load();
  };
  const updateStatus = async (id, status) => updateRow(id, { status });
  const consumeStock = async id => {
    const row = rows.find(r => r._id === id); if (!row) return;
    await api(`${path}/${id}`, 'PUT', { ...row, qty: Math.max(0, Number(row.qty || 0) - 1) });
    load();
  };
  const handleQtyChange = async (id, value) => {
    const row = rows.find(r => r._id === id); if (!row) return;
    const qty = Math.max(0, Number(value) || 0);
    await api(`${path}/${id}`, 'PUT', { ...row, qty });
    load();
  };
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const rowDefaults = title === 'Billing' ? { insurance: INDIAN_INSURERS[0] } : {};
  return <>
    <h2>{title}</h2>
    <div className="card form">{fields.map(([k, l, t]) => Array.isArray(t)
      ? <select key={k} value={form[k] || rowDefaults[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })}><option value="">{l}</option>{t.map(o => <option key={o}>{o}</option>)}</select>
      : <input key={k} type={t || 'text'} placeholder={l} title={l} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}
      <button onClick={add}>Add {title.replace(/s$/, '').toLowerCase()}</button></div>
    <input className="search" placeholder={`Search ${title.toLowerCase()}`} value={q} onChange={e => setQ(e.target.value)} />
    <div className="card scroll"><table><thead><tr>{fields.map(([k, l]) => <th key={k}>{l}</th>)}<th /></tr></thead>
      <tbody>{shown.map(r => <tr key={r._id}>{fields.map(([k, , t]) => <td key={k}>
        {k === 'status' ? <div className="status-wrap">
          <span className={'tag ' + String(r[k] || '').toLowerCase()}>{r[k] || 'Booked'}</span>
          <select className="status-select" value={r[k] || ''} onChange={e => updateStatus(r._id, e.target.value)}>
            {Array.isArray(t) ? t.map(v => <option key={v} value={v}>{v}</option>) : <option value={r[k]}>{r[k]}</option>}
          </select>
          {path === 'appointments' && r[k] !== 'Confirmed' && r[k] !== 'Completed' && r[k] !== 'Cancelled' && <button className="mini" onClick={() => updateStatus(r._id, 'Confirmed')}>Confirm</button>}
        </div> : k === 'qty' && path === 'inventory' ? <div className="qty-cell"><input type="number" min="0" value={Number(r[k] || 0)} onChange={e => handleQtyChange(r._id, e.target.value)} /><button className="mini ghost" onClick={() => consumeStock(r._id)}>Use 1</button></div> : (k === 'amount' ? inr(r[k]) : r[k])}
      </td>)}
        <td><button className="ghost" onClick={() => del(r._id)}>Delete</button></td></tr>)}</tbody></table>
      {!shown.length && <p className="muted pad">Nothing here yet. Add your first {title.replace(/s$/, '').toLowerCase()} above.</p>}</div></>;
}

function Patients() {
  const emptyPatient = () => ({ name: '', age: '', phone: '', history: '' });
  const emptyVisit = () => ({ date: todayDate(), reason: '', prescription: '', notes: '' });
  const [patients, setPatients] = useState([]), [form, setForm] = useState(emptyPatient);
  const [search, setSearch] = useState(''), [selectedPatient, setSelectedPatient] = useState(null);
  const [visits, setVisits] = useState([]), [visitForm, setVisitForm] = useState(emptyVisit);
  const [error, setError] = useState(''), [visitError, setVisitError] = useState('');
  const loadPatients = async () => setPatients(await api('patients'));
  useEffect(() => { loadPatients().catch(e => setError(e.message)); }, []);
  useEffect(() => {
    if (!selectedPatient) return;
    setVisits([]);
    setVisitForm(emptyVisit());
    setVisitError('');
    api(`patients/${selectedPatient._id}/visits`).then(setVisits).catch(e => setVisitError(e.message));
  }, [selectedPatient]);
  const addPatient = async e => {
    e.preventDefault();
    setError('');
    try {
      await api('patients', 'POST', { ...form, age: form.age ? Number(form.age) : undefined });
      setForm(emptyPatient());
      await loadPatients();
    } catch (e) {
      setError(e.message);
    }
  };
  const deletePatient = async patient => {
    if (!window.confirm(`Delete ${patient.name}? Their visit records will remain in the database.`)) return;
    setError('');
    try {
      await api(`patients/${patient._id}`, 'DELETE');
      if (selectedPatient?._id === patient._id) setSelectedPatient(null);
      await loadPatients();
    } catch (e) {
      setError(e.message);
    }
  };
  const addVisit = async e => {
    e.preventDefault();
    if (!selectedPatient) return;
    setVisitError('');
    try {
      await api(`patients/${selectedPatient._id}/visits`, 'POST', visitForm);
      setVisitForm(emptyVisit());
      setVisits(await api(`patients/${selectedPatient._id}/visits`));
    } catch (e) {
      setVisitError(e.message);
    }
  };
  const shown = patients.filter(patient => JSON.stringify(patient).toLowerCase().includes(search.toLowerCase()));
  return <>
    <h2>Patients</h2>
    <form className="card form" onSubmit={addPatient}>
      <input required placeholder="Patient name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input type="number" min="0" placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
      <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="Medical history" value={form.history} onChange={e => setForm({ ...form, history: e.target.value })} />
      <button type="submit">Add patient</button>
    </form>
    {error && <p className="err" role="alert">{error}</p>}
    <input className="search" placeholder="Search patients" value={search} onChange={e => setSearch(e.target.value)} />
    <div className="card scroll"><table><thead><tr><th>Name</th><th>Age</th><th>Phone</th><th>Medical history</th><th>Patient notes</th><th>Actions</th></tr></thead>
      <tbody>{shown.map(patient => <tr key={patient._id}>
        <td>{patient.name}</td><td>{patient.age || '—'}</td><td>{patient.phone || '—'}</td><td>{patient.history || '—'}</td>
        <td><button className="ghost mini" onClick={() => setSelectedPatient(patient)}>Open visit notebook</button></td>
        <td><button className="ghost mini" onClick={() => deletePatient(patient)}>Delete</button></td>
      </tr>)}</tbody></table>
      {!shown.length && <p className="muted pad">No patients found. Add a patient above.</p>}</div>
    {selectedPatient && <div className="invoice-modal visit-modal" role="dialog" aria-modal="true" aria-label={`${selectedPatient.name} visit notebook`}>
      <section className="visit-notebook">
        <header className="visit-header"><div><h2>{selectedPatient.name}</h2><p className="muted">Visit history and clinical notebook</p></div>
          <button className="ghost" onClick={() => setSelectedPatient(null)}>Close</button>
        </header>
        <div className="visit-columns">
          <section className="visit-history"><h3>Previous visits</h3>
            {visitError && <p className="err" role="alert">{visitError}</p>}
            {!visitError && visits.length === 0 && <p className="muted">No visits recorded yet. Add a previous or current visit with prescriptions and notes.</p>}
            {visits.map(visit => <article className="visit-entry" key={visit._id}>
              <time dateTime={visit.date}>{visit.date}</time>
              {visit.reason && <h4>{visit.reason}</h4>}
              {visit.prescription && <div><strong>Prescription</strong><p className="prescription-text">{visit.prescription}</p></div>}
              {visit.notes && <div><strong>Clinical notes</strong><p className="prescription-text">{visit.notes}</p></div>}
            </article>)}
          </section>
          <form className="visit-form" onSubmit={addVisit}>
            <h3>Record a visit</h3>
            <label>Visit date<input required type="date" value={visitForm.date} onChange={e => setVisitForm({ ...visitForm, date: e.target.value })} /></label>
            <label>Reason / treatment<input value={visitForm.reason} onChange={e => setVisitForm({ ...visitForm, reason: e.target.value })} placeholder="e.g. Root canal follow-up" /></label>
            <label>Prescription<textarea rows="4" value={visitForm.prescription} onChange={e => setVisitForm({ ...visitForm, prescription: e.target.value })} placeholder="Medication, dosage, and instructions" /></label>
            <label>Clinical notes<textarea rows="5" value={visitForm.notes} onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })} placeholder="Observations, diagnosis, and follow-up plan" /></label>
            {visitError && <p className="err" role="alert">{visitError}</p>}
            <button type="submit">Save visit notes</button>
          </form>
        </div>
      </section>
    </div>}
  </>;
}

function todayDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function Billing() {
  const emptyForm = () => ({ patient: '', date: todayDate(), description: '', subtotal: '', gstRate: '', insurance: 'Self Pay', status: 'Unpaid' });
  const [invoices, setInvoices] = useState([]), [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm), [selected, setSelected] = useState(null), [err, setErr] = useState('');
  const load = async () => {
    const [invoiceRows, patientRows] = await Promise.all([api('invoices'), api('patients')]);
    setInvoices(invoiceRows);
    setPatients(patientRows);
  };
  useEffect(() => { load().catch(e => setErr(e.message)); }, []);
  const subtotal = Number(form.subtotal) || 0;
  const gstRate = Number(form.gstRate) || 0;
  const gstAmount = Math.round(subtotal * gstRate) / 100;
  const total = subtotal + gstAmount;
  const createInvoice = async e => {
    e.preventDefault();
    setErr('');
    try {
      await api('invoices', 'POST', {
        ...form, subtotal, gstRate, gstAmount, amount: total,
      });
      setForm(emptyForm());
      await load();
    } catch (error) {
      setErr(error.message);
    }
  };
  const updateStatus = async (invoice, status) => {
    try {
      await api(`invoices/${invoice._id}`, 'PUT', { ...invoice, status });
      await load();
    } catch (error) {
      setErr(error.message);
    }
  };
  const removeInvoice = async invoice => {
    try {
      await api(`invoices/${invoice._id}`, 'DELETE');
      await load();
    } catch (error) {
      setErr(error.message);
    }
  };
  const invoiceNumber = invoice => `INV-${(invoice.date || invoice.createdAt || todayDate()).slice(0, 4)}-${invoice._id.slice(-6).toUpperCase()}`;
  const printInvoice = () => window.print();
  return <>
    <h2>Billing &amp; Invoices</h2>
    <form className="card invoice-form" onSubmit={createInvoice}>
      <label>Patient
        <select required value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
          <option value="">Select patient</option>
          {patients.map(patient => <option key={patient._id} value={patient.name}>{patient.name}</option>)}
        </select>
      </label>
      <label>Bill date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
      <label>Service / treatment<input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Consultation, root canal" /></label>
      <label>Amount before GST (₹)<input required type="number" min="0.01" step="0.01" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} /></label>
      <label>GST rate (%) — optional<input type="number" min="0" max="100" step="0.01" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: e.target.value })} placeholder="Leave blank for no GST" /></label>
      <label>Insurance / payment
        <select value={form.insurance} onChange={e => setForm({ ...form, insurance: e.target.value })}>
          {INDIAN_INSURERS.map(insurer => <option key={insurer}>{insurer}</option>)}
        </select>
      </label>
      <label>Payment status
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>Unpaid</option><option>Paid</option>
        </select>
      </label>
      <div className="invoice-total"><span>GST: {inr(gstAmount)}</span><strong>Total: {inr(total)}</strong></div>
      {err && <p className="err" role="alert">{err}</p>}
      <button type="submit">Create invoice</button>
    </form>
    <div className="card scroll"><table><thead><tr><th>Invoice</th><th>Patient</th><th>Date</th><th>Service</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{invoices.map(invoice => {
        const base = Number(invoice.subtotal ?? invoice.amount ?? 0);
        const tax = Number(invoice.gstAmount || 0);
        return <tr key={invoice._id}>
          <td>{invoiceNumber(invoice)}</td><td>{invoice.patient}</td><td>{invoice.date}</td><td>{invoice.description || 'Dental service'}</td>
          <td>{inr(base)}</td><td>{inr(tax)}</td><td><strong>{inr(invoice.amount)}</strong></td>
          <td><select className="status-select" value={invoice.status || 'Unpaid'} onChange={e => updateStatus(invoice, e.target.value)}><option>Unpaid</option><option>Paid</option></select></td>
          <td><div className="invoice-actions"><button className="ghost mini" onClick={() => setSelected(invoice)}>View / Print</button><button className="ghost mini" onClick={() => removeInvoice(invoice)}>Delete</button></div></td>
        </tr>;
      })}</tbody></table>
      {!invoices.length && <p className="muted pad">No invoices yet. Create the first bill above.</p>}</div>
    {selected && <div className="invoice-modal" role="dialog" aria-modal="true" aria-label="Invoice preview">
      <article className="invoice-print">
        <header><div><h2>{CLINIC_NAME}</h2><p>Dental clinic invoice</p></div><div className="invoice-number"><strong>{invoiceNumber(selected)}</strong><br />Date: {selected.date}</div></header>
        <hr />
        <p><strong>Bill to:</strong> {selected.patient}</p>
        <table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>{selected.description || 'Dental service'}</td><td>{inr(selected.subtotal ?? selected.amount)}</td></tr></tbody></table>
        <div className="invoice-breakdown"><p>Subtotal: {inr(selected.subtotal ?? selected.amount)}</p><p>GST ({Number(selected.gstRate || 0)}%): {inr(selected.gstAmount || 0)}</p><h3>Total: {inr(selected.amount)}</h3><p>Status: {selected.status || 'Unpaid'}</p></div>
        <p className="muted">Thank you for choosing {CLINIC_NAME}.</p>
        <div className="invoice-actions no-print"><button onClick={printInvoice}>Print bill</button><button className="ghost" onClick={() => setSelected(null)}>Close</button></div>
      </article>
    </div>}
  </>;
}

function Dashboard({ s }) {
  const cards = [
    ['Today’s appointments', s.todayAppointments, 'calendar', 'Appointments scheduled today'],
    ['Total patients', s.patients, 'patientsCount', 'Registered patient records'],
    ['Pending treatments', s.pendingTreatments, 'tooth', 'Require follow-up'],
    ['Monthly revenue', inr(s.monthlyRevenue), 'rupee', 'Paid invoices this month'],
  ];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return <>
    <header className="dashboard-heading"><div><p className="eyebrow">CLINIC OVERVIEW</p><h1>Good day, {localStorage.name || 'Doctor'}</h1><p className="muted">Here’s your practice summary for today.</p></div><span className="dashboard-date"><Icon name="calendar" size={17} />{today}</span></header>
    <div className="grid4 dashboard-stats">{cards.map(([label, value, icon, detail]) => <article key={label} className="stat">
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon name={icon} size={19} /></span></div>
      <strong>{value}</strong><span className="stat-detail">{detail}</span>
    </article>)}</div>
    <div className="dashboard-panels">
      <section className="card dashboard-panel"><div className="panel-heading"><div><h2>Upcoming appointments</h2><p className="muted">Your next scheduled visits</p></div><span className="panel-count">{s.upcoming.length}</span></div>
        {s.upcoming.length ? <div className="appointment-list">{s.upcoming.map((appointment, i) => <article className="appointment-item" key={appointment._id || i}>
          <div className="appointment-time">{appointment.time}</div><div className="appointment-info"><strong>{appointment.patient}</strong><span>{appointment.type}</span></div>
          <span className={'tag ' + String(appointment.status || 'Booked').toLowerCase()}>{appointment.status || 'Booked'}</span>
        </article>)}</div> : <p className="muted empty-state">No upcoming appointments.</p>}
      </section>
      <section className="card dashboard-panel"><div className="panel-heading"><div><h2>Inventory alerts</h2><p className="muted">Items at or below reorder level</p></div><span className="panel-count">{s.lowStock.length}</span></div>
        {s.lowStock.length ? <div className="stock-list">{s.lowStock.map(item => <div className="stock-item" key={item}><span className="stock-dot" /><span>{item}</span></div>)}
        </div> : <p className="healthy-stock"><span className="healthy-dot" />All clinical supplies are well stocked.</p>}
      </section>
    </div>
  </>;
}
const dateValue = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parseDateValue = value => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
function Reports({ s }) {
  const rev = s.revenueByMonth, mix = Object.entries(s.treatmentMix);
  const today = new Date();
  const initialStart = dateValue(addDays(today, -29));
  const [appointments, setAppointments] = useState([]), [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(dateValue(today)), [grouping, setGrouping] = useState('day');
  const [patientError, setPatientError] = useState('');
  useEffect(() => { api('appointments').then(setAppointments).catch(e => setPatientError(e.message)); }, []);
  const startDate = parseDateValue(start), endDate = parseDateValue(end);
  const periodStart = date => {
    const result = new Date(date);
    if (grouping === 'week') {
      result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    } else if (grouping === 'month') {
      result.setDate(1);
    }
    result.setHours(0, 0, 0, 0);
    return result;
  };
  const periods = [];
  if (start && end && startDate <= endDate) {
    for (let cursor = periodStart(startDate); cursor <= endDate;) {
      periods.push({ key: dateValue(cursor), label: grouping === 'month'
        ? cursor.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : grouping === 'week' ? `Week of ${dateValue(cursor)}` : dateValue(cursor) });
      if (grouping === 'month') cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      else cursor = addDays(cursor, grouping === 'week' ? 7 : 1);
    }
  }
  const appointmentCounts = new Map(periods.map(period => [period.key, 0]));
  if (start && end && startDate <= endDate) {
    appointments.forEach(appointment => {
      if (!appointment.date) return;
      const day = parseDateValue(appointment.date);
      if (Number.isNaN(day.getTime())) return;
      if (day < startDate || day > endDate) return;
      const key = dateValue(periodStart(day));
      appointmentCounts.set(key, (appointmentCounts.get(key) || 0) + 1);
    });
  }
  return <><h2>Reports</h2><div className="card patient-report">
    <div className="report-heading"><div><h3>Patient appointments</h3><p className="muted">Appointments scheduled in the selected date range</p></div>
      <div className="report-filters">
        <label>From<input type="date" value={start} max={end} onChange={e => setStart(e.target.value)} /></label>
        <label>To<input type="date" value={end} min={start} onChange={e => setEnd(e.target.value)} /></label>
        <label>Group by<select value={grouping} onChange={e => setGrouping(e.target.value)}><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option></select></label>
      </div>
    </div>
    {patientError ? <p className="err" role="alert">{patientError}</p> : startDate > endDate ? <p className="muted">Choose a valid date range.</p> :
      <div className="patient-chart"><Bar data={{ labels: periods.map(period => period.label), datasets: [{ label: 'Appointments', data: periods.map(period => appointmentCounts.get(period.key) || 0), backgroundColor: '#7c4199', borderRadius: 5, maxBarThickness: 42 }] }}
        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#74677b', maxRotation: 45, minRotation: 0 }, grid: { color: 'rgba(124,65,153,.07)' } }, y: { beginAtZero: true, ticks: { precision: 0, color: '#74677b' }, grid: { color: 'rgba(124,65,153,.12)' } } } }} /></div>}
  </div>
  <div className="grid2">
    <div className="card"><h3>Revenue by month</h3><Bar data={{ labels: rev.map(r => r[0]), datasets: [{ data: rev.map(r => r[1]), backgroundColor: '#9b63b2', borderRadius: 6 }] }} options={{ plugins: { legend: { display: false } } }} /></div>
    <div className="card"><h3>Treatment mix</h3><Doughnut data={{ labels: mix.map(m => m[0]), datasets: [{ data: mix.map(m => m[1]), backgroundColor: ['#7c4199', '#c98ae3', '#a865c1', '#e5c3f2', '#9b63b2'] }] }} /></div></div></>;
}
function PatientPortal({ name, onSignOut }) {
  const emptyBooking = () => ({ date: todayDate(), time: '', type: '' });
  const [appointments, setAppointments] = useState([]), [form, setForm] = useState(emptyBooking);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const loadAppointments = async () => setAppointments(await api('patient/appointments'));
  useEffect(() => { loadAppointments().catch(e => setError(e.message)); }, []);
  const book = async e => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await api('patient/appointments', 'POST', form);
      setForm(emptyBooking());
      await loadAppointments();
      setNotice('Appointment request sent. It will be confirmed by clinic staff.');
    } catch (e) {
      setError(e.message);
    }
  };
  return <div className="patient-portal">
    <header className="portal-header">
      <div className="portal-welcome"><img className="clinic-logo portal-logo" src="/clinic-logo.png" alt={`${CLINIC_NAME} logo`} /><div><h1>Welcome, {name}</h1><p>Book a visit and track your appointment requests.</p></div></div>
      <button className="ghost" onClick={onSignOut}>Sign out</button>
    </header>
    <div className="portal-grid">
      <form className="card portal-booking" onSubmit={book}>
        <h2>Request an appointment</h2>
        <p className="muted">Your request will stay booked until clinic staff confirms it.</p>
        <label>Date<input required type="date" min={todayDate()} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
        <label>Available time
          <select required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>
            <option value="">Select a time</option>
            {['09:00', '10:30', '12:00', '14:00', '16:00'].map(time => <option key={time} value={time}>{time}</option>)}
          </select>
        </label>
        <label>Reason for visit
          <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="">Select a reason</option>
            {['Routine Check-up', 'Dental Pain', 'Teeth Cleaning', 'Tooth Filling', 'Orthodontic Consultation', 'Other'].map(type => <option key={type}>{type}</option>)}
          </select>
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        {notice && <p className="portal-notice" role="status">{notice}</p>}
        <button type="submit">Request appointment</button>
      </form>
      <section className="card portal-appointments">
        <h2>My appointments</h2>
        {appointments.length ? appointments.map(appointment => <article className="portal-appointment" key={appointment._id}>
          <div><strong>{appointment.date} at {appointment.time}</strong><p>{appointment.type}</p></div>
          <span className={'tag ' + String(appointment.status || 'Booked').toLowerCase()}>{appointment.status || 'Booked'}</span>
        </article>) : <p className="muted">You have no appointment requests yet.</p>}
      </section>
    </div>
  </div>;
}
function Assistant() {
  const [msgs, setMsgs] = useState([{ r: 'ai', t: 'Hi Doctor. I can answer questions about clinic activity and share general oral-health information. For personal diagnosis or treatment advice, please examine the patient or refer to a dentist.' }]), [q, setQ] = useState('');
  const ask = async text => {
    const t = text || q;
    if (!t) return;
    setQ('');
    setMsgs(m => [...m, { r: 'me', t }]);
    try {
      const d = await api('ai', 'POST', { q: t });
      setMsgs(m => [...m, { r: 'ai', t: d.answer }]);
    } catch (error) {
      setMsgs(m => [...m, { r: 'ai', t: `I couldn't answer that right now: ${error.message}` }]);
    }
  };
  return <><h2>AI Assistant</h2><div className="card chat">{msgs.map((m, i) => <p key={i} className={'bubble ' + m.r}>{m.t}</p>)}</div>
    <div className="chips">{['How many patients do we have?', 'How many appointments are today?', 'What is this month’s revenue?', 'How much is unpaid?', 'Which supplies are low?', 'How many treatments are pending?', 'How often should patients brush?', 'How can patients care for their teeth?'].map(x => <button className="ghost" key={x} onClick={() => ask(x)}>{x}</button>)}</div>
    <div className="card form"><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Ask anything about your clinic" /><button onClick={() => ask()}>Ask AI</button></div>
    <p className="muted ai-privacy">General questions may be sent to Google Gemini when configured. Do not enter patient names, contact details, prescriptions, or other identifying health information. Clinic metric questions are answered locally.</p></>;
}

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.token), [role, setRole] = useState(localStorage.role || 'doctor');
  const [tab, setTab] = useState('Dashboard'), [s, setS] = useState(null);
  useEffect(() => {
    if (authed && role === 'doctor') api('stats').then(setS).catch(() => setS(null));
  }, [authed, role, tab]);
  if (!authed) return <Login onDone={user => { setRole(user.role); setAuthed(true); }} />;
  const signOut = () => { localStorage.clear(); setAuthed(false); setRole('doctor'); };
  if (role === 'patient') return <PatientPortal name={localStorage.name} onSignOut={signOut} />;
  return <div className="app"><nav><div className="brand"><img className="clinic-logo nav-logo" src="/clinic-logo-sidebar.png" alt={`${CLINIC_NAME} logo`} /></div>{NAV_ITEMS.map(([label, icon]) => <button key={label} className={`nav-link ${label === tab ? 'on' : ''}`} onClick={() => setTab(label)}><Icon name={icon} size={19} /><span>{label}</span></button>)}
    <button className="out" onClick={signOut}>Sign out</button></nav>
    <main><p className="muted">Welcome back, {localStorage.name}</p>
      {tab === 'Dashboard' && s && <Dashboard s={s} />}{tab === 'Reports' && s && <Reports s={s} />}{tab === 'AI Assistant' && <Assistant />}
      {tab === 'Billing' && <Billing />}
      {tab === 'Patients' && <Patients />}
      {RESOURCES[tab] && <Resource key={tab} title={tab} {...RESOURCES[tab]} />}</main></div>;
}
