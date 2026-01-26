import { useState, useEffect } from 'react'
import './App.css'
import authService from './services/auth.service'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)

  useEffect(() => {
    const token = authService.getToken()
    const savedUser = authService.getUser()
    
    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(savedUser)
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowRegister(false)
  }

  const handleRegisterSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowRegister(false)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    setFile(null)
    setPrompt('')
    setResponse(null)
    setError(null)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
      setResponse(null)
      setPrompt('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a PDF file')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error('You are not authenticated')
      }

      const formData = new FormData()
      formData.append('file', file)
      if (prompt.trim()) {
        formData.append('prompt', prompt.trim())
      }

      const fetchResponse = await fetch('http://localhost:3001/analysis', {
        method: 'POST',
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      const data = await fetchResponse.json()

      if (!fetchResponse.ok) {
        if (fetchResponse.status === 401) {
          handleLogout()
          throw new Error('Session expired. Please log in again.')
        }
        throw new Error(data.error || data.message || 'Error processing the document')
      }

      setResponse(data)
      setFile(null)
      setPrompt('')
      e.target.reset()
    } catch (err) {
      setError(err.message || 'Error sending the document')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div>
        {showRegister ? (
          <Register onRegisterSuccess={handleRegisterSuccess} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {showRegister ? (
            <p style={{ color: 'white' }}>
              Already have an account?{' '}
              <button
                onClick={() => setShowRegister(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p style={{ color: 'white' }}>
              Don't have an account?{' '}
              <button
                onClick={() => setShowRegister(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#4a5568' }}>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <h1>Document Analyzer</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <label htmlFor="pdf-file" className="file-label">
            Select PDF file
          </label>
          <input
            id="pdf-file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="file-input"
          />
          {file && (
            <p className="file-name">Selected file: {file.name}</p>
          )}
        </div>

        <div className="prompt-input-container">
          <label htmlFor="prompt" className="prompt-label">
            Optional prompt (to guide the analysis)
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="prompt-textarea"
            placeholder="Enter an optional prompt to guide the analysis or ask questions about the document..."
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="submit-button"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {response && (
        <ResponsePanel response={response} />
      )}
    </div>
  )
}

function ResponsePanel({ response }) {
  if (response.status === 'warning' || response.status === 'error') {
    return (
      <div className={`response-panel ${response.status === 'warning' ? 'warning-message' : 'error-message'}`}>
        <h3 className="response-title">
          {response.status === 'warning' ? 'Warning' : 'Error'}
        </h3>
        <p>{response.message}</p>
      </div>
    )
  }

  if (response.status === 'success' && response.data) {
    const { summary, keyPoints, insights, notes, answers } = response.data

    return (
      <div className="response-panel success-panel">
        <h2 className="response-title">Analysis Results</h2>
        
        {summary && summary.trim() && (
          <section className="response-section">
            <h3 className="section-title">Summary</h3>
            <div className="summary-text">
              {summary.split('\n').map((line, idx) => (
                <p key={idx}>{line || '\u00A0'}</p>
              ))}
            </div>
          </section>
        )}

        {keyPoints && keyPoints.length > 0 && (
          <section className="response-section">
            <h3 className="section-title">Key Points</h3>
            <ul className="bullet-list">
              {keyPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </section>
        )}

        {insights && insights.length > 0 && (
          <section className="response-section">
            <h3 className="section-title">Insights</h3>
            <ul className="bullet-list">
              {insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </section>
        )}

        {notes && notes.trim() && (
          <section className="response-section">
            <h3 className="section-title">Notes</h3>
            <p className="notes-text">{notes}</p>
          </section>
        )}

        {answers && answers.length > 0 && (
          <section className="response-section">
            <h3 className="section-title">Answers</h3>
            <ol className="numbered-list">
              {answers.map((answer, idx) => (
                <li key={idx}>{answer}</li>
              ))}
            </ol>
          </section>
        )}
      </div>
    )
  }

  return null
}

export default App
