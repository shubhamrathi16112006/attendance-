import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ff4757', '#ffa502', '#2ed573', '#6c63ff'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card auth-card-register">
        <div className="auth-logo">
          <div className="auth-logo-mark">A</div>
          <div className="auth-logo-text">
            <span className="auth-logo-name">AttendX</span>
            <span className="auth-logo-tag">Management Portal</span>
          </div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join AttendX to manage attendance</p>
        </div>

        {error && (
          <div className="auth-error">
            <span className="auth-error-icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">◉</span>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉</span>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
              {password.length > 0 && (
                <span className="strength-tag" style={{ color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </span>
              )}
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">⚿</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-pass-toggle"
                onClick={() => setShowPass(p => !p)}
                tabIndex="-1"
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {password.length > 0 && (
              <div className="strength-bar">
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className="strength-segment"
                    style={{ background: i <= strength ? strengthColor[strength] : undefined }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                {confirm.length > 0 ? (confirm === password ? '✓' : '✗') : '⚿'}
              </span>
              <input
                id="confirm"
                type={showPass ? 'text' : 'password'}
                className={`auth-input ${confirm.length > 0 ? (confirm === password ? 'input-ok' : 'input-err') : ''}`}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className={`auth-submit ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
