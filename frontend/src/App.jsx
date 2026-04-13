import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import './App.css'

function LogEntryPage({ apiUrl, onCreated }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today,
    code: '',
    batch_number: '',
    reason: '',
    actual: '',
    standard: '',
  })
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (status) setStatus(null)
  }

  const handleSubmit = async () => {
    const missing = Object.entries(form).filter(([, v]) => !v.trim()).map(([k]) => k)
    if (missing.length) {
      setErrorMsg(`Please fill in: ${missing.join(', ')}`)
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch(apiUrl + '/qc_cases/createcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      setStatus('success')
      setForm({ date: today, code: '', batch_number: '', reason: '', actual: '', standard: '' })
      if (onCreated) onCreated()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit. Please try again.')
      setStatus('error')
    }
  }

  const fields = [
    { name: 'date', label: 'Date', type: 'date', placeholder: '' },
    { name: 'code', label: 'Code', type: 'text', placeholder: 'e.g. QC-2026-001' },
    { name: 'batch_number', label: 'Batch Number', type: 'text', placeholder: 'e.g. BN-4892' },
    { name: 'reason', label: 'Reason', type: 'text', placeholder: 'Describe the reason for this entry' },
    { name: 'actual', label: 'Actual Value', type: 'text', placeholder: 'e.g. 98.5' },
    { name: 'standard', label: 'Standard Value', type: 'text', placeholder: 'e.g. 100.0' },
  ]

  return (
    <div className="entry-page">
      <div className="entry-container">
        <div className="entry-header">
          <h2 className="entry-title">NEW LOG ENTRY</h2>
          <p className="entry-subtitle">QUALITY CONTROL RECORD</p>
        </div>

        <div className="entry-form">
          <div className="form-grid">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name} className="form-group">
                <label className="form-label" htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="form-input"
                />
              </div>
            ))}
          </div>

          {status === 'error' && (
            <div className="form-alert form-alert--error">
              <span className="alert-icon">⚠</span>
              {errorMsg}
            </div>
          )}
          {status === 'success' && (
            <div className="form-alert form-alert--success">
              <span className="alert-icon">✓</span>
              Entry submitted successfully!
            </div>
          )}

          <div className="form-footer">
            <div className="json-preview">
              <p className="preview-label">PAYLOAD PREVIEW</p>
              <pre className="preview-code">{JSON.stringify(form, null, 2)}</pre>
            </div>
            <button
              className={`submit-btn ${status === 'loading' ? 'submit-btn--loading' : ''}`}
              onClick={handleSubmit}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <><span className="btn-spinner"></span> Submitting...</>
              ) : 'SUBMIT ENTRY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const STATUS_MAP = {
  0: { label: 'OTHERS', color: '#6b7280' },
  1: { label: 'NO RESAMPLE', color: '#f4c430' },
  2: { label: 'RESAMPLE SUBMITTED TO QC', color: '#8b5cf6' },
  5: { label: 'QC DISPOSITION', color: '#f97316' },
}

const DISPOSITION_OPTIONS = ['approved', 'conditionally approved', 'failed']
const CONDITION_OPTIONS = ['Formula', 'Process', 'FBC', 'Material']

