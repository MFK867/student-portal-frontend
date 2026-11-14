import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileUp,
  Compass,
  Award,
  User,
  LogOut,
  X,
  FileCheck2,
  Clock,
  Users,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isStudent, isTeacher, logout } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/student/projects', icon: FolderKanban },
    { name: 'Submit Project', path: '/student/submit', icon: FileUp },
    { name: 'Explore Projects', path: '/showcase', icon: Compass },
    { name: 'Feedback & Grades', path: '/student/feedback', icon: Award },
    { name: 'My Profile', path: '/student/profile', icon: User },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'All Submissions', path: '/teacher/submissions', icon: FileCheck2 },
    { name: 'Pending Reviews', path: '/teacher/pending', icon: Clock },
    { name: 'Students', path: '/teacher/students', icon: Users },
    { name: 'Explore Showcase', path: '/showcase', icon: Compass },
    { name: 'My Profile', path: '/teacher/profile', icon: User },
  ];

  const links = isStudent ? studentLinks : teacherLinks;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 sm:px-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0B1320] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold tracking-tight text-[#0B1320] block leading-none font-mono truncate">
                THE UNIVERSITY OF FAISALABAD
              </span>
              <span className="text-[10px] font-medium text-slate-500 block mt-1 tracking-wider uppercase truncate">
                {isStudent ? 'Student Workspace' : isTeacher ? 'Faculty Portal' : 'Academic Portal'}
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden flex-shrink-0 ml-1"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {isStudent ? 'Student Workspace' : 'Academic Faculty'}
            </span>
          </div>

          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-xs font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-slate-100 text-[#0B1320] font-bold border-l-4 border-[#0B1320]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0 text-slate-400 group-hover:text-slate-700" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info & Logout button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="px-2.5 py-2 mb-2 bg-white rounded-lg border border-slate-200/80">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Department Portal</p>
            <p className="text-xs font-semibold text-slate-800 truncate">The University of Faisalabad</p>
            <p className="text-[10px] text-slate-500 font-mono">Official Portal &copy; 2026</p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
