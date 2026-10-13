import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, ArrowLeft, AlertCircle, Shield, Mail, Lock, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '../services/supabase';
import LegalDisclaimer from '../components/LegalDisclaimer';

export default function Login({ user, initialMode = 'signin' }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine mode from prop or query param (?mode=signup)
  const queryParams = new URLSearchParams(location.search);
  const initial = queryParams.get('mode') === 'signup' || location.pathname === '/signup' ? 'signup' : initialMode;

  const [mode, setMode] = useState(initial); // 'signin' or 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Sync mode if pathname changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('signin');
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const data = await signUpWithEmail(email.trim(), password, fullName.trim());
        // If session created automatically, App.jsx onAuthStateChange will detect user
        if (data?.session) {
          navigate(from, { replace: true });
        } else {
          setSuccessMessage(
            'Account created successfully! If email confirmation is enabled on your Supabase project, please check your inbox to confirm your email before signing in.'
          );
        }
      } else {
        await signInWithEmail(email.trim(), password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          'Supabase credentials are not configured in frontend/.env. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable Google OAuth.'
        );
      }

      await signInWithGoogle();
      // Google OAuth redirects the browser to Google consent screen
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Failed to initiate Google OAuth sign-in.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--accent-gold-bg)', borderRadius: '50%', color: 'var(--accent-gold)' }}>
            <Scale size={36} />
          </div>
          <h1 className="legal-heading" style={{ fontSize: '1.75rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            Legal Case Finder AI
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {mode === 'signup'
              ? 'Create a free account to save legal research and track court precedents.'
              : 'Sign in to access your saved court cases and research history.'}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-alt)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-light)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); setSuccessMessage(null); }}
            style={{
              flex: 1,
              padding: '0.55rem 0',
              fontWeight: 600,
              fontSize: '0.925rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? 'var(--primary-navy)' : 'var(--text-muted)',
              boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
            style={{
              flex: 1,
              padding: '0.55rem 0',
              fontWeight: 600,
              fontSize: '0.925rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? 'var(--primary-navy)' : 'var(--text-muted)',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sign Up (Register)
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem' }}>{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#059669' }} />
            <div style={{ fontSize: '0.875rem', color: '#065f46' }}>{successMessage}</div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.25rem' }}>
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="fullName">
                Full Name <span className="optional">(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="fullName"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Rajesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
                <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" htmlFor="email">
              Email Address <span style={{ color: 'var(--accent-gold)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="email"
                required
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="password">
              Password <span style={{ color: 'var(--accent-gold)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                required
                minLength={6}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.975rem' }}
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account (Sign Up)' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
          <span style={{ padding: '0 0.75rem', fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
        </div>

        {/* Continue with Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '0.75rem 1.25rem',
            fontSize: '0.95rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Official Google 'G' SVG Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          <Shield size={14} />
          <span>Secured by Supabase Authentication & PostgreSQL RLS</span>
        </div>

        {/* Legal Disclaimer Box */}
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <LegalDisclaimer compact={true} />
        </div>

        {/* Return to homepage */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <ArrowLeft size={15} />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
