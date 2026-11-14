import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Github,
  Video,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Code2,
  FileCode,
  ShieldCheck,
  Eye,
  Sparkles,
  Users,
  CopyCheck,
  HelpCircle,
  Image as ImageIcon,
  UploadCloud,
  Hash,
  X,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import {
  getCategories,
  getTechnologies,
  createStudentProject,
  uploadSrsDocument,
  uploadSourceCode,
  uploadTitleImage
} from '../../services/api';

const ROLL_NO_REGEX = /^\d{4}-[A-Za-z]{2,5}-[A-Za-z]{2,5}-\d{2,5}$/;
const MAX_SRS_MB = 100;
const MAX_CODE_MB = 500;
const MAX_ADDITIONAL_MEMBERS = 2; // Total team size: 1 Lead + 2 Members = 3 Students Max

const PRESET_COVERS = [
  { id: 'cs', label: 'Computer Science Department', url: '/api/files/images/crop_ai.svg' },
  { id: 'se', label: 'Software Engineering Department', url: '/api/files/images/iot_campus.svg' },
  { id: 'ai', label: 'Artificial Intelligence & Computing', url: '/api/files/images/blockchain_edu.svg' },
];

const POPULAR_TECH_SUGGESTIONS = [
  'Python', 'FastAPI', 'React', 'Node.js', 'MySQL', 'PostgreSQL',
  'MongoDB', 'Docker', 'PyTorch', 'TensorFlow', 'OpenCV', 'Flutter',
  'Java', 'C++', 'Tailwind CSS', 'Redis', 'Git', 'Next.js', 'Express.js',
  'TypeScript', 'AWS', 'Kubernetes', 'Pandas', 'NumPy', 'Scikit-learn'
];

