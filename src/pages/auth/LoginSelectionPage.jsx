import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Compass, ArrowRight, UserCheck, BookOpen, Lock } from 'lucide-react';

export const LoginSelectionPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B1320] text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-[#0B1320] uppercase font-mono">
              The University of Faisalabad
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Academic Project Management & Evaluation Portal
            </p>
          </div>
        </div>

        <Link
          to="/showcase"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-800 hover:text-black bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-slate-700" />
          <span>Project Directory</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 sm:py-14 flex flex-col items-center justify-center">
        <div className="text-center max-w-xl mb-10">
          <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md mb-3 font-semibold">
            <span>Institutional Access Point</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Authentication Gateway
          </h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Centralized portal for semester projects, capstone submissions, SRS document verification, code archives, and faculty rubric evaluations.
          </p>
        </div>

        {/* Portals Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Student Portal */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1320] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enrolled Undergraduate & Graduate Students</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Submit semester & final-year projects with SRS & code ZIP
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Track title approvals, revision requests, and workflow status
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Privately access teacher feedback, 100-mark rubric scores & grades
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Publish approved projects to university peer showcase
                </li>
              </ul>
            </div>

            <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/login/student"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <span>Student Login</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
              <Link
                to="/register/student"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Register Account</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Faculty / Teacher Portal */}
          <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1320] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Faculty Evaluation Portal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Authorized Faculty, Instructors & Project Supervisors</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Approve, revise, or reject submitted project titles
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Inspect SRS specifications and download source code archives
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Grade across standardized 100-mark rubric criteria
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1320] mr-2.5 flex-shrink-0"></span>
                  Control project publication status and student edit locks
                </li>
              </ul>
            </div>

            <div className="mt-7 pt-5 border-t border-slate-100">
              <Link
                to="/login/teacher"
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Lock className="w-3.5 h-3.5 mr-2" />
                <span>Faculty Login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-slate-400 text-[11px] font-mono">
        The University of Faisalabad &bull; Project Submission & Evaluation System
      </footer>
    </div>
  );
};

export default LoginSelectionPage;