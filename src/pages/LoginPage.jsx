import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(username, password)
    if (result.success) {
      navigate('/home')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.logoWrap}>
          <h1 style={styles.logo} aria-label="Ski Butlers">SKI BUTLERS</h1>
          <div style={styles.logoRule} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label htmlFor="username" style={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            data-testid="username-input"
          />

          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            data-testid="password-input"
          />

          {error && (
            <p role="alert" className="error-message" data-testid="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            data-testid="login-submit"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    overflowX: 'hidden',
  },
  inner: {
    width: '100%',
    maxWidth: '400px',
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  logo: {
    fontSize: '36px',
    fontWeight: '900',
    letterSpacing: '6px',
    color: '#FFD700',
    textTransform: 'uppercase',
  },
  logoRule: {
    height: '2px',
    backgroundColor: '#FFD700',
    marginTop: '12px',
    borderRadius: '1px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '13px',
    color: '#9aa0b4',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '-4px',
  },
  submitBtn: {
    marginTop: '16px',
  },
}
