import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await login(email.trim(), password, rememberMe);
      if (userData.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Sign in failed. Check your email and password.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofill = (type) => {
    setError('');
    if (type === 'student') {
      setEmail('ali.ahmad@tuf.edu.pk');
      setPassword('StudentPassword123');
    } else if (type === 'admin') {
      setEmail('faisalkamran867@gmail.com');
      setPassword('FkAdmin@892#zQ!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl p-8">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 text-white font-bold text-sm font-mono mb-3">
            PP
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Project Portal Login</h1>
          <p className="text-xs text-slate-500 mt-1">Single sign-in for students, faculty, and administrators</p>
        </div>

        {/* Demo Quickfill Buttons */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="text-[11px] font-medium text-slate-500 mb-2">Demo Quick Autofill</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAutofill('student')}
              className="flex-1 py-1.5 px-3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md shadow-2xs transition-colors"
            >
              Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('admin')}
              className="flex-1 py-1.5 px-3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md shadow-2xs transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@tuf.edu.pk or admin email"
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0"
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 text-sm font-medium rounded-lg shadow-sm transition-colors mt-2"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Register footer link */}
        <div className="border-t border-slate-100 mt-6 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Student without an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 underline hover:text-slate-700">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
