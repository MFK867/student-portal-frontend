import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Download,
  FileText,
  Users,
  Github,
  Video,
  ExternalLink,
  Layers,
  Calendar,
  User,
  GraduationCap,
  Hash,
  Mail,
  Code2,
  CheckCircle2
} from 'lucide-react';
import { getShowcaseProjectDetail, downloadProjectFile } from '../../services/api';

export const ShowcaseDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getShowcaseProjectDetail(id);
        setProject(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Showcase project not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDownload = async (fileId, filename) => {
    try {
      await downloadProjectFile(fileId, filename);
    } catch (err) {
      alert('Failed to download project file. Please verify permissions.');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading showcase project record...</div>;
  }

  if (error || !project) {
    return (
      <div className="p-12 bg-white rounded-2xl text-center space-y-4">
        <Compass className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-700">{error || 'Project record not found'}</p>
        <Link
          to="/showcase"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0B1320] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Project Directory</span>
        </Link>
      </div>
    );
  }

  const imgUrl = getImageUrl(project.title_image_url);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div>
        <Link
          to="/showcase"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project Directory</span>
        </Link>
      </div>

      {/* Main Showcase Hero Card with Title Image and Author Metadata */}
      <div className="bg-[#0B1320] text-white rounded-2xl overflow-hidden shadow-sm">
        {/* Title Image Preview Banner */}
        {imgUrl && (
          <div className="w-full h-56 sm:h-72 md:h-80 bg-slate-900 relative overflow-hidden">
            <img
              src={imgUrl}
              alt={project.project_title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320] via-transparent to-transparent opacity-90"></div>
          </div>
        )}

        {/* Content Header Block */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-slate-300 bg-[#1E293B] px-2.5 py-1 rounded">
                {project.submission_code}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-semibold">
                {project.category_name}
              </span>
            </div>

            <div className="text-slate-400 text-[11px] font-mono">
              Academic Session: {project.academic_session} &bull; {project.project_type}
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {project.project_title}
            </h1>
          </div>

          {/* Student Lead Author & Roll Number (Prominent Block) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-lg text-slate-200">
              <User className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-none">
                  Project Lead
                </span>
                <span className="font-bold text-white leading-tight">{project.student_name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-lg text-slate-200 font-mono">
              <Hash className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-semibold leading-none">
                  Roll Number
                </span>
                <span className="font-bold text-white leading-tight">{project.student_roll_number}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-[#1E293B] px-3.5 py-1.5 rounded-lg text-slate-200">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-none">
                  Department
                </span>
                <span className="font-bold text-slate-200 leading-tight">{project.department_name}</span>
              </div>
            </div>
          </div>

          {/* External Links */}
          {(project.github_url || project.demo_video_url) && (
            <div className="pt-2 flex flex-wrap gap-2.5">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
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
                  <span>Demonstration Video</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Specification Grid */}
      <div className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            Specification Abstract
          </span>
          <h2 className="text-sm font-bold text-slate-900">Executive Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
            {project.short_description}
          </p>
        </div>

        {/* Problem Statement & Proposed Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Academic Context
            </span>
            <h3 className="text-sm font-bold text-slate-900">Problem Statement</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
              {project.problem_statement}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Applied Methodology
            </span>
            <h3 className="text-sm font-bold text-slate-900">Proposed Solution & Innovation</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
              {project.proposed_solution}
            </p>
          </div>
        </div>

        {/* Objectives & Detailed Architecture */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Deliverables
            </span>
            <h3 className="text-sm font-bold text-slate-900">Project Objectives</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
              {project.objectives}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              System Specification
            </span>
            <h3 className="text-sm font-bold text-slate-900">Detailed Architecture & Technical Implementation</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl font-mono text-[11px]">
              {project.detailed_description}
            </p>
          </div>
        </div>

        {/* Technologies & Frameworks */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            Software Stack
          </span>
          <h3 className="text-sm font-bold text-slate-900">Technologies & Frameworks Utilized</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies?.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg"
              >
                {t.name}
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({t.category})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Student Project Team Roster */}
        {project.members && project.members.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Collaborative Roster
                </span>
                <h3 className="text-sm font-bold text-slate-900">Student Project Team</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded">
                {project.members.length + 1} Total Contributors
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 rounded-l-lg">Student Member</th>
                    <th className="py-2.5 px-4">Roll Number / Student ID</th>
                    <th className="py-2.5 px-4">Official Email</th>
                    <th className="py-2.5 px-4 rounded-r-lg">Assigned Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Lead Author */}
                  <tr className="bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>{project.student_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Lead
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{project.student_roll_number}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">-</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">Project Architect & Lead</td>
                  </tr>

                  {/* Team Members */}
                  {project.members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{m.student_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{m.student_id_number}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{m.student_email}</td>
                      <td className="py-3 px-4 text-slate-600">{m.member_role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submitted Documents & Code Archives */}
        {project.files && project.files.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Digital Artifacts
            </span>
            <h3 className="text-sm font-bold text-slate-900">Project Materials & Archives</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.files.map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-slate-50 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-slate-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {f.original_filename}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {f.file_type.toUpperCase()} &bull; {(f.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(f.id, f.original_filename)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0B1320] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowcaseDetailPage;