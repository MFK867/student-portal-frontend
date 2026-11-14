import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Download,
  Calendar,
  Layers,
  GraduationCap,
  Code2
} from 'lucide-react';
import {
  getTeacherSubmissions,
  getDepartments,
  getCategories
} from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const AllSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [titleStatus, setTitleStatus] = useState('');
  const [projectType, setProjectType] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (departmentId) params.department_id = departmentId;
      if (categoryId) params.category_id = categoryId;
      if (reviewStatus) params.review_status = reviewStatus;
      if (titleStatus) params.title_status = titleStatus;
      if (projectType) params.project_type = projectType;

      const res = await getTeacherSubmissions(params);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [dRes, cRes] = await Promise.all([getDepartments(), getCategories()]);
        setDepartments(dRes.data || []);
        setCategories(cRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [departmentId, categoryId, reviewStatus, titleStatus, projectType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSubmissions();
  };

  const handleClearFilters = () => {
    setQuery('');
    setDepartmentId('');
    setCategoryId('');
    setReviewStatus('');
    setTitleStatus('');
    setProjectType('');
    setTimeout(loadSubmissions, 50);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Faculty Master Index
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">All Student Submissions</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Search, filter, review SRS documents, source code archives, and manage evaluation scores across all academic sessions.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-[#1E293B] text-slate-200 rounded-lg self-start sm:self-auto font-mono">
          {submissions.length} Records Found
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project title, submission code, student name, or roll number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-800 text-xs border-0"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-800 text-xs border-0"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-800 text-xs border-0"
          >
            <option value="">All Project Types</option>
            <option value="Semester Project">Semester Project</option>
            <option value="Final Year Project">Final Year Project</option>
            <option value="Research Project">Research Project</option>
          </select>

          <select
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-800 text-xs border-0"
          >
            <option value="">All Review Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Approved">Approved</option>
            <option value="Evaluation Completed">Evaluation Completed</option>
          </select>

          <select
            value={titleStatus}
            onChange={(e) => setTitleStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-800 text-xs border-0"
          >
            <option value="">All Title Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No submissions found</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Project & Cover</th>
                  <th className="py-3 px-6">Student & Roll No</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Title Decision</th>
                  <th className="py-3 px-6">Review Status</th>
                  <th className="py-3 px-6">Grade</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {submissions.map((s) => {
                  const imgUrl = getImageUrl(s.title_image_url);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 max-w-xs">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-10 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 relative">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={s.project_title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#0F172A] text-slate-500">
                                <Code2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/teacher/submissions/${s.id}`}
                              className="font-bold text-slate-900 hover:text-[#0A2540] line-clamp-1 transition-colors"
                            >
                              {s.project_title}
                            </Link>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {s.submission_code} &bull; {s.project_type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{s.student_owner_name}</div>
                        <div className="text-[11px] font-mono text-slate-500 font-semibold">{s.student_id_number}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-700">{s.department_name}</span>
                        <div className="text-[10px] text-slate-400">Sem {s.semester} &bull; Sec {s.section}</div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={s.review?.title_status || 'Pending Approval'} type="title" />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={s.review?.review_status || 'Submitted'} type="review" />
                      </td>
                      <td className="py-4 px-6">
                        {s.evaluation ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                            {s.evaluation.overall_grade} ({s.evaluation.total_marks})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not graded</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/teacher/submissions/${s.id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0B1320] hover:bg-[#1E293B] text-white rounded-lg shadow-sm transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review &amp; Grade</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSubmissionsPage;