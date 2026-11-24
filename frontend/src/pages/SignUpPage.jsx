import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'At least 1 uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'At least 1 lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'At least 1 number (0-9)', test: (pw) => /[0-9]/.test(pw) },
  {
    id: 'special',
    label: 'At least 1 special character (!@#$%^&*...)',
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ruleResults = PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));
  const missingRules = ruleResults.filter((r) => !r.met);
  const isPasswordStrong = missingRules.length === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError(
        `Password is too weak. Please add: ${missingRules
          .map((r) => r.label.toLowerCase())
          .join(', ')}.`
      );
      return;
    }

    setSubmitting(true);

    try {
      await signup({ name, email, password });
      navigate('/todos');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-container">
      <div className="card auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Sign up to start organizing your tasks with TaskFlow.</p>

        <form onSubmit={handleSubmit} className="stack-form">
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="password-hint-box" aria-live="polite">
              <div className="password-strength-row">
                <span className="password-hint-title">Password requirements</span>
                {password.length > 0 && (
                  <span
                    className={`strength-pill ${
                      isPasswordStrong ? 'strength-strong' : 'strength-weak'
                    }`}
                  >
                    {isPasswordStrong ? 'Strong' : 'Weak'}
                  </span>
                )}
              </div>

              {password.length > 0 && !isPasswordStrong && (
                <p className="password-weak-tip">
                  Hint: Use a mix of uppercase, lowercase, numbers, and symbols (e.g.,{' '}
                  <code>Task@2026</code>).
                </p>
              )}

              <ul className="password-rules-list">
                {ruleResults.map((rule) => (
                  <li key={rule.id} className={rule.met ? 'rule-met' : 'rule-unmet'}>
                    <span className="rule-icon" aria-hidden="true">
                      {rule.met ? '✓' : '•'}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && <p className="error-banner" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
