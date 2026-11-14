import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeacherLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginTeacher } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      await loginTeacher(email, password, rememberMe);
      navigate('/teacher/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid faculty credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-black">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gateway</span>
        </Link>
        <span className="text-xs font-mono font-semibold text-slate-800">The University of Faisalabad</span>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-7 sm:p-9 space-y-6">
          {/* Form Header */}
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1320] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Faculty Evaluation Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Academic Project Review & Rubric Evaluation System
            </p>
          </div>

          {/* Info note regarding registration */}
          <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-700 leading-relaxed">
            Faculty accounts are provisioned directly by the Academic Department. Public self-registration is restricted to students only.
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Faculty University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="dr.farhan@tuf.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your faculty password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#0B1320] focus:ring-[#0B1320]"
                />
                <span className="text-xs text-slate-600">Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Faculty Evaluator'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Need to access as student?{' '}
              <Link to="/login/student" className="font-semibold text-slate-900 hover:underline">
                Student Portal Login &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="py-3 text-center text-[11px] text-slate-400 bg-white border-t border-slate-200 font-mono">
        The University of Faisalabad &bull; Faculty Evaluation Information Portal
      </footer>
    </div>
  );
};

export default TeacherLoginPage;