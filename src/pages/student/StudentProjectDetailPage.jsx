import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Download,
  Edit3,
  Calendar,
  Layers,
  Users,
  Award,
  MessageSquare,
  History,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Github,
  Video,
  UploadCloud,
  FileCode,
  AlertCircle
} from 'lucide-react';
import {
  getStudentProjectDetail,
  downloadProjectFile,
  uploadSrsDocument,
  uploadSourceCode
} from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const StudentProjectDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [fileSuccess, setFileSuccess] = useState('');
  const [uploadingSrs, setUploadingSrs] = useState(false);
  const [uploadingCode, setUploadingCode] = useState(false);

  // Check URL query warning
  const searchParams = new URLSearchParams(location.search);
  const warningParam = searchParams.get('warning');

  const fetchDetail = async () => {
    try {
      const res = await getStudentProjectDetail(id);
      setProject(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleDownload = async (fileId, filename) => {
    try {
      await downloadProjectFile(fileId, filename);
    } catch (err) {
      alert("Failed to download file.");
    }
  };

  const handleSrsUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      alert('Only PDF (.pdf) and Word (.docx) files are allowed for SRS documents.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('SRS file exceeds maximum 100 MB limit.');
      return;
    }

    setUploadingSrs(true);
    setFileSuccess('');
    try {
      await uploadSrsDocument(id, file);
      setFileSuccess('SRS document uploaded successfully.');
      await fetchDetail();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to upload SRS document.');
    } finally {
      setUploadingSrs(false);
    }
  };

  const handleCodeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.zip') {
      alert('Source code must be in .zip format.');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert('Source code ZIP exceeds maximum 500 MB limit.');
      return;
    }

    setUploadingCode(true);
    setFileSuccess('');
    try {
      await uploadSourceCode(id, file);
      setFileSuccess('Source code archive uploaded successfully.');
      await fetchDetail();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to upload source code archive.');
    } finally {
      setUploadingCode(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading project details...</div>;
  }

  if (error || !project) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-800">{error || 'Project not found.'}</p>
        <Link
          to="/student/projects"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0B1320] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Projects</span>
        </Link>
      </div>
    );
  }

  const review = project.review;
  const evaluation = project.evaluation;
  const canEdit = !project.is_locked && (
    review?.review_status === 'Changes Requested' ||
    review?.review_status === 'Submitted' ||
    review?.title_status === 'Revision Required'
  );

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const imgUrl = getImageUrl(project?.title_image_url);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back button */}
      <div>
        <Link
          to="/student/projects"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B1320]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Projects</span>
        </Link>
      </div>

      {/* File Upload Warning from Submission */}
      {warningParam && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Project Registered &bull; Action Needed for Uploads</p>
            <p className="mt-0.5">Your project details were saved successfully. However, file upload encountered an issue: <span className="font-mono font-semibold">{warningParam}</span>.</p>
            <p className="mt-1 font-semibold text-amber-800">You can upload or replace your SRS Document or Source Code Archive anytime in the "Attached Documents &amp; Codebase" tab below.</p>
          </div>
        </div>
      )}

      {fileSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center space-x-2.5 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{fileSuccess}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {project.submission_code}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Submitted on {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <StatusBadge status={review?.title_status || 'Pending Approval'} type="title" />
            <StatusBadge status={review?.review_status || 'Submitted'} type="review" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {imgUrl && (
              <div className="w-28 h-20 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
                <img
                  src={imgUrl}
                  alt={project.project_title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1320]">
                {project.project_title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Category: <span className="font-semibold text-slate-700">{project.category_name}</span> &bull; {project.project_type} &bull; Session {project.academic_session}
              </p>
            </div>
          </div>

          {canEdit && (
            <Link
              to={`/student/projects/${project.id}/edit`}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Project / Resubmit</span>
            </Link>
          )}
        </div>

        {/* Action / Status Alerts */}
        {review?.review_status === 'Changes Requested' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Faculty Requested Modifications:</p>
              <p className="mt-0.5">{review.teacher_comments || 'Please revise your project submission based on faculty guidance.'}</p>
            </div>
          </div>
        )}

        {review?.title_status === 'Revision Required' && (
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Title Modification Requested:</p>
              <p className="mt-0.5">{review.teacher_comments || 'Please revise your project title according to faculty feedback.'}</p>
            </div>
          </div>
        )}

        {evaluation && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Official Evaluation Results Published!</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm text-emerald-900">
                Grade: {evaluation.overall_grade} ({evaluation.total_marks}/100)
              </span>
              <button
                onClick={() => setActiveTab('evaluation')}
                className="underline font-semibold text-emerald-700 hover:text-emerald-900"
              >
                View Marksheet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 space-x-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Details', icon: FileText },
          { id: 'team', label: `Team Members (${project.members?.length || 1})`, icon: Users },
          { id: 'files', label: `Files & Links (${project.files?.length || 0})`, icon: Download },
          { id: 'feedback', label: 'Faculty Feedback', icon: MessageSquare },
          { id: 'evaluation', label: 'Evaluation & Rubric', icon: Award },
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
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                Short Summary (Abstract)
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {project.short_description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Problem Statement
                </h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                  {project.problem_statement}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Proposed Solution
                </h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                  {project.proposed_solution}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                Project Objectives
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {project.objectives}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                Detailed Architecture & Implementation Notes
              </h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {project.detailed_description}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((t) => (
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

        {/* Tab 2: Team */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Project Contributors</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">University Email</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="bg-blue-50/30">
                    <td className="py-3 px-4 font-bold text-slate-900">{project.student_owner_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{project.student_id_number}</td>
                    <td className="py-3 px-4 text-slate-500">Student Owner</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0B1320] font-semibold text-[10px]">
                        Owner / Submitter
                      </span>
                    </td>
                  </tr>
                  {project.members?.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3 px-4 font-semibold text-slate-800">{m.student_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{m.student_id_number}</td>
                      <td className="py-3 px-4 text-slate-500">{m.student_email}</td>
                      <td className="py-3 px-4">{m.member_role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Files & Links */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-sm">Attached Documents & Codebase</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.files?.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
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
            {(project.github_url || project.demo_video_url) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">External Repositories & Demos</h4>
                <div className="flex flex-wrap gap-3">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>View GitHub Repository</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  )}
                  {project.demo_video_url && (
                    <a
                      href={project.demo_video_url}
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

            {/* Direct File Upload & Replacement Section */}
            {!project.is_locked && (
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Upload or Replace Project Materials
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Active Submission &bull; Editable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload SRS */}
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>SRS Document (.pdf, .docx)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                        Max 100MB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload or update your official Software Requirements Specification document.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      disabled={uploadingSrs}
                      onChange={handleSrsUpload}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0B1320] file:text-white hover:file:bg-[#1E293B] cursor-pointer disabled:opacity-50"
                    />
                    {uploadingSrs && <p className="text-[11px] text-slate-500 animate-pulse font-medium">Uploading SRS document...</p>}
                  </div>

                  {/* Upload Code ZIP */}
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                        <FileCode className="w-4 h-4 text-slate-600" />
                        <span>Source Code Archive (.zip)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                        Max 500MB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload or update your complete project codebase ZIP archive.
                    </p>
                    <input
                      type="file"
                      accept=".zip"
                      disabled={uploadingCode}
                      onChange={handleCodeUpload}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0B1320] file:text-white hover:file:bg-[#1E293B] cursor-pointer disabled:opacity-50"
                    />
                    {uploadingCode && <p className="text-[11px] text-slate-500 animate-pulse font-medium">Uploading source code archive...</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Faculty Feedback */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-sm">Faculty Review & Comments</h3>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Reviewing Teacher: {review?.teacher_name || 'Academic Faculty Reviewer'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {review?.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString() : 'Awaiting Review'}
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {review?.teacher_comments || 'No faculty comments recorded yet.'}
              </p>
            </div>

            {/* Title Revision History */}
            {project.title_history?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title Review Decision History</h4>
                <div className="space-y-2">
                  {project.title_history.map((th) => (
                    <div key={th.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={th.decision} type="title" />
                        <span className="text-[11px] text-slate-400">{new Date(th.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-800 font-semibold">{th.submitted_title}</p>
                      <p className="text-slate-500 text-[11px]">{th.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Evaluation & Rubric */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {evaluation ? (
              <div className="space-y-6">
                {/* Score Summary Card */}
                <div className="p-6 bg-[#0B1320] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                      Final Evaluated Result
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
                      {evaluation.total_marks} / 100 Marks
                    </h3>
                    <p className="text-xs text-blue-100 mt-1">
                      Evaluated by {evaluation.teacher_name} &bull; Published on {new Date(evaluation.published_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
                    <span className="text-xs uppercase font-medium text-blue-200">Grade</span>
                    <span className="text-2xl font-black">{evaluation.overall_grade}</span>
                  </div>
                </div>

                {/* Overall Feedback */}
                {evaluation.overall_feedback && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Faculty Evaluator Feedback
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                      {evaluation.overall_feedback}
                    </p>
                  </div>
                )}

                {/* Rubric Breakdown Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Official 100-Mark Rubric Scoring Breakdown
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Evaluation Criteria</th>
                          <th className="py-2.5 px-4 text-center">Max Marks</th>
                          <th className="py-2.5 px-4 text-center">Obtained Marks</th>
                          <th className="py-2.5 px-4">Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {evaluation.scores?.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-semibold text-slate-900">{s.criteria_name}</td>
                            <td className="py-3 px-4 text-center font-mono text-slate-500">{s.maximum_marks}</td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                              {s.obtained_marks}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">{s.comments || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Evaluation In Progress</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your project is currently under review by faculty evaluators. Official grades and rubric scores will appear here once finalized and published.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProjectDetailPage;
