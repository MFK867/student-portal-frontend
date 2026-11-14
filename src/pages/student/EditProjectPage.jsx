import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileEdit, ArrowLeft, Save, AlertCircle, CheckCircle, Image, UploadCloud } from 'lucide-react';
import { getStudentProjectDetail, updateStudentProject, uploadTitleImage } from '../../services/api';

export const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    project_title: '',
    short_description: '',
    detailed_description: '',
    problem_statement: '',
    proposed_solution: '',
    objectives: '',
    title_image_url: '',
    github_url: '',
    demo_video_url: '',
    publication_visibility: true
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getStudentProjectDetail(id);
        const p = res.data;
        setProject(p);
        setFormData({
          project_title: p.project_title || '',
          short_description: p.short_description || '',
          detailed_description: p.detailed_description || '',
          problem_statement: p.problem_statement || '',
          proposed_solution: p.proposed_solution || '',
          objectives: p.objectives || '',
          title_image_url: p.title_image_url || '',
          github_url: p.github_url || '',
          demo_video_url: p.demo_video_url || '',
          publication_visibility: p.publication_visibility
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load project for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const res = await uploadTitleImage(file);
      setFormData(prev => ({ ...prev, title_image_url: res.data.url }));
      setSuccess('Title image uploaded successfully.');
    } catch (err) {
      setError('Failed to upload image. Allowed formats: JPG, PNG, WEBP, SVG.');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateStudentProject(id, formData);
      setSuccess('Project modifications saved successfully.');
      setTimeout(() => {
        navigate(`/student/projects/${id}`);
      }, 1200);
    } catch (err) {
      let errorMsg = 'Failed to update project.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => `${d.loc ? d.loc[d.loc.length - 1] : 'Field'}: ${d.msg}`).join(', ');
        }
      }
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading project data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div>
        <Link
          to={`/student/projects/${id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Details</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Project Submission</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Code: <span className="font-mono text-slate-700">{project?.submission_code}</span> &bull; {project?.project_type}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-700">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              name="project_title"
              required
              value={formData.project_title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
            />
          </div>

          {/* Project Title Image Section */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <label className="block text-xs font-semibold text-slate-800">
              Project Title Image / Cover
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {formData.title_image_url && (
                <div className="w-28 h-18 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0">
                  <img
                    src={formData.title_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  name="title_image_url"
                  placeholder="Image URL or upload a new file below"
                  value={formData.title_image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
                />
                <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{uploadingImg ? 'Uploading...' : 'Upload New Cover Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Description (Abstract)
            </label>
            <textarea
              name="short_description"
              rows={2}
              required
              value={formData.short_description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Problem Statement
              </label>
              <textarea
                name="problem_statement"
                rows={3}
                required
                value={formData.problem_statement}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Proposed Solution
              </label>
              <textarea
                name="proposed_solution"
                rows={3}
                required
                value={formData.proposed_solution}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Objectives
            </label>
            <textarea
              name="objectives"
              rows={3}
              required
              value={formData.objectives}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Detailed Architecture & Description
            </label>
            <textarea
              name="detailed_description"
              rows={4}
              required
              value={formData.detailed_description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Demo Video URL
              </label>
              <input
                type="url"
                name="demo_video_url"
                value={formData.demo_video_url}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                name="publication_visibility"
                checked={formData.publication_visibility}
                onChange={handleChange}
                className="rounded text-[#0B1320] focus:ring-[#0B1320]"
              />
              <span>Showcase visibility enabled for peer exploration</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link
              to={`/student/projects/${id}`}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Revisions'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;