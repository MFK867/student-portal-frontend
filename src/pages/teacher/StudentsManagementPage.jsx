import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, Mail, FolderKanban } from 'lucide-react';
import { getRegisteredStudents } from '../../services/api';

export const StudentsManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getRegisteredStudents({ query: search.trim() || undefined });
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Institutional Roster
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Registered Students Directory</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Faculty view of all enrolled university students verified and registered in the Project Portal.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] text-slate-200 rounded-lg self-start sm:self-auto font-mono">
          {students.length} Students Registered
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or university email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No students found</p>
            <p className="text-xs text-slate-400">Try searching with a different roll number or student name.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Roll Number (Student ID)</th>
                  <th className="py-3 px-6">University Email</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Degree & Semester</th>
                  <th className="py-3 px-6 text-center">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700 font-bold">
                      {s.student_id}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {s.email}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {s.department_name}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{s.degree_program}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Semester {s.semester} &bull; Section {s.section}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-800">
                        {s.submissions_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsManagementPage;