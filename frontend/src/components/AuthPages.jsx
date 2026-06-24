import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowLeft } from 'lucide-react';
import './AuthPages.css';

const TallyLogo = ({ size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} tally-logo-svg`}
  >
    {/* Trend Line */}
    <path d="M22 55 L42 35 L58 45 L78 20" />
    {/* Arrow Head */}
    <path d="M66 20 H78 V32" />
    {/* Bar 1 */}
    <rect x="26" y="64" width="10" height="16" rx="2" fill="none" />
    {/* Bar 2 */}
    <rect x="44" y="52" width="10" height="28" rx="2" fill="none" />
    {/* Bar 3 */}
    <rect x="62" y="38" width="10" height="42" rx="2" fill="none" />
  </svg>
);

export const AuthPages = () => {
  const [stage, setStage] = useState('welcome');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage('Password reset link sent to your email (simulated).');
    setTimeout(() => {
      setInfoMessage(null);
    }, 4000);
  };


  // Render Welcome/Launch screen (Stage 1-B)
  if (stage === 'welcome') {
    return (
      <div className="auth-page-container">
        <div className="glass-card welcome-fade-in auth-card">
          {/* Logo container */}
          <div className="welcome-logo-wrapper">
            <TallyLogo size={80} />
          </div>

          <h1 className="auth-card-title">
            <span className="gradient-text">Tally</span>
          </h1>

          <p className="auth-card-description">
            Your intelligent AI-powered spending assistant. Scan receipts, chat, and track your finances effortlessly.
          </p>

          <div className="auth-button-group">
            <button
              onClick={() => {
                setIsLogin(true);
                setStage('form');
              }}
              className="btn btn-primary auth-btn-welcome-primary"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setStage('form');
              }}
              className="btn btn-secondary auth-btn-welcome-secondary"
            >
              Sign Up
            </button>
          </div>

          <div className="auth-forgot-password-link-wrapper">
            <a
              href="#"
              onClick={handleForgotPassword}
              className="auth-forgot-password-link"
            >
              Forgot Password?
            </a>
          </div>

          {infoMessage && (
            <div className="auth-info-message">
              {infoMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Login/Signup Form (Stage 2)
  return (
    <div className="auth-page-container">
      <div className="glass-card welcome-fade-in auth-form-card">
        {/* Back Button */}
        <button
          onClick={() => {
            setStage('welcome');
            setError(null);
            setInfoMessage(null);
          }}
          className="auth-back-btn"
          title="Back to Welcome"
        >
          <ArrowLeft size={20} />
        </button>
        {/* Branding Header */}
        <div className="auth-form-header">
          <div className="auth-form-logo-wrapper">
            <TallyLogo size={36} />
          </div>
          <h2 className="auth-form-title">
            <span className="gradient-text">Tally</span>
          </h2>
          <p className="auth-form-subtitle">
            {isLogin ? 'Sign in to access your AI spending assistant' : 'Create an account to start tracking smart'}
          </p>
        </div>

        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="auth-form-info-message">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group form-group-relative">
              <label className="form-label" htmlFor="register-name">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className="form-input auth-input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input auth-input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-2rem">
            <div className="auth-password-header">
              <label className="form-label" htmlFor="auth-password">Password</label>
              {isLogin && (
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="auth-password-forgot-link"
                >
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type="password"
                className="form-input auth-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch-prompt">
          <span className="auth-switch-text">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setInfoMessage(null);
            }}
            className="auth-switch-btn"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
