import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  PlusCircle,
  FileText,
  Download,
  Edit3,
  Eye,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Code2,
  Hash
} from 'lucide-react';
import { getStudentProjects, downloadProjectFile } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getStudentProjects();
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch student projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDownload = async (fileId, filename) => {
    try {
      await downloadProjectFile(fileId, filename);
    } catch (err) {
      alert("Failed to download file. Please check your network connection or permissions.");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.project_title.toLowerCase().includes(search.toLowerCase()) ||
      p.submission_code.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'APPROVED') {
      return p.review?.review_status === 'Approved' || p.review?.title_status === 'Approved';
    }
    if (statusFilter === 'PENDING') {
      return p.review?.review_status === 'Submitted' || p.review?.review_status === 'Under Review';
    }
    if (statusFilter === 'CHANGES') {
      return p.review?.review_status === 'Changes Requested' || p.review?.title_status === 'Revision Required';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Student Submission Ledger
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">My Submitted Projects</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Track title approval decisions, manage documentation updates, view faculty evaluation feedback, and download submitted archives.
          </p>
        </div>

        <Link
          to="/student/submit"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold rounded-xl shadow-sm transition-colors flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Filter and Micro-Underlined Tabs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project title, submission code, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
            />
          </div>

          {/* Micro-Underlined Filter Tabs */}
          <div className="flex items-center space-x-6 overflow-x-auto border-b border-slate-100 pb-1">
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'PENDING', label: 'Pending Review' },
              { id: 'CHANGES', label: 'Changes Requested' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`pb-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  statusFilter === tab.id
                    ? 'border-[#0B1320] text-[#0B1320]'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No matching projects found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter tab.'
                : 'You have not submitted any projects yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Project & Cover</th>
                  <th className="py-3 px-6">Code & Category</th>
                  <th className="py-3 px-6">Title Decision</th>
                  <th className="py-3 px-6">Review Status</th>
                  <th className="py-3 px-6">Files</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProjects.map((p) => {
                  const srsFile = p.files?.find(f => f.file_type === 'srs');
                  const codeFile = p.files?.find(f => f.file_type === 'source_code');
                  const canEdit = !p.is_locked && (
                    p.review?.review_status === 'Changes Requested' ||
                    p.review?.review_status === 'Submitted' ||
                    p.review?.title_status === 'Revision Required'
                  );
                  const imgUrl = getImageUrl(p.title_image_url);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Project Title & Image Thumbnail */}
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-11 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 relative">
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
                          <div className="min-w-0">
                            <Link
                              to={`/student/projects/${p.id}`}
                              className="font-bold text-slate-900 hover:text-[#0A2540] line-clamp-1 transition-colors"
                            >
                              {p.project_title}
                            </Link>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              {p.project_type} &bull; Session {p.academic_session}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Code & Category */}
                      <td className="py-4 px-6">
                        <div className="font-mono text-slate-800 font-semibold text-xs">
                          {p.submission_code}
                        </div>
                        <span className="inline-block mt-0.5 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {p.category_name}
                        </span>
                      </td>

                      {/* Title Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={p.review?.title_status || 'Pending Approval'} type="title" />
                      </td>

                      {/* Review Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={p.review?.review_status || 'Submitted'} type="review" />
                      </td>

                      {/* Files */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          {srsFile && (
                            <button
                              onClick={() => handleDownload(srsFile.id, srsFile.original_filename)}
                              title={`Download ${srsFile.original_filename}`}
                              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded border border-slate-200"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {codeFile && (
                            <button
                              onClick={() => handleDownload(codeFile.id, codeFile.original_filename)}
                              title={`Download ${codeFile.original_filename}`}
                              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded border border-slate-200"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/student/projects/${p.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canEdit && (
                            <Link
                              to={`/student/projects/${p.id}/edit`}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Project"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
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

export default MyProjectsPage;