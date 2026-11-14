import React, { useState, useEffect } from 'react';
import {
  getMySingleProject,
  createStudentProject,
  updateStudentProject,
  uploadSrsDocument,
  uploadSourceCode,
  uploadTitleImage,
  getShowcaseProjects,
  getCategories,
  getDepartments,
  downloadProjectFile
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-project'); // 'my-project' or 'all-projects'

  // My Project State
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State (for both create and edit)
  const [formData, setFormData] = useState({
    project_title: '',
    short_description: '',
    detailed_description: '',
    problem_statement: '',
    proposed_solution: '',
    objectives: '',
    category_id: '',
    project_type: 'Semester Project',
    academic_session: 'Fall 2026',
    custom_technologies: '',
    members: []
  });

  const [srsFile, setSrsFile] = useState(null);
  const [codeFile, setCodeFile] = useState(null);
  const [titleImageFile, setTitleImageFile] = useState(null);
  const [titleImageUrl, setTitleImageUrl] = useState('');

  // Auxiliary data
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // All Projects Directory State
  const [showcaseProjects, setShowcaseProjects] = useState([]);
  const [loadingShowcase, setLoadingShowcase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedModalProject, setSelectedModalProject] = useState(null);

  // UI status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      const [projRes, catRes, deptRes] = await Promise.all([
        getMySingleProject(),
        getCategories(),
        getDepartments()
      ]);

      const myProj = projRes.data;
      setProject(myProj);
      setCategories(catRes.data || []);
      setDepartments(deptRes.data || []);

      if (myProj) {
        setFormData({
          project_title: myProj.project_title || '',
          short_description: myProj.short_description || '',
          detailed_description: myProj.detailed_description || '',
          problem_statement: myProj.problem_statement || '',
          proposed_solution: myProj.proposed_solution || '',
          objectives: myProj.objectives || '',
          category_id: myProj.category_id || (catRes.data?.[0]?.id || ''),
          project_type: myProj.project_type || 'Semester Project',
          academic_session: myProj.academic_session || 'Fall 2026',
          custom_technologies: myProj.technologies?.map(t => t.name).join(', ') || '',
          members: (myProj.team_members || []).filter(m => m.member_role !== 'Leader').map(m => ({
            student_name: m.student_name,
            student_id_number: m.student_id_number,
            student_email: m.student_email || '',
            member_role: 'Member'
          }))
        });
        setTitleImageUrl(myProj.title_image_url || '');
      } else if (catRes.data && catRes.data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: catRes.data[0].id }));
      }
    } catch (err) {
      console.error("Error loading student project:", err);
    } finally {
      setLoadingProject(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load Showcase Projects when switching to Directory tab
  useEffect(() => {
    if (activeTab === 'all-projects') {
      loadShowcase();
    }
  }, [activeTab, searchQuery, selectedDept]);

  const loadShowcase = async () => {
    setLoadingShowcase(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedDept) params.department_id = selectedDept;
      const res = await getShowcaseProjects(params);
      setShowcaseProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load showcase projects:", err);
    } finally {
      setLoadingShowcase(false);
    }
  };

  // Add / Remove Team Members (Max 2 members + 1 lead = 3 students total)
  const handleAddMember = () => {
    if (formData.members.length >= 2) {
      setError('A project team can have at most 3 students (1 student lead + up to 2 team members).');
      return;
    }
    setFormData(prev => ({
      ...prev,
      members: [
        ...prev.members,
        { student_name: '', student_id_number: '', student_email: '', member_role: 'Member' }
      ]
    }));
  };

  const handleRemoveMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...formData.members];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, members: updated }));
  };

  // Form Submission (Create or Edit)
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!formData.project_title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!formData.short_description.trim()) {
      setError('Short summary is required.');
      return;
    }
    if (!formData.problem_statement.trim()) {
      setError('Problem statement is required.');
      return;
    }
    if (!formData.objectives.trim()) {
      setError('Objectives are required.');
      return;
    }

    // Validate member roll numbers
    const rollRegex = /^\d{4}-[A-Za-z]{2,5}-[A-Za-z]{2,5}-\d{2,5}$/;
    for (let i = 0; i < formData.members.length; i++) {
      const m = formData.members[i];
      if (!m.student_name.trim()) {
        setError(`Team member #${i + 1} name is required.`);
        return;
      }
      if (!rollRegex.test(m.student_id_number.trim())) {
        setError(`Team member #${i + 1} roll number (${m.student_id_number}) must start with year (e.g. 2023-BS-AI-011).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. Upload title image if newly selected
      let uploadedImageUrl = titleImageUrl;
      if (titleImageFile) {
        try {
          const imgRes = await uploadTitleImage(titleImageFile);
          uploadedImageUrl = imgRes.data.url;
        } catch (imgErr) {
          console.warn("Title image upload failed:", imgErr);
        }
      }

      // Parse custom technologies
      const customTechList = formData.custom_technologies
        ? formData.custom_technologies.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        project_title: formData.project_title.trim(),
        short_description: formData.short_description.trim(),
        detailed_description: formData.detailed_description.trim() || formData.short_description.trim(),
        problem_statement: formData.problem_statement.trim(),
        proposed_solution: formData.proposed_solution.trim() || formData.short_description.trim(),
        objectives: formData.objectives.trim(),
        category_id: parseInt(formData.category_id, 10),
        project_type: formData.project_type,
        academic_session: formData.academic_session,
        custom_technologies: customTechList,
        title_image_url: uploadedImageUrl || null,
        members: formData.members.map(m => ({
          student_name: m.student_name.trim(),
          student_id_number: m.student_id_number.trim().toUpperCase(),
          student_email: m.student_email.trim() || null,
          member_role: 'Member'
        }))
      };

      let currentProjectId;
      if (project) {
        // Edit existing project
        const res = await updateStudentProject(project.id, payload);
        currentProjectId = project.id;
        setProject(res.data);
        setIsEditing(false);
        setSuccess('Project details updated successfully.');
      } else {
        // Create new project
        const res = await createStudentProject(payload);
        currentProjectId = res.data.id;
        setProject(res.data);
        setSuccess('Project created and registered successfully.');
      }

      // 2. Upload SRS if selected
      if (srsFile && currentProjectId) {
        try {
          await uploadSrsDocument(currentProjectId, srsFile);
          setSrsFile(null);
        } catch (srsErr) {
          console.error("SRS Upload failed:", srsErr);
          const detail = srsErr.response?.data?.detail || srsErr.message || 'SRS upload failed';
          setError(prev => (prev ? prev + ' ' : '') + `Note: SRS file upload failed (${detail}).`);
        }
      }

      // 3. Upload Code ZIP if selected
      if (codeFile && currentProjectId) {
        try {
          await uploadSourceCode(currentProjectId, codeFile);
          setCodeFile(null);
        } catch (codeErr) {
          console.error("Code Upload failed:", codeErr);
          const detail = codeErr.response?.data?.detail || codeErr.message || 'Source code upload failed';
          setError(prev => (prev ? prev + ' ' : '') + `Note: Source code ZIP upload failed (${detail}).`);
        }
      }

      // Refresh project data
      const refreshed = await getMySingleProject();
      setProject(refreshed.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit project. Please verify all inputs.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProject) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading student workspace...</div>;
  }

  const studentProfile = user?.student_profile;

  return (
    <div className="space-y-6">
      {/* Top Banner & Switcher Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Student Project Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student: <span className="font-semibold text-slate-800">{user?.name}</span> ({studentProfile?.student_id || 'Student ID'}) &bull; Department: {studentProfile?.department_name || 'Computing'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('my-project')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'my-project'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Project
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all-projects')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'all-projects'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Project Directory
          </button>
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

      {/* ==================== TAB 1: MY PROJECT ==================== */}
      {activeTab === 'my-project' && (
        <div>
          {/* STATE A: Student already has a project and is NOT currently editing */}
          {project && !isEditing ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wide">
                      {project.submission_code}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs font-medium text-slate-600">
                      {project.academic_session}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
                    {project.project_title}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1.5">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      {project.category?.name || 'General Category'}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      {project.project_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {project.review?.review_status || 'Submitted'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md shadow-sm transition-colors"
                  >
                    Edit Project
                  </button>
                </div>
              </div>

              {/* Evaluation / Grade Banner (If graded by teacher) */}
              {project.evaluation && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4">
                  <div className="flex justify-between items-center border-b border-blue-200/80 pb-2 mb-2">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                      Faculty Evaluation Result
                    </span>
                    <span className="text-xs font-bold text-blue-900">
                      Score: {project.evaluation.total_marks} / 100 ({project.evaluation.percentage?.toFixed(1)}%) &bull; Grade: {project.evaluation.overall_grade}
                    </span>
                  </div>
                  <p className="text-xs text-blue-900/90 leading-relaxed">
                    <span className="font-semibold">Evaluator Comments:</span> {project.evaluation.overall_feedback || 'No written comments.'}
                  </p>
                </div>
              )}

              {/* Title Image (if present) */}
              {project.title_image_url && (
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 max-w-md">
                  <img
                    src={project.title_image_url}
                    alt={project.project_title}
                    className="w-full h-48 object-cover rounded-md border border-slate-200"
                  />
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 px-1">Project Title Image</span>
                </div>
              )}

              {/* Project Body */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Summary / Abstract</h3>
                  <p className="text-sm text-slate-800 leading-relaxed">{project.short_description}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Problem Statement</h3>
                  <p className="text-sm text-slate-800 leading-relaxed">{project.problem_statement}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">Objectives</h3>
                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{project.objectives}</p>
                </div>

                {/* Technologies */}
                <div>
                  <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Tools &amp; Technologies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies?.map((tech, idx) => (
                      <span key={idx} className="border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 rounded-md">
                        {tech.name}
                      </span>
                    ))}
                    {(!project.technologies || project.technologies.length === 0) && (
                      <span className="text-xs text-slate-400 italic">None specified</span>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Team Members (Max 3)</h3>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                    {/* Lead */}
                    <div className="p-3 bg-slate-50 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{user?.name}</span>
                        <span className="text-slate-500 font-mono ml-2">({studentProfile?.student_id || 'Student ID'})</span>
                      </div>
                      <span className="bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">Leader (You)</span>
                    </div>

                    {/* Other Members */}
                    {(project.team_members || [])
                      .filter(m => m.member_role !== 'Leader')
                      .map((member, idx) => (
                        <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-slate-900">{member.student_name}</span>
                            <span className="text-slate-500 font-mono ml-2">({member.student_id_number})</span>
                            {member.student_email && (
                              <span className="text-slate-400 font-mono ml-2">&bull; {member.student_email}</span>
                            )}
                          </div>
                          <span className="text-slate-500 text-[11px] font-medium">Member</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Documents & Files */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Attached Files</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.srs_document_file ? (
                      <button
                        type="button"
                        onClick={() => downloadProjectFile(project.srs_document_file.id, `${project.submission_code}_SRS.pdf`)}
                        className="border border-slate-300 hover:border-slate-400 px-3.5 py-2 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                      >
                        Download SRS Document
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 border border-dashed border-slate-200 px-3 py-2 rounded-md">No SRS Document attached</span>
                    )}

                    {project.code_archive_file ? (
                      <button
                        type="button"
                        onClick={() => downloadProjectFile(project.code_archive_file.id, `${project.submission_code}_Code.zip`)}
                        className="border border-slate-300 hover:border-slate-400 px-3.5 py-2 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                      >
                        Download Code Archive (.zip)
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 border border-dashed border-slate-200 px-3 py-2 rounded-md">No Code ZIP attached</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STATE B: Project Submission Form (Create OR Edit mode) */
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              {/* Form Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {project ? 'Edit Project Details' : 'Submit Project'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {project
                      ? 'Update your submission information, tools, or files.'
                      : 'Each student is allowed strictly one project submission.'}
                  </p>
                </div>

                <div className="flex gap-2">
                  {project && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3.5 py-1.5 rounded-md shadow-2xs transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmitProject} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.project_title}
                    onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                    placeholder="e.g. Autonomous Edge AI Surveillance & Anomaly Detection"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                  />
                </div>

                {/* Category & Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Domain Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Academic Session *
                    </label>
                    <select
                      value={formData.academic_session}
                      onChange={(e) => setFormData({ ...formData, academic_session: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                    >
                      <option value="Fall 2026">Fall 2026</option>
                      <option value="Spring 2026">Spring 2026</option>
                      <option value="Fall 2025">Fall 2025</option>
                    </select>
                  </div>
                </div>

                {/* Title Image (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Project Title Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTitleImageFile(e.target.files[0] || null)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WebP preview image for the project directory.</p>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Short Summary / Abstract *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief 2-3 sentence overview of the project objectives and implementation."
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors leading-relaxed"
                  />
                </div>

                {/* Problem Statement */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Problem Statement *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.problem_statement}
                    onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                    placeholder="Describe the exact problem or challenge this project addresses."
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors leading-relaxed"
                  />
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Objectives *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    placeholder="1. Design system architecture&#10;2. Benchmark model latency"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors leading-relaxed"
                  />
                </div>

                {/* Tools and Technologies */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Tools &amp; Technologies (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.custom_technologies}
                    onChange={(e) => setFormData({ ...formData, custom_technologies: e.target.value })}
                    placeholder="e.g. React, FastAPI, MySQL, Tailwind CSS, PyTorch"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Enter technologies separated by commas.</p>
                </div>

                {/* Team Members Section (Max 3 students total) */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-slate-800 tracking-wider">
                        Team Members (Max 3 Students Total)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Lead: <span className="font-semibold text-slate-800">{user?.name}</span> ({studentProfile?.student_id || 'Your ID'})
                      </p>
                    </div>

                    {formData.members.length < 2 && (
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-medium rounded-md shadow-2xs transition-colors"
                      >
                        + Add Member
                      </button>
                    )}
                  </div>

                  {formData.members.map((member, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3.5 bg-white mb-2.5 space-y-2 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-700">Team Member #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Name *</label>
                          <input
                            type="text"
                            value={member.student_name}
                            onChange={(e) => handleMemberChange(index, 'student_name', e.target.value)}
                            placeholder="Student Name"
                            required
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Roll No (Year first) *</label>
                          <input
                            type="text"
                            value={member.student_id_number}
                            onChange={(e) => handleMemberChange(index, 'student_id_number', e.target.value)}
                            placeholder="2023-BS-AI-011"
                            required
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Institutional Email</label>
                          <input
                            type="email"
                            value={member.student_email}
                            onChange={(e) => handleMemberChange(index, 'student_email', e.target.value)}
                            placeholder="student@tuf.edu.pk"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* File Uploads (SRS Document & Code ZIP) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-xl p-5 bg-slate-50/60">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      SRS Document (.pdf, .docx, max 100MB) {project ? '(Optional to replace)' : ''}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => setSrsFile(e.target.files[0] || null)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-xs file:font-medium file:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Source Code Archive (.zip, max 500MB) {project ? '(Optional to replace)' : ''}
                    </label>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setCodeFile(e.target.files[0] || null)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:text-xs file:font-medium file:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    {submitting ? 'Saving Project Details...' : (project ? 'Save Project Changes' : 'Submit Project')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: ALL UNIVERSITY PROJECTS ==================== */}
      {activeTab === 'all-projects' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Project Directory
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Browse submitted capstones and semester projects across all academic departments.
            </p>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, student name, roll number, technology..."
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Projects List */}
          {loadingShowcase ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading project directory...</div>
          ) : showcaseProjects.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              No projects found in the directory.
            </div>
          ) : (
            <div className="space-y-3.5">
              {showcaseProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-2xs"
                >
                  <div className="flex items-start gap-4">
                    {/* Project Title Image thumbnail if present */}
                    {p.title_image_url ? (
                      <img
                        src={p.title_image_url}
                        alt={p.project_title}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-400 uppercase flex-shrink-0 text-center p-1">
                        No Image
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-medium text-slate-700">{p.submission_code}</span>
                        <span>&bull;</span>
                        <span>{p.department?.name || 'Department'}</span>
                        <span>&bull;</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium">
                          {p.category?.name || 'Category'}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 mt-1">
                        {p.project_title}
                      </h3>

                      {/* Student Name & Roll Number displayed prominently */}
                      <p className="text-xs text-slate-700 mt-1">
                        Student: <span className="font-semibold text-slate-900">{p.student_owner?.name}</span> &bull; Roll No: <span className="font-mono font-medium text-slate-600">{p.student_profile?.student_id || 'N/A'}</span>
                      </p>

                      {/* Tech stack */}
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.technologies.slice(0, 5).map((t, idx) => (
                            <span key={idx} className="border border-slate-200 px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-600 rounded">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedModalProject(p)}
                    className="border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-1.5 text-xs font-medium rounded-md shadow-2xs transition-colors flex-shrink-0"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Details Modal */}
          {selectedModalProject && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-500">{selectedModalProject.submission_code}</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedModalProject.project_title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Student: <span className="font-semibold text-slate-900">{selectedModalProject.student_owner?.name}</span> &bull; Roll No: <span className="font-mono text-slate-600">{selectedModalProject.student_profile?.student_id || 'N/A'}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedModalProject(null)}
                    className="border border-slate-200 hover:border-slate-300 px-2.5 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Close
                  </button>
                </div>

                {selectedModalProject.title_image_url && (
                  <img
                    src={selectedModalProject.title_image_url}
                    alt={selectedModalProject.project_title}
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                  />
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Summary</h4>
                  <p className="text-sm text-slate-800 mt-1 leading-relaxed">{selectedModalProject.short_description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Problem Statement</h4>
                  <p className="text-sm text-slate-800 mt-1 leading-relaxed">{selectedModalProject.problem_statement}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Objectives</h4>
                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-line leading-relaxed">{selectedModalProject.objectives}</p>
                </div>

                {selectedModalProject.technologies && selectedModalProject.technologies.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1.5">Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModalProject.technologies.map((t, idx) => (
                        <span key={idx} className="border border-slate-200 px-2.5 py-0.5 text-xs font-medium bg-slate-50 text-slate-700 rounded-md">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
