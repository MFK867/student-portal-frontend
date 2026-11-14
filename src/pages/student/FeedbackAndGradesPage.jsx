import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, FileText, ArrowRight, BookOpen, Code2 } from 'lucide-react';
import { getStudentProjects } from '../../services/api';

export const FeedbackAndGradesPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluatedProjects = async () => {
      try {
        const res = await getStudentProjects();
        setProjects(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluatedProjects();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const evaluatedProjects = projects.filter(p => p.evaluation && p.evaluation.evaluation_status === 'Published');
  const pendingProjects = projects.filter(p => !p.evaluation || p.evaluation.evaluation_status !== 'Published');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
          Evaluated Portfolios
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Academic Feedback & Evaluation Marks</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
          Review official faculty evaluations, rubric score breakdowns, and letter grades for your submitted semester and capstone projects.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl">
          Loading evaluation records...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Evaluated Projects */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Published Evaluations ({evaluatedProjects.length})</span>
            </h2>

            {evaluatedProjects.length === 0 ? (
              <div className="p-8 bg-white rounded-xl text-center space-y-1">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No published evaluations yet</p>
                <p className="text-[11px] text-slate-400">Faculty members are reviewing your submitted projects.</p>
              </div>
            ) : (
              evaluatedProjects.map((p) => {
                const e = p.evaluation;
                const imgUrl = getImageUrl(p.title_image_url);

                return (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-14 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 relative hidden sm:block">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.project_title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0F172A] text-slate-500">
                              <Code2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                            {p.submission_code}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{p.project_title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.project_type} &bull; {p.category_name} &bull; Evaluated by {e.teacher_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 bg-slate-100 p-3.5 rounded-xl self-start sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">
                            Total Marks
                          </span>
                          <span className="text-lg font-bold font-mono text-slate-900">
                            {e.total_marks} / 100
                          </span>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-[#0B1320] text-white flex items-center justify-center font-bold text-base shadow-sm font-mono">
                          {e.overall_grade}
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    {e.overall_feedback && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Written Faculty Feedback
                        </span>
                        <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                          {e.overall_feedback}
                        </p>
                      </div>
                    )}

                    {/* Criteria Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-4 rounded-l-lg">Evaluation Criteria</th>
                            <th className="py-2.5 px-4 text-center">Max Marks</th>
                            <th className="py-2.5 px-4 text-center">Obtained Marks</th>
                            <th className="py-2.5 px-4 rounded-r-lg">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {e.scores?.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-slate-800">{s.criteria_name}</td>
                              <td className="py-2.5 px-4 text-center font-mono text-slate-500">{s.maximum_marks}</td>
                              <td className="py-2.5 px-4 text-center font-bold font-mono text-slate-900">
                                {s.obtained_marks}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600 italic">
                                {s.comments || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pending Submissions */}
          {pendingProjects.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Faculty Evaluation ({pendingProjects.length})</span>
              </h2>

              <div className="bg-white rounded-2xl shadow-sm p-5 divide-y divide-slate-100 text-xs">
                {pendingProjects.map((p) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{p.submission_code}</span>
                      <h4 className="font-semibold text-slate-800 mt-0.5">{p.project_title}</h4>
                      <p className="text-[11px] text-slate-400">{p.project_type} &bull; Status: {p.review?.review_status || 'Submitted'}</p>
                    </div>

                    <Link
                      to={`/student/projects/${p.id}`}
                      className="text-xs font-semibold text-[#0B1320] hover:underline flex items-center space-x-1"
                    >
                      <span>Track Progress</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackAndGradesPage;