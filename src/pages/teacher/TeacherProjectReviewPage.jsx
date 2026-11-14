import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Users,
  MessageSquare,
  History,
  ExternalLink,
  ArrowLeft,
  Save,
  Send,
  Github,
  Video,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  getTeacherSubmissionDetail,
  getEvaluationCriteria,
  decideProjectTitle,
  updateProjectReviewStatus,
  evaluateProject,
  downloadProjectFile
} from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const TeacherProjectReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evaluation'); // Start on evaluation for teachers
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Title decision modal/state
  const [titleDecision, setTitleDecision] = useState('Approved');
  const [titleReason, setTitleReason] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // Review status state
  const [reviewStatus, setReviewStatus] = useState('Under Review');
  const [reviewComments, setReviewComments] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Evaluation rubric marks state: { criteria_id: marks, ... }
  const [scores, setScores] = useState({});
  const [scoreComments, setScoreComments] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  const fetchDetails = async () => {
    try {
      const [subRes, critRes] = await Promise.all([
        getTeacherSubmissionDetail(id),
        getEvaluationCriteria()
      ]);
      const sub = subRes.data;
      setSubmission(sub);
      setCriteria(critRes.data || []);

      if (sub.review) {
        setReviewStatus(sub.review.review_status || 'Under Review');
        setReviewComments(sub.review.teacher_comments || '');
      }

      // Initialize scores if evaluation already exists
      if (sub.evaluation) {
        setOverallFeedback(sub.evaluation.overall_feedback || '');
        const scoreObj = {};
        const commentsObj = {};
        sub.evaluation.scores?.forEach((s) => {
          scoreObj[s.criteria_id] = s.obtained_marks;
          commentsObj[s.criteria_id] = s.comments || '';
        });
        setScores(scoreObj);
        setScoreComments(commentsObj);
      } else {
        // Initialize default scores
        const scoreObj = {};
        critRes.data?.forEach(c => {
          scoreObj[c.id] = 0;
        });
        setScores(scoreObj);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load project submission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDownload = async (fileId, filename) => {
    try {
      await downloadProjectFile(fileId, filename);
    } catch (err) {
      alert("Failed to download file.");
    }
  };

  // Calculate total marks and letter grade in real-time
  const totalObtainedMarks = Object.values(scores).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  const totalMaxMarks = criteria.reduce((acc, curr) => acc + curr.maximum_marks, 0) || 100;
  const percentage = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : 0;

  const calculateGrade = (pct) => {
    if (pct >= 85) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 75) return 'B+';
    if (pct >= 70) return 'B';
    if (pct >= 65) return 'C+';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const calculatedGrade = calculateGrade(percentage);

  // Handle Title Decision
  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    if (!titleReason.trim()) {
      setError('Please provide feedback/comments explaining the title decision.');
      return;
    }
    setSavingTitle(true);
    setError('');
    setSuccess('');

    try {
      await decideProjectTitle(id, { decision: titleDecision, reason: titleReason });
      setSuccess(`Project title decision (${titleDecision}) recorded and student notified.`);
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit title decision.');
    } finally {
      setSavingTitle(false);
    }
  };

  // Handle Review Status Transition
  const handleReviewStatusSubmit = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    setError('');
    setSuccess('');

    try {
      await updateProjectReviewStatus(id, { review_status: reviewStatus, comments: reviewComments });
      setSuccess(`Project workflow status updated to '${reviewStatus}'.`);
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update review status.');
    } finally {
      setSavingStatus(false);
    }
  };

  // Handle Rubric Evaluation (Draft vs Publish)
  const handleEvaluationSubmit = async (publish = false) => {
    setSavingEval(true);
    setError('');
    setSuccess('');

    // Prepare scores array
    const scoreList = criteria.map(c => ({
      criteria_id: c.id,
      obtained_marks: parseFloat(scores[c.id]) || 0,
      comments: scoreComments[c.id] || null
    }));

    try {
      await evaluateProject(id, {
        scores: scoreList,
        overall_feedback: overallFeedback,
        publish: publish
      });
      setSuccess(publish ? 'Evaluation and final grades published to student.' : 'Evaluation draft saved successfully.');
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save evaluation.');
    } finally {
      setSavingEval(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading student project submission...</div>;
  }

  if (!submission) {
    return <div className="p-8 text-center text-xs text-rose-600">Project submission not found.</div>;
  }

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const imgUrl = getImageUrl(submission?.title_image_url);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <Link
          to="/teacher/submissions"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1320]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Submissions</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {submission.submission_code}
            </span>
            <span className="text-xs text-slate-500">
              Submitted: {new Date(submission.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge status={submission.review?.title_status || 'Pending Approval'} type="title" />
            <StatusBadge status={submission.review?.review_status || 'Submitted'} type="review" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-4">
          {imgUrl && (
            <div className="w-32 h-20 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
              <img
                src={imgUrl}
                alt={submission.project_title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1320]">
              {submission.project_title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Student: <span className="font-semibold text-slate-800">{submission.student_owner_name}</span> ({submission.student_id_number}) &bull; {submission.department_name} &bull; Semester {submission.semester} &bull; {submission.project_type}
            </p>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 space-x-6 overflow-x-auto">
        {[
          { id: 'evaluation', label: 'Rubric & Grading (100 Marks)', icon: Award },
          { id: 'title', label: 'Title Approval System', icon: ShieldCheck },
          { id: 'status', label: 'Workflow & Review Status', icon: FileText },
          { id: 'documents', label: `Documents & Code (${submission.files?.length || 0})`, icon: Download },
          { id: 'overview', label: 'Project Description', icon: FileText },
          { id: 'student', label: 'Student & Team Info', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-1 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#0B1320] text-[#0B1320]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-b-xl p-6 sm:p-8 border border-t-0 border-slate-200 shadow-sm">
        {/* TAB 1: Evaluation Rubric */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Standardized Academic Marking Rubric</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluate each criterion. Marks and percentage calculate automatically.
                </p>
              </div>

              {/* Real-time score calculator badge */}
              <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center space-x-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calculated Total</span>
                    <span className="text-base sm:text-lg font-black text-[#0B1320]">{totalObtainedMarks} / {totalMaxMarks}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#0B1320] text-white flex flex-col items-center justify-center font-bold text-xs shadow-sm font-mono">
                    <span>{calculatedGrade}</span>
                    <span className="text-[8px] font-normal opacity-80">{percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Criteria Inputs */}
            <div className="space-y-4">
              {criteria.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <p className="text-[11px] text-slate-500">{c.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span className="text-xs text-slate-400 font-medium">Marks (Max {c.maximum_marks}):</span>
                      <input
                        type="number"
                        min="0"
                        max={c.maximum_marks}
                        step="0.5"
                        value={scores[c.id] ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setScores(prev => ({ ...prev, [c.id]: val }));
                        }}
                        className="w-20 px-2.5 py-1.5 text-xs text-center font-bold font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 focus:border-[#0B1320]"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Specific remarks for this criterion (optional)..."
                    value={scoreComments[c.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScoreComments(prev => ({ ...prev, [c.id]: val }));
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Comprehensive Written Faculty Feedback & Evaluation Summary
              </label>
              <textarea
                rows={4}
                placeholder="Provide detailed constructive feedback regarding implementation, code quality, and defense presentation..."
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 focus:border-[#0B1320]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => handleEvaluationSubmit(false)}
                disabled={savingEval}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft Evaluation</span>
              </button>

              <button
                type="button"
                onClick={() => handleEvaluationSubmit(true)}
                disabled={savingEval}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Publish Official Results to Student</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Title Decision System */}
        {activeTab === 'title' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Project Title Review & Approval
              </h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Project Title</span>
              <p className="text-base font-bold text-slate-900 mt-1">{submission.project_title}</p>
              <p className="text-xs text-slate-500 mt-0.5">Category: {submission.category_name} &bull; Type: {submission.project_type}</p>
            </div>

            <form onSubmit={handleTitleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Faculty Title Decision
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Approved', label: 'Approve Title', color: 'border-emerald-300 text-emerald-800' },
                    { id: 'Revision Required', label: 'Request Revision', color: 'border-sky-300 text-sky-800' },
                    { id: 'Rejected', label: 'Reject Title', color: 'border-rose-300 text-rose-800' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setTitleDecision(btn.id)}
                      className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        titleDecision === btn.id
                          ? 'bg-white shadow-sm ring-2 ring-[#0B1320] ' + btn.color
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Decision Comments & Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why the title was approved, rejected, or what specific adjustments are required from the student..."
                  value={titleReason}
                  onChange={(e) => setTitleReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 focus:border-[#0B1320]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingTitle}
                  className="px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingTitle ? 'Recording Decision...' : 'Submit Title Decision'}
                </button>
              </div>
            </form>

            {/* Historical decisions */}
            {submission.title_history?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Title Decision Audit Log
                </h3>
                <div className="space-y-2">
                  {submission.title_history.map((th) => (
                    <div key={th.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={th.decision} type="title" />
                        <span className="text-[11px] text-slate-400">
                          {new Date(th.created_at).toLocaleDateString()} &bull; Reviewer: {th.teacher_name || 'Faculty'}
                        </span>
                      </div>
                      <p className="text-slate-800 font-semibold">{th.submitted_title}</p>
                      <p className="text-slate-600 text-[11px]">{th.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Workflow & Review Status */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Manage Project Workflow Status
            </h2>

            <form onSubmit={handleReviewStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Submission Status Transition
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 focus:border-[#0B1320]"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Changes Requested">Changes Requested (Unlocks student edit access)</option>
                  <option value="Approved">Approved</option>
                  <option value="Evaluation Completed">Evaluation Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Remarks / Modification Instructions for Student
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail any necessary corrections in architecture, documentation, or code..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 focus:border-[#0B1320]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingStatus ? 'Updating Status...' : 'Update Review Status'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: Documents & Code */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Submitted Documents & Source Code Archives
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.files?.map((f) => (
                <div
                  key={f.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-[#0B1320] flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {f.original_filename}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {f.file_type.toUpperCase()} &bull; {(f.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(f.id, f.original_filename)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>

            {/* External Links */}
            {(submission.github_url || submission.demo_video_url) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Repository & Video Demonstrations</h3>
                <div className="flex flex-wrap gap-3">
                  {submission.github_url && (
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>Inspect GitHub Repository</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  )}
                  {submission.demo_video_url && (
                    <a
                      href={submission.demo_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-3.5 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>Watch Demonstration Video</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Project Description */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Short Abstract</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{submission.short_description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Problem Statement</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{submission.problem_statement}</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Proposed Solution</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{submission.proposed_solution}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Project Objectives</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{submission.objectives}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Detailed Description</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">{submission.detailed_description}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {submission.technologies?.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-200"
                  >
                    {t.name}
                    <span className="text-[10px] text-slate-400 ml-1.5">({t.category})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Student & Team Info */}
        {activeTab === 'student' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Student & Group Contributors
            </h2>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lead Submitter</span>
                <p className="font-bold text-slate-900 mt-0.5">{submission.student_owner_name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student ID</span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{submission.student_id_number}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                <p className="text-slate-600 mt-0.5">{submission.student_email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
                <p className="text-slate-800 mt-0.5">{submission.department_name}</p>
              </div>
            </div>

            {submission.members?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Additional Team Members</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Member Name</th>
                        <th className="py-2.5 px-4">Student ID</th>
                        <th className="py-2.5 px-4">Email</th>
                        <th className="py-2.5 px-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {submission.members.map((m) => (
                        <tr key={m.id}>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{m.student_name}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">{m.student_id_number}</td>
                          <td className="py-2.5 px-4 text-slate-500">{m.student_email}</td>
                          <td className="py-2.5 px-4">{m.member_role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProjectReviewPage;