function EditCaseModal({ apiUrl, qcCase, onClose, onUpdated }) {
  const savedConditions = qcCase.disposition_conditions ? qcCase.disposition_conditions.split(',') : []
  const otherStatuses = Object.keys(STATUS_MAP).filter(k => k !== String(qcCase.status))
  const [form, setForm] = useState({
    status: otherStatuses[0] ?? '',
    qc_disposition: qcCase.qc_disposition ?? '',
    notes: qcCase.notes ?? '',
    result_after_resample: qcCase.result_after_resample ?? '',
    disposition_result: qcCase.disposition_result ?? '',
    disposition_conditions: savedConditions,
  })
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (submitStatus) setSubmitStatus(null)
  }

  const handleConditionSelect = (condition) => {
    setForm(prev => ({
      ...prev,
      disposition_conditions: prev.disposition_conditions.includes(condition) ? [] : [condition]
    }))
    if (submitStatus) setSubmitStatus(null)
  }

  const isQcDisposition = form.status === '5'
  const isConditionallyApproved = isQcDisposition && form.disposition_result === 'conditionally approved'

  const handleSave = async () => {
    setSubmitStatus('loading')
    try {
      const payload = {
        code: qcCase.code,
        status: Number(form.status),
        qc_disposition: form.qc_disposition || null,
        notes: form.notes || null,
        result_after_resample: form.result_after_resample !== '' ? Number(form.result_after_resample) : null,
        disposition_result: isQcDisposition ? (form.disposition_result || null) : null,
        disposition_conditions: isConditionallyApproved && form.disposition_conditions.length > 0
          ? form.disposition_conditions.join(',')
          : null,
      }
      const res = await fetch(apiUrl + '/qc_cases/updatecase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      setSubmitStatus('success')
      setTimeout(() => { onUpdated(); onClose() }, 700)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update.')
      setSubmitStatus('error')
    }
  }

  return (
    <div className="modal-backdrop modal-backdrop--top" onClick={onClose}>
      <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div>
              <h2 className="modal-title">EDIT CASE</h2>
              <p className="modal-subtitle">{qcCase.code} · {qcCase.batch_number}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body edit-modal-body">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-input form-select">
              {Object.entries(STATUS_MAP)
                .filter(([val]) => val !== String(qcCase.status))
                .map(([val, info]) => (
                  <option key={val} value={val}>{info.label}</option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Result After Resample</label>
            <input
              type="number"
              step="any"
              name="result_after_resample"
              value={form.result_after_resample}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter result value…"
            />
          </div>

          {isQcDisposition && (
            <div className="form-group">
              <label className="form-label">Disposition Result</label>
              <select name="disposition_result" value={form.disposition_result} onChange={handleChange} className="form-input form-select">
                <option value="">Select…</option>
                {DISPOSITION_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}

          {isConditionallyApproved && (
            <div className="form-group">
              <label className="form-label">Conditions</label>
              <div className="checkbox-group">
                {CONDITION_OPTIONS.map(condition => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.disposition_conditions.includes(condition)}
                      onChange={() => handleConditionSelect(condition)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{condition}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">QC Disposition</label>
            <input
              type="text"
              name="qc_disposition"
              value={form.qc_disposition}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter QC disposition…"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter notes…"
            />
          </div>

          {submitStatus === 'error' && (
            <div className="form-alert form-alert--error">
              <span className="alert-icon">⚠</span>
              {errorMsg}
            </div>
          )}
          {submitStatus === 'success' && (
            <div className="form-alert form-alert--success">
              <span className="alert-icon">✓</span>
              Case updated successfully!
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="submit-btn submit-btn--ghost" onClick={onClose}>CANCEL</button>
          <button
            className={`submit-btn ${submitStatus === 'loading' ? 'submit-btn--loading' : ''}`}
            onClick={handleSave}
            disabled={submitStatus === 'loading'}
          >
            {submitStatus === 'loading' ? <><span className="btn-spinner"></span> Saving…</> : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResamplesModal({ apiUrl, statusFilter, onClose, onDashboardRefresh }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingCase, setEditingCase] = useState(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    const url = statusFilter === null
      ? apiUrl + '/qc_cases/getallcases'
      : apiUrl + `/qc_cases/getcasesbystatus?status=${statusFilter}`
    fetch(url)
      .then(res => { if (!res.ok) throw new Error(res.status); return res.json() })
      .then(data => { setRows(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [apiUrl, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const statusInfo = statusFilter === null
    ? { label: 'ALL CASES', color: '#e5e7eb' }
    : STATUS_MAP[statusFilter] ?? { label: 'ALL', color: '#e5e7eb' }

  const fmt = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const cols = [
    { key: '_edit',          label: '',               render: r => (
      <button
        className="edit-row-btn"
        onClick={e => { e.stopPropagation(); setEditingCase(r) }}
      >
        Edit
      </button>
    )},
    { key: 'code',           label: 'Code' },
    { key: 'batch_number',   label: 'Batch #' },
    { key: 'date',           label: 'Date',           render: r => fmt(r.date) },
    { key: 'reason',         label: 'Reason' },
    { key: 'actual',         label: 'Actual' },
    { key: 'standard',       label: 'Standard' },
    { key: 'result_after_resample', label: 'Result After Resample', render: r => r.result_after_resample ?? '—' },
    { key: 'status',         label: 'Status',         render: r => {
      const s = STATUS_MAP[r.status]
      return s ? <span className="status-pill" style={{ '--pill-color': s.color }}>{s.label}</span> : r.status
    }},
    { key: 'disposition_result', label: 'Disposition Result', render: r => r.disposition_result ? r.disposition_result.toUpperCase() : '—' },
    { key: 'disposition_conditions', label: 'Conditions', render: r => r.disposition_conditions || '—' },
    { key: 'qc_disposition', label: 'QC Disposition', render: r => r.qc_disposition ?? '—' },
    { key: 'notes',          label: 'Notes',          render: r => r.notes ?? '—' },
    { key: 'createdDate',    label: 'Created',        render: r => fmt(r.createdDate) },
    { key: 'updatedDate',    label: 'Updated',        render: r => fmt(r.updatedDate) },
  ]

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-group">
              <span className="modal-dot" style={{ background: statusInfo.color }}></span>
              <div>
                <h2 className="modal-title">
                  {statusFilter === null ? 'ALL QC CASES' : 'PENDING QC'}
                </h2>
                <p className="modal-subtitle">{statusInfo.label}</p>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            {loading && (
              <div className="modal-loading">
                <div className="spinner"></div>
                <p>Loading records…</p>
              </div>
            )}
            {error && (
              <div className="form-alert form-alert--error">
                <span className="alert-icon">⚠</span>
                Failed to load data: {error}
              </div>
            )}
            {!loading && !error && rows.length === 0 && (
              <div className="modal-empty">No records found.</div>
            )}
            {!loading && !error && rows.length > 0 && (
              <div className="table-scroll">
                <table className="resample-table">
                  <thead>
                    <tr>
                      {cols.map(c => <th key={c.key}>{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id}>
                        {cols.map(c => (
                          <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <span className="modal-count">{rows.length} record{rows.length !== 1 ? 's' : ''}</span>
            <button className="submit-btn" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }} onClick={onClose}>CLOSE</button>
          </div>
        </div>
      </div>

      {editingCase && (
        <EditCaseModal
          apiUrl={apiUrl}
          qcCase={editingCase}
          onClose={() => setEditingCase(null)}
          onUpdated={() => { fetchData(); if (onDashboardRefresh) onDashboardRefresh() }}
        />
      )}
    </>
  )
}

function App() {
  const [page, setPage] = useState('dashboard') // 'dashboard' | 'entry'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  // undefined = closed, null = all cases, 1/2/3 = filtered by status
  const [modalStatus, setModalStatus] = useState(undefined)
  const apiUrl = import.meta.env.VITE_API_URL

  const fetchDashboard = useCallback(() => {
    fetch(apiUrl + '/qc_cases/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setLoading(false)
      })
  }, [apiUrl])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    )
  }

  if (!data && page === 'dashboard') {
    return (
      <div className="error">
        <h2>Failed to load data</h2>
        <p>Make sure the backend server is running on port 8000</p>
      </div>
    )
  }

  const pieData = data ? [
    { name: 'No Resample', value: data.pending_resamples.not_resampled, color: '#f4c430' },
    { name: 'Resample Submitted to QC', value: data.pending_resamples.for_investigation, color: '#8b5cf6' }
  ] : []

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">QC DASHBOARD</h1>
            <p className="subtitle">STATISTICAL GRAPH</p>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${page === 'dashboard' ? 'nav-btn--active' : ''}`}
              onClick={() => setPage('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${page === 'entry' ? 'nav-btn--active' : ''}`}
              onClick={() => setPage('entry')}
            >
              + Log Entry
            </button>
            <button
              className="nav-btn"
              onClick={() => setModalStatus(null)}
            >
              All Cases
            </button>
          </nav>
          <div className="year-badge">{data?.year ?? new Date().getFullYear()}</div>
        </div>
      </header>

      {page === 'entry' && <LogEntryPage apiUrl={apiUrl} onCreated={fetchDashboard} />}

      {page === 'dashboard' && data && <div className="dashboard-grid">
        {/* Quality Issues */}
        <div className="card quality-issues">
          <h2 className="card-title">QUALITY ISSUES</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.quality_issues}>
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.quality_issues.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#8b5cf6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Disable Rates */}
        <div className="card disable-rates">
          <h2 className="card-title">PERCENTAGE OF RESAMPLE PER MONTH</h2>
          <div className="gauge-grid">
            {data.disable_rates.map((rate, index) => (
              <div key={index} className="gauge-item">
                <div className="gauge">
                  <svg viewBox="0 0 100 60" className="gauge-svg">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#2d3548"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${rate.percentage * 1.26} 126`}
                      className="gauge-fill"
                    />
                  </svg>
                  <div className="gauge-value">{rate.percentage}%</div>
                </div>
                <div className="gauge-label">{rate.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Resamples */}
        <div className="card pending-resamples">
          <h2 className="card-title">NUMBER OF PENDING RESAMPLES</h2>
          <div className="pie-container">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              <div className="legend-item legend-item--clickable" onClick={() => setModalStatus(1)}>
                <div className="legend-color" style={{ background: '#f4c430' }}></div>
                <span>NO RESAMPLE</span>
                <span className="legend-value">{data.pending_resamples.not_resampled}</span>
                <span className="legend-arrow">›</span>
              </div>
              <div className="legend-item legend-item--clickable" onClick={() => setModalStatus(2)}>
                <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
                <span>RESAMPLE SUBMITTED TO QC</span>
                <span className="legend-value">{data.pending_resamples.for_investigation}</span>
                <span className="legend-arrow">›</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Complaints */}
        <div className="card customer-complaints">
          <h2 className="card-title">CUSTOMER COMPLAINT</h2>
          <div className="coming-soon-overlay">
            <span className="coming-soon-text">COMING SOON</span>
          </div>
        </div>

        {/* QS Rated */}
        <div className="card qs-rated">
          <h2 className="card-title">QS RATED {(data.qs_ratings_month ?? 'MONTH').toUpperCase()}</h2>
          <div className="rating-bars">
            {(() => {
              const maxVal = Math.max(...data.qs_ratings.map(r => r.value), 1)
              return data.qs_ratings.map((rating, index) => (
                <div key={index} className="rating-row">
                  <div className="rating-label">{rating.feedback}</div>
                  <div className="rating-bar-container">
                    <div
                      className="rating-bar"
                      style={{ width: `${(rating.value / maxVal) * 100}%` }}
                    ></div>
                    <span className="rating-count">{rating.value}</span>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>}

      {modalStatus !== undefined && (
        <ResamplesModal
          apiUrl={apiUrl}
          statusFilter={modalStatus}
          onClose={() => setModalStatus(undefined)}
          onDashboardRefresh={fetchDashboard}
        />
      )}
    </div>
  )
}

export default App
