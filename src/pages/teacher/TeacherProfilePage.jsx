import React from 'react';
import { ShieldCheck, Mail, Building, Award, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeacherProfilePage = () => {
  const { user } = useAuth();
  const teacherProfile = user?.teacher_profile;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
          Faculty Directory
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Faculty Profile</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
          Academic credentials and university departmental affiliation.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1320] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{teacherProfile?.designation}</p>
            <p className="text-xs text-slate-400 mt-0.5">{teacherProfile?.department_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-xl text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Designation</span>
            <p className="font-bold text-slate-800 mt-1">{teacherProfile?.designation}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official University Email</span>
            <p className="font-semibold text-slate-800 mt-1 font-mono">{user?.email}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Department</span>
            <p className="font-semibold text-slate-800 mt-1">{teacherProfile?.department_name} ({teacherProfile?.department_code})</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Authorization</span>
            <p className="font-semibold text-emerald-700 mt-1 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Faculty Evaluator &bull; Active</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;