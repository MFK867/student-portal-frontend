import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, AlertCircle, CheckCircle, FileText, ArrowRight, Code2 } from 'lucide-react';
import { getTeacherSubmissions } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const PendingReviewsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('titles'); // 'titles' or 'evaluations'

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const res = await getTeacherSubmissions();
        setSubmissions(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const pendingTitles = submissions.filter(
    s => s.review?.title_status === 'Pending Approval' || s.review?.title_status === 'Revision Required'
  );

  const pendingEvaluations = submissions.filter(
    s => !s.evaluation || s.evaluation.evaluation_status !== 'Published'
  );

  const displayedList = filterType === 'titles' ? pendingTitles : pendingEvaluations;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Action Items
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Faculty Review Queue</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Prioritize project submissions awaiting title approval decisions or comprehensive rubric evaluation.
          </p>
        </div>

        {/* Micro-Underlined Filter Tabs */}
        <div className="flex items-center space-x-6 border-b border-slate-700 pb-1">
          <button
            onClick={() => setFilterType('titles')}
            className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              filterType === 'titles'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Title Approvals ({pendingTitles.length})
          </button>
          <button
            onClick={() => setFilterType('evaluations')}
            className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              filterType === 'evaluations'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Grading ({pendingEvaluations.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading pending queue...</div>
        ) : displayedList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">All submissions cleared</p>
            <p className="text-xs text-slate-400">
              There are no pending {filterType === 'titles' ? 'title approvals' : 'grading evaluations'} in your queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Project & Cover</th>
                  <th className="py-3 px-6">Student & Roll No</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Title Status</th>
                  <th className="py-3 px-6">Review Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {displayedList.map((s) => {
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
                            <div className="font-bold text-slate-900 line-clamp-1">{s.project_title}</div>
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
                      <td className="py-4 px-6 text-slate-600">
                        {s.department_name}
                        <div className="text-[10px] text-slate-400">Sem {s.semester} &bull; Sec {s.section}</div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={s.review?.title_status || 'Pending Approval'} type="title" />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={s.review?.review_status || 'Submitted'} type="review" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/teacher/submissions/${s.id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0B1320] hover:bg-[#1E293B] text-white rounded-lg shadow-sm transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
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

export default PendingReviewsPage;