import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="error">
        <h2>Failed to load data</h2>
        <p>Make sure the backend server is running on port 8000</p>
      </div>
    )
  }

  const pieData = [
    { name: 'Not Resampled', value: data.pending_resamples.not_resampled, color: '#f4c430' },
    { name: 'For Investigation', value: data.pending_resamples.for_investigation, color: '#8b5cf6' },
    { name: 'Resolved', value: data.pending_resamples.resolved, color: '#14b8a6' }
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">QC DASHBOARD</h1>
            <p className="subtitle">STATISTICAL GRAPH</p>
          </div>
          <div className="year-badge">{data.year}</div>
        </div>
      </header>

      <div className="dashboard-grid">
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
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#f4c430' }}></div>
                <span>NOT RESAMPLED</span>
                <span className="legend-value">{data.pending_resamples.not_resampled}</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
                <span>FOR INVESTIGATION</span>
                <span className="legend-value">{data.pending_resamples.for_investigation}</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#14b8a6' }}></div>
                <span>RESOLVED</span>
                <span className="legend-value">{data.pending_resamples.resolved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Complaints */}
        <div className="card customer-complaints">
          <h2 className="card-title">CUSTOMER COMPLAINT</h2>
          <div className="complaint-subtitle">2026</div>
          <div className="complaint-badges">
            {data.customer_complaints.map((complaint, index) => (
              <div key={index} className="complaint-badge">
                {complaint.month}
              </div>
            ))}
          </div>
        </div>

        {/* QS Rated */}
        <div className="card qs-rated">
          <h2 className="card-title">QS RATED JANUARY</h2>
          <div className="rating-bars">
            {data.qs_ratings.map((rating, index) => (
              <div key={index} className="rating-row">
                <div className="rating-label">{rating.feedback}</div>
                <div className="rating-bar-container">
                  <div 
                    className="rating-bar" 
                    style={{ width: `${rating.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
