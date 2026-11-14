import React, { useState, useEffect } from 'react';
import {
  getTeacherSubmissions,
  getTeacherSubmissionDetail,
  getEvaluationCriteria,
  decideProjectTitle,
  evaluateProject,
  downloadProjectFile
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TeacherDashboard = () => {
  const { user } = useAuth();

  // Submissions list
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'GRADED'

  // Selected Submission & Criteria
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Title Decision State
  const [titleDecision, setTitleDecision] = useState('Approved');
  const [titleReason, setTitleReason] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // Grading Rubric State: { criteria_id: marks, ... }
  const [scores, setScores] = useState({});
  const [scoreComments, setScoreComments] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  // UI Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch criteria and submissions
  const loadSubmissions = async (autoSelectId = null) => {
    try {
      const [subsRes, critRes] = await Promise.all([
        getTeacherSubmissions(),
        getEvaluationCriteria()
      ]);
      const list = subsRes.data || [];
      setSubmissions(list);
      setCriteria(critRes.data || []);

      // Auto-select first or specified
      if (list.length > 0) {
        const targetId = autoSelectId || selectedId || list[0].id;
        setSelectedId(targetId);
        loadSubmissionDetail(targetId, critRes.data || []);
      } else {
        setSelectedId(null);
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error("Failed to load teacher submissions:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // 2. Fetch details for selected project
  const loadSubmissionDetail = async (id, critList = criteria) => {
    setLoadingDetail(true);
    setError('');
    setSuccess('');
    try {
      const res = await getTeacherSubmissionDetail(id);
      const sub = res.data;
      setSelectedSubmission(sub);

      // Preload title decision
      if (sub.title_decision) {
        setTitleDecision(sub.title_decision.decision || 'Approved');
        setTitleReason(sub.title_decision.reason || '');
      } else {
        setTitleDecision('Approved');
        setTitleReason('');
      }

      // Preload evaluation scores if existing
      const activeCriteria = critList.length > 0 ? critList : criteria;
      if (sub.evaluation) {
        setOverallFeedback(sub.evaluation.overall_feedback || '');
        const scoreObj = {};
        const commentObj = {};
        sub.evaluation.scores?.forEach(s => {
          scoreObj[s.criteria_id] = s.obtained_marks;
          commentObj[s.criteria_id] = s.comments || '';
        });
        setScores(scoreObj);
        setScoreComments(commentObj);
      } else {
        // Initialize zeros
        const scoreObj = {};
        activeCriteria.forEach(c => {
          scoreObj[c.id] = 0;
        });
        setScores(scoreObj);
        setScoreComments({});
        setOverallFeedback('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load submission details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectSubmission = (id) => {
    setSelectedId(id);
    loadSubmissionDetail(id);
  };

  // Calculate real-time total marks and grade
  const totalScore = criteria.reduce((sum, c) => sum + (parseFloat(scores[c.id]) || 0), 0);
  const maxScore = criteria.reduce((sum, c) => sum + (parseFloat(c.maximum_marks) || 0), 0);
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

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

  // Autofill Grading Rubric
  const handleAutofillGrading = () => {
    const sampleRemarks = {
      "Problem Identification": { ratio: 0.95, comment: "Problem definition is academically sound, rigorously motivated, and clearly targeted." },
      "SRS Documentation": { ratio: 0.93, comment: "Comprehensive IEEE compliant functional requirements, use cases, and diagrams." },
      "System Design & Architecture": { ratio: 0.93, comment: "Clean component modularity, well-normalized relational schema, and robust service contracts." },
      "Implementation": { ratio: 0.94, comment: "Production-grade execution with responsive front-end and secure RESTful endpoints." },
      "Code Quality": { ratio: 0.90, comment: "Consistent naming standards, modular helper utilities, and defensive error handling." },
      "Functionality": { ratio: 0.93, comment: "All core user flows operate as specified without runtime exceptions." },
      "Innovation & Creativity": { ratio: 0.90, comment: "Novel practical application addressing real-world operational challenges." },
      "Presentation / Demonstration": { ratio: 0.90, comment: "Articulate technical explanation and confident demonstration of live workflows." },
    };

    const newScores = {};
    const newComments = {};

    criteria.forEach((c) => {
      const info = sampleRemarks[c.name] || { ratio: 0.92, comment: "Meets academic specifications." };
      const marks = Math.min(c.maximum_marks, Math.round(c.maximum_marks * info.ratio * 2) / 2);
      newScores[c.id] = marks;
      newComments[c.id] = info.comment;
    });

    setScores(newScores);
    setScoreComments(newComments);
    setOverallFeedback(
      "Outstanding engineering capstone. The software architecture satisfies academic degree standards with commendable rigor, high code quality, and dependable operational reliability. Approved for publication."
    );
    setError('');
    setSuccess('Sample rubric grades, criteria comments, and evaluator feedback autofilled.');
  };

  // Save Title Decision
  const handleSaveTitleDecision = async () => {
    if (!selectedId) return;
    setSavingTitle(true);
    setError('');
    setSuccess('');
    try {
      await decideProjectTitle(selectedId, {
        decision: titleDecision,
        reason: titleReason.trim() || 'Title approved based on academic scope.'
      });
      setSuccess(`Title marked as '${titleDecision}'. Student notified.`);
      loadSubmissions(selectedId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save title decision.');
    } finally {
      setSavingTitle(false);
    }
  };

  // Save / Publish Evaluation
  const handleSaveEvaluation = async (publish = false) => {
    if (!selectedId) return;

    if (!overallFeedback.trim()) {
      setError('Please provide written evaluator feedback before saving evaluation.');
      return;
    }

    setSavingEval(true);
    setError('');
    setSuccess('');

    const scoreList = criteria.map(c => ({
      criteria_id: c.id,
      obtained_marks: parseFloat(scores[c.id]) || 0,
      comments: scoreComments[c.id] || null
    }));

    try {
      await evaluateProject(selectedId, {
        scores: scoreList,
        overall_feedback: overallFeedback.trim(),
        publish: publish
      });
      setSuccess(publish ? 'Final marks and evaluation published to student.' : 'Evaluation draft saved.');
      loadSubmissions(selectedId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save evaluation.');
    } finally {
      setSavingEval(false);
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      sub.project_title.toLowerCase().includes(q) ||
      sub.student_owner?.name?.toLowerCase().includes(q) ||
      sub.student_profile?.student_id?.toLowerCase().includes(q) ||
      sub.submission_code.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'PENDING') return !sub.evaluation;
    if (statusFilter === 'GRADED') return !!sub.evaluation;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Faculty Evaluation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluator: <span className="font-semibold text-slate-800">{user?.name}</span> &bull; Role: {user?.role === 'admin' ? 'Administrator' : 'Faculty Evaluator'}
          </p>
        </div>

        <div className="flex gap-2 text-xs font-medium">
          <span className="border border-slate-200 px-3 py-1 rounded-md bg-slate-50 text-slate-700">
            Total: {submissions.length}
          </span>
          <span className="border border-amber-200 px-3 py-1 rounded-md bg-amber-50 text-amber-700">
            Pending: {submissions.filter(s => !s.evaluation).length}
          </span>
          <span className="border border-blue-200 px-3 py-1 rounded-md bg-blue-50 text-blue-700">
            Graded: {submissions.filter(s => !!s.evaluation).length}
          </span>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium">
          {success}
        </div>
      )}

      {/* Master-Detail Layout (Single Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Submissions List (5 of 12 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Submissions Directory ({filteredSubmissions.length})
            </h2>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, roll no, or title..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 py-1 rounded-md font-medium text-center transition-all ${
                  statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`flex-1 py-1 rounded-md font-medium text-center transition-all ${
                  statusFilter === 'PENDING' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('GRADED')}
                className={`flex-1 py-1 rounded-md font-medium text-center transition-all ${
                  statusFilter === 'GRADED' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Graded
              </button>
            </div>
          </div>

          {/* Submissions Cards */}
          {loadingList ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              No project submissions found.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredSubmissions.map((sub) => {
                const isSelected = sub.id === selectedId;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[11px] font-mono font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {sub.submission_code}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'border-slate-700 bg-slate-800 text-slate-200'
                          : sub.evaluation
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}>
                        {sub.evaluation ? `Graded: ${sub.evaluation.total_marks}/100` : 'Pending Grade'}
                      </span>
                    </div>

                    <h3 className={`text-xs font-bold mt-1.5 line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {sub.project_title}
                    </h3>

                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className={isSelected ? 'text-slate-200 font-medium' : 'text-slate-700 font-medium'}>
                        {sub.student_owner?.name}
                      </span>
                      <span className={`font-mono text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {sub.student_profile?.student_id || 'Roll No'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Selected Submission Dossier & Grading Form (7 of 12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedSubmission ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-500 shadow-sm">
              Select a project submission from the left panel to review and grade.
            </div>
          ) : loadingDetail ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm text-slate-500 shadow-sm">
              Loading submission details...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Submission Overview Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      {selectedSubmission.submission_code} &bull; {selectedSubmission.academic_session}
                    </span>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 mt-0.5">
                      {selectedSubmission.project_title}
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Title: {selectedSubmission.title_decision?.decision || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Student Lead & Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider block">Student Lead</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{selectedSubmission.student_owner?.name}</span>
                    <span className="text-slate-600 font-mono text-xs">{selectedSubmission.student_profile?.student_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-semibold tracking-wider block">Department &amp; Category</span>
                    <span className="text-slate-900 font-medium text-xs mt-0.5 block">{selectedSubmission.department?.name || 'Computing'}</span>
                    <span className="text-slate-600 text-xs">{selectedSubmission.category?.name}</span>
                  </div>
                </div>

                {/* Team Members */}
                {selectedSubmission.team_members && selectedSubmission.team_members.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1.5">Team Members</h4>
                    <div className="text-xs space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {selectedSubmission.team_members.map((m, idx) => (
                        <div key={idx} className="flex justify-between py-0.5">
                          <span className="text-slate-800 font-medium">{m.student_name} <span className="font-mono text-slate-500">({m.student_id_number})</span></span>
                          <span className="text-slate-500 font-medium">{m.member_role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary & Objectives */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Abstract</h4>
                    <p className="text-sm text-slate-800 leading-relaxed">{selectedSubmission.short_description}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Objectives</h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono bg-slate-50 border border-slate-200 rounded-lg p-3">
                      {selectedSubmission.objectives}
                    </p>
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1.5">Technologies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubmission.technologies?.map((t, idx) => (
                      <span key={idx} className="border border-slate-200 px-2.5 py-0.5 text-xs font-medium bg-slate-50 text-slate-700 rounded-md">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submitted Files Download Buttons */}
                <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2.5">
                  {selectedSubmission.srs_document_file ? (
                    <button
                      type="button"
                      onClick={() => downloadProjectFile(selectedSubmission.srs_document_file.id, `${selectedSubmission.submission_code}_SRS.pdf`)}
                      className="border border-slate-300 hover:border-slate-400 px-3.5 py-2 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                    >
                      Download SRS Document
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 border border-dashed border-slate-200 px-3 py-2 rounded-md">No SRS Document</span>
                  )}

                  {selectedSubmission.code_archive_file ? (
                    <button
                      type="button"
                      onClick={() => downloadProjectFile(selectedSubmission.code_archive_file.id, `${selectedSubmission.submission_code}_Code.zip`)}
                      className="border border-slate-300 hover:border-slate-400 px-3.5 py-2 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                    >
                      Download Code Archive (.zip)
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 border border-dashed border-slate-200 px-3 py-2 rounded-md">No Code ZIP</span>
                  )}
                </div>
              </div>

              {/* Title Decision Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3.5">
                <div className="border-b border-slate-100 pb-2.5">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Project Title Decision
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Approved', 'Revision Required', 'Rejected'].map((dec) => (
                    <button
                      key={dec}
                      type="button"
                      onClick={() => setTitleDecision(dec)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                        titleDecision === dec
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {dec}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={titleReason}
                  onChange={(e) => setTitleReason(e.target.value)}
                  placeholder="Decision remarks / required revisions for title..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                />

                <button
                  type="button"
                  onClick={handleSaveTitleDecision}
                  disabled={savingTitle}
                  className="border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-xs font-medium rounded-md shadow-sm transition-colors"
                >
                  {savingTitle ? 'Saving...' : 'Save Title Decision'}
                </button>
              </div>

              {/* 100-Mark Rubric Evaluation Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3.5 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      100-Mark Rubric Evaluation
                    </h3>
                    <span className="text-xs font-medium text-slate-600 mt-0.5 block">
                      Score: <span className="font-bold text-slate-900">{totalScore}</span> / {maxScore} &bull; Grade: <span className="font-bold text-slate-900">{calculateGrade(percentage)}</span> ({percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutofillGrading}
                    className="border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-2xs transition-colors"
                  >
                    Autofill Grading
                  </button>
                </div>

                {/* Criteria Rows */}
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                  {criteria.map((c) => (
                    <div key={c.id} className="p-3 bg-white grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs">
                      <div className="sm:col-span-5">
                        <span className="font-semibold text-slate-900 block">{c.name}</span>
                        <span className="text-[11px] text-slate-500">Max: {c.maximum_marks} marks</span>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={c.maximum_marks}
                          value={scores[c.id] ?? 0}
                          onChange={(e) => setScores({ ...scores, [c.id]: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={scoreComments[c.id] || ''}
                          onChange={(e) => setScoreComments({ ...scoreComments, [c.id]: e.target.value })}
                          placeholder="Criteria comments"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Feedback */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Written Evaluator Remarks &amp; Feedback *
                  </label>
                  <textarea
                    rows={3}
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    placeholder="Enter comprehensive constructive remarks on project implementation, technical depth, and presentation."
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEvaluation(false)}
                    disabled={savingEval}
                    className="flex-1 py-2.5 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEvaluation(true)}
                    disabled={savingEval}
                    className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    {savingEval ? 'Submitting...' : 'Submit & Publish Final Grade'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
