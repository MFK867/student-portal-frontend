import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isStudent, logout } = useAuth();

  const studentProfile = user?.student_profile;
  const teacherProfile = user?.teacher_profile;

  const roleLabel = isStudent
    ? (studentProfile?.student_id || 'Student')
    : (user?.role === 'admin' ? 'Administrator' : (teacherProfile?.designation || 'Faculty Evaluator'));

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to={isStudent ? '/student/dashboard' : '/teacher/dashboard'}
          className="flex items-center space-x-3 group"
        >
          <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono shadow-sm">
            PP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-slate-900">
                PROJECT PORTAL
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {isStudent ? 'Student Submission Workspace' : 'Faculty Evaluation Desk'}
            </span>
          </div>
        </Link>

        {/* User Info & Sign Out */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono border border-slate-200">
              {getInitials(user?.name)}
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">
                {user?.name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono block">
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
