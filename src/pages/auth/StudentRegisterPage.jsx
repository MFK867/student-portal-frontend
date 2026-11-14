import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const StudentRegisterPage = () => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const ROLL_NO_REGEX = /^\d{4}-[A-Za-z]{2,5}-[A-Za-z]{2,5}-\d{2,5}$/;

  const handleAutofill = () => {
    setError('');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setName(`Hamza Malik ${randomSuffix}`);
    setStudentId(`2023-BS-AI-${randomSuffix}`);
    setEmail(`hamza.${randomSuffix}@tuf.edu.pk`);
    setPassword('StudentPassword123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@tuf.edu.pk')) {
      setError('Registration is restricted to official student email addresses ending in @tuf.edu.pk.');
      return;
    }

    if (!ROLL_NO_REGEX.test(studentId.trim())) {
      setError('Roll number must start with year (e.g. 2023-BS-AI-025). Format: YYYY-DEGREE-MAJOR-ROLL');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        name: name.trim(),
        student_id: studentId.trim().toUpperCase(),
        email: normalizedEmail,
        password: password,
      });
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Registration</h1>
          <p className="text-xs text-slate-500 mt-1">Create an account to submit and manage your project</p>
        </div>

        {/* Demo Quickfill */}
        <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex justify-between items-center">
          <span className="text-xs text-slate-600 font-medium">Need sample student info?</span>
          <button
            type="button"
            onClick={handleAutofill}
            className="py-1 px-2.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md shadow-2xs transition-colors"
          >
            Autofill Sample
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Registration Form (Only 4 fields: Name, Roll Number, Email, Password) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Ahmad"
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Student Roll Number
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 2023-BS-AI-025"
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Format: YYYY-DEGREE-MAJOR-ROLL (must start with year)</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Institutional Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@tuf.edu.pk"
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">Must be an official @tuf.edu.pk email address</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 text-sm font-medium rounded-lg shadow-sm transition-colors mt-2"
          >
            {loading ? 'Creating Account...' : 'Register Student Account'}
          </button>
        </form>

        {/* Sign In link */}
        <div className="border-t border-slate-100 mt-6 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-slate-900 underline hover:text-slate-700">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