export const SubmitProjectPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
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
    technology_ids: [],
    custom_technologies: [],
    is_group: false,
    members: [],
    title_image_url: '',
    github_url: '',
    demo_video_url: '',
    publication_visibility: true
  });

  const [titleImagePreview, setTitleImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customTechInput, setCustomTechInput] = useState('');

  // Team member input with year-first roll number
  const [memberInput, setMemberInput] = useState({
    student_name: '',
    student_id_number: '',
    student_email: '',
    member_role: 'Member'
  });

  // Files
  const [srsFile, setSrsFile] = useState(null);
  const [codeZipFile, setCodeZipFile] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, techRes] = await Promise.all([
          getCategories(),
          getTechnologies()
        ]);
        setCategories(catRes.data || []);
        setAvailableTechs(techRes.data || []);
        if (catRes.data && catRes.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: catRes.data[0].id.toString() }));
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear specific field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // ----------------- TOOLS & TECHNOLOGY INPUT -----------------
  // Add tools via direct typing (supports comma-separated values)
  const handleAddCustomTech = (e) => {
    if (e) e.preventDefault();
    const raw = customTechInput.trim();
    if (!raw) return;

    // Split comma-separated tokens (e.g. "React, Node.js, Express")
    const tokens = raw.split(',').map(t => t.trim()).filter(Boolean);
    const newCustom = [...formData.custom_technologies];
    const newIds = [...formData.technology_ids];

    tokens.forEach(token => {
      // Check if it matches an existing technology from the database
      const matchedDb = availableTechs.find(t => t.name.toLowerCase() === token.toLowerCase());
      if (matchedDb) {
        if (!newIds.includes(matchedDb.id)) {
          newIds.push(matchedDb.id);
        }
      } else {
        if (!newCustom.some(c => c.toLowerCase() === token.toLowerCase())) {
          newCustom.push(token);
        }
      }
    });

    setFormData(prev => ({
      ...prev,
      technology_ids: newIds,
      custom_technologies: newCustom
    }));
    setCustomTechInput('');
    if (fieldErrors.technologies) {
      setFieldErrors(prev => {
        const u = { ...prev };
        delete u.technologies;
        return u;
      });
    }
  };

  const removeTechItem = (techId, isCustom = false, customName = '') => {
    if (isCustom) {
      setFormData(prev => ({
        ...prev,
        custom_technologies: prev.custom_technologies.filter(c => c !== customName)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        technology_ids: prev.technology_ids.filter(id => id !== techId)
      }));
    }
  };

  const toggleTechPreset = (techName) => {
    const matchedDb = availableTechs.find(t => t.name.toLowerCase() === techName.toLowerCase());
    if (matchedDb) {
      const isSelected = formData.technology_ids.includes(matchedDb.id);
      setFormData(prev => ({
        ...prev,
        technology_ids: isSelected
          ? prev.technology_ids.filter(id => id !== matchedDb.id)
          : [...prev.technology_ids, matchedDb.id]
      }));
    } else {
      const isCustomSelected = formData.custom_technologies.some(c => c.toLowerCase() === techName.toLowerCase());
      setFormData(prev => ({
        ...prev,
        custom_technologies: isCustomSelected
          ? prev.custom_technologies.filter(c => c.toLowerCase() !== techName.toLowerCase())
          : [...prev.custom_technologies, techName]
      }));
    }
    if (fieldErrors.technologies) {
      setFieldErrors(prev => {
        const u = { ...prev };
        delete u.technologies;
        return u;
      });
    }
  };

  const isTechActive = (techName) => {
    const matchedDb = availableTechs.find(t => t.name.toLowerCase() === techName.toLowerCase());
    if (matchedDb && formData.technology_ids.includes(matchedDb.id)) return true;
    return formData.custom_technologies.some(c => c.toLowerCase() === techName.toLowerCase());
  };

  // ----------------- TEAM MEMBER MANAGEMENT (MAX 3 STUDENTS TOTAL: 1 LEAD + 2 MEMBERS) -----------------
  const addTeamMember = () => {
    setError('');

    // Strict Check: Max students are 3 (1 Lead + max 2 Members)
    if (formData.members.length >= MAX_ADDITIONAL_MEMBERS) {
      setError(`Maximum team size reached. A project team can have a maximum of 3 students (1 Project Lead + 2 Team Members).`);
      return;
    }

    const name = memberInput.student_name.trim();
    const rollNo = memberInput.student_id_number.trim().toUpperCase();
    const email = memberInput.student_email.trim().toLowerCase();
    const role = memberInput.member_role.trim() || 'Member';

    if (!name) {
      setError('Member Full Name is required.');
      return;
    }
    if (!rollNo) {
      setError('Member Roll Number is required (Format: 2023-BS-AI-025).');
      return;
    }
    if (!ROLL_NO_REGEX.test(rollNo)) {
      setError('Invalid Roll Number format. Must start with year (e.g. 2023-BS-AI-025 or 2022-BS-CS-041). Follow format: YYYY-DEGREE-MAJOR-NUM');
      return;
    }
    if (!email) {
      setError('Member University Email is required.');
      return;
    }
    if (!email.endsWith('@tuf.edu.pk')) {
      setError('Member email must be an official university address ending in @tuf.edu.pk');
      return;
    }

    if (formData.members.some(m => m.student_id_number.toUpperCase() === rollNo)) {
      setError(`Roll number ${rollNo} is already added to this team.`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      members: [
        ...prev.members,
        {
          student_name: name,
          student_id_number: rollNo,
          student_email: email,
          member_role: role
        }
      ]
    }));

    setMemberInput({
      student_name: '',
      student_id_number: '',
      student_email: '',
      member_role: 'Member'
    });
  };

  const removeTeamMember = (index) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  // ----------------- FILE & IMAGE HANDLING -----------------
  const handleTitleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
      setError('Title image must be JPG, PNG, WEBP, or SVG.');
      return;
    }

    setTitleImagePreview(URL.createObjectURL(file));
    setError('');
    setUploadingImage(true);

    try {
      const res = await uploadTitleImage(file);
      setFormData(prev => ({ ...prev, title_image_url: res.data.url }));
    } catch (err) {
      setError('Failed to upload image. Please try another file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSrsFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSrsFile(null);
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      setError('Invalid SRS document format. Only PDF (.pdf) and Word (.docx) documents are permitted.');
      setSrsFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SRS_MB * 1024 * 1024) {
      setError(`SRS document exceeds the maximum permitted size of ${MAX_SRS_MB} MB. Current file size: ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
      setSrsFile(null);
      e.target.value = '';
      return;
    }

    setError('');
    if (fieldErrors.srsFile) {
      setFieldErrors(prev => {
        const u = { ...prev };
        delete u.srsFile;
        return u;
      });
    }
    setSrsFile(file);
  };

  const handleCodeZipFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCodeZipFile(null);
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.zip') {
      setError('Invalid code archive format. Source code must be uploaded as a ZIP (.zip) file.');
      setCodeZipFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_CODE_MB * 1024 * 1024) {
      setError(`Source code archive exceeds the maximum permitted size of ${MAX_CODE_MB} MB. Current file size: ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
      setCodeZipFile(null);
      e.target.value = '';
      return;
    }

    setError('');
    setCodeZipFile(file);
  };

  // ----------------- STRICT STEP VALIDATION (CANNOT GO FORWARD WITHOUT REQUIRED INPUTS) -----------------
  const validateStep = (step) => {
    setError('');
    const errors = {};

    // Step 1: Project Specifications & Technologies
    if (step === 1) {
      if (!formData.project_title.trim() || formData.project_title.trim().length < 5) {
        errors.project_title = 'Project Title is required (minimum 5 characters).';
      }
      if (!formData.category_id || isNaN(parseInt(formData.category_id, 10))) {
        errors.category_id = 'Please select an Academic Domain Category.';
      }
      if (!formData.academic_session.trim()) {
        errors.academic_session = 'Academic Session is required (e.g. Fall 2026).';
      }
      if (!formData.project_type.trim()) {
        errors.project_type = 'Please select Project Classification.';
      }
      if (!formData.short_description.trim() || formData.short_description.trim().length < 20) {
        errors.short_description = 'Executive Summary / Abstract is required (minimum 20 characters).';
      }
      if (!formData.problem_statement.trim() || formData.problem_statement.trim().length < 20) {
        errors.problem_statement = 'Problem Statement is required (minimum 20 characters).';
      }
      if (!formData.proposed_solution.trim() || formData.proposed_solution.trim().length < 20) {
        errors.proposed_solution = 'Proposed Solution & Innovation is required (minimum 20 characters).';
      }
      if (!formData.objectives.trim() || formData.objectives.trim().length < 20) {
        errors.objectives = 'Project Deliverables & Objectives are required (minimum 20 characters).';
      }
      if (!formData.detailed_description.trim() || formData.detailed_description.trim().length < 20) {
        errors.detailed_description = 'Detailed Technical Architecture & System Implementation is required (minimum 20 characters).';
      }

      const totalTechCount = formData.technology_ids.length + formData.custom_technologies.length;
      if (totalTechCount === 0) {
        errors.technologies = 'Please input or select at least one Tool / Technology utilized in this project.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        const firstErrorKey = Object.keys(errors)[0];
        setError(`Please complete all required fields before proceeding: ${errors[firstErrorKey]}`);
        return false;
      }
    }

    // Step 2: Documents & Code Archives
    if (step === 2) {
      if (!srsFile) {
        errors.srsFile = 'SRS Document (PDF or DOCX format, up to 100 MB) is required.';
        setFieldErrors(errors);
        setError('Please upload your Software Requirements Specification (SRS) Document before proceeding.');
        return false;
      }
    }

    // Step 3: Team Roster
    if (step === 3) {
      if (formData.is_group) {
        if (formData.members.length === 0) {
          setError('Group projects must have at least 1 team member added (or switch to Individual Project if working alone).');
          return false;
        }
        if (formData.members.length > MAX_ADDITIONAL_MEMBERS) {
          setError(`A project team can have a maximum of 3 students (1 Project Lead + up to 2 team members). You currently have ${formData.members.length + 1} students.`);
          return false;
        }
      }
    }

    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError('');
    setFieldErrors({});
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ----------------- FINAL SUBMISSION HANDLER -----------------
  const handleFinalSubmit = async () => {
    // Re-verify all steps before final API execution
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setLoading(true);
    setError('');
    let createdProjectId = null;

    try {
      // 1. Create Core Project Record
      const projectPayload = {
        project_title: formData.project_title.trim(),
        short_description: formData.short_description.trim(),
        detailed_description: formData.detailed_description.trim(),
        problem_statement: formData.problem_statement.trim(),
        proposed_solution: formData.proposed_solution.trim(),
        objectives: formData.objectives.trim(),
        category_id: parseInt(formData.category_id, 10),
        project_type: formData.project_type,
        academic_session: formData.academic_session.trim(),
        technology_ids: formData.technology_ids,
        custom_technologies: formData.custom_technologies,
        members: formData.is_group ? formData.members : [],
        title_image_url: formData.title_image_url || null,
        github_url: formData.github_url?.trim() || null,
        demo_video_url: formData.demo_video_url?.trim() || null,
        publication_visibility: formData.publication_visibility
      };

      const projectRes = await createStudentProject(projectPayload);
      createdProjectId = projectRes.data.id;

      let uploadWarnings = [];

      // 2. Upload SRS Document
      if (srsFile && createdProjectId) {
        try {
          await uploadSrsDocument(createdProjectId, srsFile, (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded * 50) / e.total));
          });
        } catch (srsErr) {
          console.error('SRS Upload failed:', srsErr);
          const detail = srsErr.response?.data?.detail || srsErr.message || 'SRS upload failed';
          uploadWarnings.push(`SRS: ${detail}`);
        }
      }

      // 3. Upload Source Code ZIP (if provided)
      if (codeZipFile && createdProjectId) {
        try {
          await uploadSourceCode(createdProjectId, codeZipFile, (e) => {
            if (e.total) setUploadProgress(50 + Math.round((e.loaded * 50) / e.total));
          });
        } catch (codeErr) {
          console.error('Code Upload failed:', codeErr);
          const detail = codeErr.response?.data?.detail || codeErr.message || 'Code upload failed';
          uploadWarnings.push(`Code ZIP: ${detail}`);
        }
      }

      if (uploadWarnings.length > 0) {
        navigate(`/student/projects/${createdProjectId}?warning=${encodeURIComponent(uploadWarnings.join(' | '))}`);
      } else {
        navigate(`/student/projects/${createdProjectId}`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      let errorMsg = 'Failed to submit project. Please verify all inputs.';

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(d => {
            const field = d.loc ? d.loc[d.loc.length - 1] : 'Field';
            return `${field.replace('_', ' ')}: ${d.msg}`;
          }).join(' | ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Project Specifications' },
    { num: 2, title: 'Documents & Code' },
    { num: 3, title: 'Team Roster (Max 3)' },
    { num: 4, title: 'Review & Submit' }
  ];

  const totalSelectedTools = formData.technology_ids.length + formData.custom_technologies.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Banner with Autofill */}
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-slate-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>TUF Academic Registry</span>
            <span>&bull;</span>
            <span>Submission Workflow</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Submit Academic Project</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Record semester projects and capstones with SRS documentation, source code archives, and team contributors.
          </p>
        </div>
      </div>

      {/* 4 Clean Steps Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < currentStep) {
                  setError('');
                  setCurrentStep(s.num);
                }
              }}
              disabled={s.num > currentStep}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                isActive
                  ? 'bg-white border-[#0B1320] shadow-sm'
                  : isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 cursor-pointer'
                  : 'bg-slate-50 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase font-bold ${
                  isActive ? 'text-[#0B1320]' : isDone ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  Step {s.num}
                </span>
                {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <p className={`font-bold mt-0.5 truncate ${
                isActive ? 'text-slate-900' : isDone ? 'text-emerald-900' : 'text-slate-500'
              }`}>
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Primary Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
          <div className="flex-1">
            <span className="font-bold block">Action Required</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: Project Specifications & Tools/Technology Input */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 1: Project Specifications &amp; Tools</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify academic parameters, narrative description, and all tools &amp; technologies utilized. All required fields are marked with a red asterisk (<span className="text-rose-500 font-bold">*</span>).
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  Project Title <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Min 5 characters</span>
              </div>
              <input
                type="text"
                name="project_title"
                required
                placeholder="e.g. Autonomous Crop Disease Diagnosis & Treatment Platform"
                value={formData.project_title}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2.5 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 font-semibold text-slate-900 ${
                  fieldErrors.project_title ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                }`}
              />
              {fieldErrors.project_title && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.project_title}</p>
              )}
            </div>

            {/* Category, Classification, Session */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domain Category <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 text-slate-800 ${
                    fieldErrors.category_id ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                  }`}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {fieldErrors.category_id && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.category_id}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Classification <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <select
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 text-slate-800"
                >
                  <option value="Semester Project">Semester Project</option>
                  <option value="Final Year Project">Final Year Project</option>
                  <option value="Research Project">Research Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Session <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <input
                  type="text"
                  name="academic_session"
                  value={formData.academic_session}
                  onChange={handleInputChange}
                  placeholder="e.g. Fall 2026"
                  className={`w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 text-slate-800 font-mono ${
                    fieldErrors.academic_session ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                  }`}
                />
                {fieldErrors.academic_session && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.academic_session}</p>
                )}
              </div>
            </div>

            {/* Executive Summary / Abstract */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  Executive Summary / Abstract <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {formData.short_description.length} / 500 chars (Min 20)
                </span>
              </div>
              <textarea
                name="short_description"
                rows={2}
                maxLength={500}
                required
                placeholder="Concise overview of project objectives and core technical accomplishments (min 20 characters)..."
                value={formData.short_description}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2.5 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 leading-relaxed text-slate-800 ${
                  fieldErrors.short_description ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                }`}
              />
              {fieldErrors.short_description && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.short_description}</p>
              )}
            </div>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Problem Statement <span className="text-rose-500 font-bold">* Required</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Min 20 chars</span>
                </div>
                <textarea
                  name="problem_statement"
                  rows={3}
                  required
                  placeholder="Explain the academic or real-world problem being addressed..."
                  value={formData.problem_statement}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 text-slate-800 ${
                    fieldErrors.problem_statement ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                  }`}
                />
                {fieldErrors.problem_statement && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.problem_statement}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Proposed Solution &amp; Innovation <span className="text-rose-500 font-bold">* Required</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Min 20 chars</span>
                </div>
                <textarea
                  name="proposed_solution"
                  rows={3}
                  required
                  placeholder="Describe your engineered solution and novel approach..."
                  value={formData.proposed_solution}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 text-slate-800 ${
                    fieldErrors.proposed_solution ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                  }`}
                />
                {fieldErrors.proposed_solution && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.proposed_solution}</p>
                )}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  Project Deliverables &amp; Objectives <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Min 20 chars</span>
              </div>
              <textarea
                name="objectives"
                rows={2}
                required
                placeholder="1. Build machine learning model. 2. Implement backend REST API..."
                value={formData.objectives}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 text-slate-800 ${
                  fieldErrors.objectives ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                }`}
              />
              {fieldErrors.objectives && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.objectives}</p>
              )}
            </div>

            {/* Detailed Architecture & Technical Implementation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  Detailed Technical Architecture &amp; System Implementation <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Min 20 chars</span>
              </div>
              <textarea
                name="detailed_description"
                rows={4}
                required
                placeholder="Explain the software architecture, database schema, data pipelines, API protocols, and module interactions..."
                value={formData.detailed_description}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2 text-xs rounded-lg bg-slate-50 border focus:outline-none focus:ring-2 font-mono text-[11px] text-slate-800 leading-relaxed ${
                  fieldErrors.detailed_description ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-[#0B1320]/20'
                }`}
              />
              {fieldErrors.detailed_description && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.detailed_description}</p>
              )}
            </div>

            {/* ----------------- TOOLS & TECHNOLOGY INPUT SECTION ----------------- */}
            <div className={`p-5 rounded-xl border space-y-4 ${
              fieldErrors.technologies ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/70 border-slate-200/80'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-900 block">
                    Tools &amp; Technologies <span className="text-rose-500 font-bold">* Required</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Input custom tools, libraries, and frameworks used in your project, or select from quick suggestions.
                  </p>
                </div>
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded font-semibold self-start sm:self-auto ${
                  totalSelectedTools > 0 ? 'bg-[#0B1320] text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {totalSelectedTools} Tool{totalSelectedTools === 1 ? '' : 's'} Selected
                </span>
              </div>

              {/* Direct Input Field for Student */}
              <form onSubmit={handleAddCustomTech} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type any tool or technology (e.g. React, PyTorch, Docker, PostgreSQL) and press Enter or comma..."
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddCustomTech();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-medium"
                />
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tool</span>
                </button>
              </form>

              {/* Active Tools Tags */}
              {totalSelectedTools > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Active Project Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Database Technologies */}
                    {formData.technology_ids.map(id => {
                      const tech = availableTechs.find(t => t.id === id);
                      if (!tech) return null;
                      return (
                        <span
                          key={`db-${id}`}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0B1320] text-white text-xs font-medium shadow-sm animate-in fade-in"
                        >
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                          <span>{tech.name}</span>
                          <button
                            type="button"
                            onClick={() => removeTechItem(id, false)}
                            className="text-slate-400 hover:text-white ml-1 p-0.5"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}

                    {/* Custom Typed Technologies */}
                    {formData.custom_technologies.map(name => (
                      <span
                        key={`custom-${name}`}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-medium shadow-sm animate-in fade-in"
                      >
                        <Check className="w-3 h-3 text-sky-400 stroke-[3]" />
                        <span>{name}</span>
                        <span className="text-[9px] px-1 py-0.2 bg-slate-700 text-slate-300 rounded font-mono">Custom</span>
                        <button
                          type="button"
                          onClick={() => removeTechItem(null, true, name)}
                          className="text-slate-400 hover:text-white ml-1 p-0.5"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 font-medium">
                  Please enter at least one tool or select from the quick suggestions below.
                </p>
              )}

              {/* Quick Select Popular Suggestions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  Quick-Select Common Tech Stacks:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TECH_SUGGESTIONS.map((tech) => {
                    const active = isTechActive(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTechPreset(tech)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                          active
                            ? 'bg-[#0B1320] text-white shadow-sm ring-1 ring-[#0B1320]'
                            : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                        }`}
                      >
                        <span>{tech}</span>
                        {active && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ----------------- OPTIONAL FIELDS: TITLE IMAGE COVER & SHOWCASE ----------------- */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              {/* Cover Image Upload (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Project Cover / Title Image <span className="text-slate-400 font-normal font-sans">(Optional)</span></span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">JPG, PNG, WEBP, SVG &bull; Max 10MB</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select an official department cover or upload an authentic screenshot of your project.
                </p>

                {/* Preset Typography Covers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {PRESET_COVERS.map((preset) => {
                    const isSelected = formData.title_image_url === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, title_image_url: preset.url }));
                          setTitleImagePreview(preset.url);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70">Official Preset</span>
                        <span className="font-bold text-xs truncate block mt-0.5">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom File Upload */}
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-slate-200">
                    <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload Custom Project Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTitleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadingImage && <span className="text-xs text-slate-500 animate-pulse">Uploading cover...</span>}
                  {formData.title_image_url && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, title_image_url: '' }));
                        setTitleImagePreview('');
                      }}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Clear Cover
                    </button>
                  )}
                </div>

                {titleImagePreview && (
                  <div className="mt-3 w-48 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
                    <img src={titleImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Showcase Visibility (Optional) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="publication_visibility"
                    checked={formData.publication_visibility}
                    onChange={handleInputChange}
                    className="rounded text-[#0B1320] focus:ring-[#0B1320] w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Public Showcase Directory Visibility <span className="text-slate-400 font-normal font-sans">(Optional)</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When enabled, your project title, description, team, and tech stack will be visible in the University Showcase directory upon faculty approval.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <span>Next: Documents &amp; Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Documents & Code Archives */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 2: Documents &amp; Code Archives</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach project documentation and codebase. SRS Document is required; Code ZIP and external links are optional.
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* SRS Document (REQUIRED) */}
            <div className={`p-5 rounded-xl space-y-2 border ${
              fieldErrors.srsFile ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>Software Requirements Specification (SRS) Document</span>
                  <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Allowed: PDF, DOCX &bull; Max {MAX_SRS_MB} MB
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload your complete, formatted SRS document compliant with university formatting guidelines.
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleSrsFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0B1320] file:text-white hover:file:bg-[#1E293B] cursor-pointer"
              />
              {srsFile && (
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 mt-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Selected: {srsFile.name} ({(srsFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              {fieldErrors.srsFile && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.srsFile}</p>
              )}
            </div>

            {/* Source Code Archive (OPTIONAL) */}
            <div className="p-5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="font-bold text-slate-900 flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-slate-700" />
                  <span>Source Code Archive (.ZIP)</span>
                  <span className="text-slate-400 font-normal font-sans">(Optional)</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Allowed: ZIP &bull; Max {MAX_CODE_MB} MB
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload a compressed ZIP archive containing full project implementation source code, config files, and tests.
              </p>
              <input
                type="file"
                accept=".zip"
                onChange={handleCodeZipFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0B1320] file:text-white hover:file:bg-[#1E293B] cursor-pointer"
              />
              {codeZipFile && (
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 mt-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Selected: {codeZipFile.name} ({(codeZipFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>

            {/* External Links (OPTIONAL) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository Link <span className="text-slate-400 font-normal">(Optional)</span></span>
                </label>
                <input
                  type="url"
                  name="github_url"
                  placeholder="https://github.com/username/project-repo"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>Demonstration Video Link <span className="text-slate-400 font-normal">(Optional)</span></span>
                </label>
                <input
                  type="url"
                  name="demo_video_url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.demo_video_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <span>Next: Team Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Student Project Team Roster (MAX 3 STUDENTS TOTAL) */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Step 3: Student Project Team Roster</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Max 3 Students
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                University regulation: A project team can have a maximum of 3 students (1 Project Lead + up to 2 Team Members).
              </p>
            </div>

            {/* Individual vs Group Toggle */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_group: false }))}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  !formData.is_group ? 'bg-[#0B1320] text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Individual (1 Student)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_group: true }))}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  formData.is_group ? 'bg-[#0B1320] text-white shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
              >
                Group (2-3 Students)
              </button>
            </div>
          </div>

          {/* Group Members Form */}
          {formData.is_group ? (
            <div className="space-y-4 text-xs">
              {/* Member Add Form Box */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Add Team Member ({formData.members.length} / {MAX_ADDITIONAL_MEMBERS} added)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    Total Team: {formData.members.length + 1} / 3 Students
                  </span>
                </div>

                {formData.members.length < MAX_ADDITIONAL_MEMBERS ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Student Full Name <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hamza Tariq"
                          value={memberInput.student_name}
                          onChange={(e) => setMemberInput({ ...memberInput, student_name: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Roll Number <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="2023-BS-AI-025"
                          value={memberInput.student_id_number}
                          onChange={(e) => setMemberInput({ ...memberInput, student_id_number: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          University Email <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="name@tuf.edu.pk"
                          value={memberInput.student_email}
                          onChange={(e) => setMemberInput({ ...memberInput, student_email: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Project Role <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ML Engineer"
                          value={memberInput.member_role}
                          onChange={(e) => setMemberInput({ ...memberInput, member_role: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Roll number must start with year (e.g. 2023-BS-AI-025) &bull; Email must end with @tuf.edu.pk
                      </span>
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="inline-flex items-center space-x-1 px-4 py-1.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Member</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-xs">
                      Maximum team limit reached: 3 students total (1 Project Lead + 2 Team Members).
                    </span>
                  </div>
                )}
              </div>

              {/* Members Table */}
              {formData.members.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-4">Member Name</th>
                        <th className="py-2.5 px-4">Roll Number</th>
                        <th className="py-2.5 px-4">University Email</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {formData.members.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{m.student_name}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{m.student_id_number}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{m.student_email}</td>
                          <td className="py-2.5 px-4 text-slate-700">{m.member_role}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeTeamMember(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                              title="Remove member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 border border-dashed border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No team members added yet</p>
                  <p className="text-[11px] mt-0.5">Add 1 or 2 student contributors above. Total team size is limited to 3 students.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200">
              <span className="font-bold text-slate-800 block text-sm">Individual Project Submission</span>
              <p className="text-slate-600 leading-relaxed">
                You are submitting as the sole author and lead developer. Your official student profile and roll number will represent this submission. No other team members are required.
              </p>
            </div>
          )}

          {/* Step 3 Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <span>Next: Review &amp; Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Review & Final Submission */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Step 4: Review &amp; Final Submission</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your project details, tools, files, and team members before final submission for faculty evaluation.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Title & Classification */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {formData.project_type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Session: {formData.academic_session}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{formData.project_title}</h3>
              <p className="text-slate-600 leading-relaxed mt-1">{formData.short_description}</p>
            </div>

            {/* Selected Tech Stack */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Tools &amp; Technology Stack ({totalSelectedTools})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formData.technology_ids.map(id => {
                  const tech = availableTechs.find(t => t.id === id);
                  return tech ? (
                    <span key={`rev-id-${id}`} className="px-2.5 py-1 bg-white text-slate-800 rounded-md border border-slate-200 text-xs font-semibold shadow-2xs">
                      {tech.name}
                    </span>
                  ) : null;
                })}
                {formData.custom_technologies.map(t => (
                  <span key={`rev-cust-${t}`} className="px-2.5 py-1 bg-[#0B1320] text-white rounded-md text-xs font-semibold shadow-2xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Roster Summary */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  Project Contributors ({formData.is_group ? formData.members.length + 1 : 1} Total Students)
                </span>
                <span className="text-[11px] font-mono text-slate-600 font-semibold">
                  {formData.is_group ? 'Group Project' : 'Individual Author'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Project Lead (You)</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Primary Author</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                    Lead
                  </span>
                </div>
                {formData.is_group && formData.members.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.student_name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{m.student_id_number}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold font-mono">
                      {m.member_role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Files Summary */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Attached Files &amp; Links
              </span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>SRS Document:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {srsFile ? `${srsFile.name} (${(srsFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Not attached'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Source Code ZIP:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {codeZipFile ? `${codeZipFile.name} (${(codeZipFile.size / 1024 / 1024).toFixed(2)} MB)` : 'None (Optional)'}
                  </span>
                </div>
                {formData.github_url && (
                  <div className="flex items-center space-x-2">
                    <Github className="w-3.5 h-3.5 text-slate-500" />
                    <span>GitHub:</span>
                    <a href={formData.github_url} target="_blank" rel="noopener noreferrer" className="font-mono text-sky-700 underline truncate">
                      {formData.github_url}
                    </a>
                  </div>
                )}
                {formData.demo_video_url && (
                  <div className="flex items-center space-x-2">
                    <Video className="w-3.5 h-3.5 text-slate-500" />
                    <span>Demo Video:</span>
                    <a href={formData.demo_video_url} target="_blank" rel="noopener noreferrer" className="font-mono text-rose-700 underline truncate">
                      {formData.demo_video_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {loading && (
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Transmitting project record &amp; archives to TUF servers...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0B1320] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(uploadProgress, 10)}%` }}
                />
              </div>
            </div>
          )}

          {/* Step 4 Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleFinalSubmit}
              className="inline-flex items-center space-x-2 px-8 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{loading ? 'Submitting Project...' : 'Confirm & Submit Project'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitProjectPage;
