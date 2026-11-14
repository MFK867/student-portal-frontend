import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  Layers,
  ArrowRight,
  FileText,
  Download,
  Github,
  Calendar,
  User,
  GraduationCap,
  ExternalLink,
  Code2,
  CheckCircle2,
  BookOpen,
  Hash,
  X,
  RotateCcw
} from 'lucide-react';
import { getShowcaseProjects, getCategories, getDepartments } from '../../services/api';

export const ExploreProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [projectType, setProjectType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryId) params.category_id = categoryId;
      if (departmentId) params.department_id = departmentId;
      if (projectType) params.project_type = projectType;
      if (sortBy) params.sort_by = sortBy;

      const res = await getShowcaseProjects(params);
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load showcase projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([getCategories(), getDepartments()]);
        setCategories(catRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [categoryId, departmentId, projectType, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const handleClear = () => {
    setSearch('');
    setCategoryId('');
    setDepartmentId('');
    setProjectType('');
    setSortBy('newest');
    setTimeout(loadProjects, 50);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const hasActiveFilters = Boolean(search || categoryId || departmentId || projectType || sortBy !== 'newest');

  return (
    <div className="space-y-6 animate-in fade-in duration-150 min-w-0">
      {/* Dense Academic Header & Quick Tabs */}
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-slate-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Official Student Project Directory</span>
              <span>&bull;</span>
              <span>TUF Academic Registry</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
              University Student Projects &amp; Capstones
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore semester projects, final-year capstones, and innovative software engineering implementations submitted across academic departments.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs flex-shrink-0">
            <div className="bg-[#1E293B] px-3.5 py-2 rounded-lg text-slate-200 border border-slate-700/60">
              <span className="text-[10px] uppercase font-mono block text-slate-400">Catalogued Submissions</span>
              <span className="text-sm font-bold font-mono text-white">{projects.length}</span>
            </div>
          </div>
        </div>

        {/* Micro-Underlined Department Filter Tabs with smooth scroll */}
        <div className="mt-5 pt-3 border-t border-slate-800 relative">
          <div className="flex items-center space-x-3 overflow-x-auto text-xs py-1 scrollbar-none no-scrollbar">
            <button
              onClick={() => setDepartmentId('')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all text-xs flex-shrink-0 ${
                departmentId === ''
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setDepartmentId(dept.id.toString())}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs flex-shrink-0 ${
                  departmentId === dept.id.toString()
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Projects List + Aligned Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
        {/* Main Column: Project Directory List */}
        <div className="lg:col-span-8 min-w-0 space-y-4">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              Retrieving student project records...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-16 bg-white rounded-2xl text-center space-y-3 border border-slate-200/80">
              <Compass className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Student Projects Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No submissions match the selected criteria. Modify your search query or reset active filters.
              </p>
              <button
                onClick={handleClear}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0A2540] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          ) : (
            projects.map((p) => {
              const imgUrl = getImageUrl(p.title_image_url);

              return (
                <article
                  key={p.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:border-slate-300 transition-all group flex flex-col md:flex-row gap-5 min-w-0"
                >
                  {/* Title Image Block */}
                  <div className="w-full md:w-48 lg:w-52 flex-shrink-0 bg-[#0B1320] rounded-xl overflow-hidden relative aspect-[16/10] md:aspect-auto min-h-[140px] flex items-center justify-center">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.project_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}

                    <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-300 bg-gradient-to-br from-[#0B1320] to-[#1E293B] ${imgUrl ? 'hidden' : ''}`}>
                      <GraduationCap className="w-6 h-6 text-slate-400 mb-1.5" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                        {p.category_name || 'TUF Capstone'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Academic Registry
                      </span>
                    </div>

                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/75 text-white backdrop-blur-sm">
                      {p.submission_code}
                    </span>
                  </div>

                  {/* Details Block */}
                  <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                    <div className="space-y-2 min-w-0">
                      {/* Department & Project Type Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {p.department_name}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-600 font-medium">{p.project_type}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500 font-mono">Session {p.academic_session}</span>
                      </div>

                      {/* Project Title */}
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0A2540] transition-colors leading-snug break-words">
                        <Link to={`/showcase/${p.id}`}>{p.project_title}</Link>
                      </h2>

                      {/* Student Author & Roll Number (Year-First Format) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs py-1">
                        <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-slate-800 border border-slate-200/60">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Student:</span>
                          <span className="font-bold text-slate-900">{p.student_name}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-mono text-[11px] border border-slate-200">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Roll No:</span>
                          <span className="font-bold text-slate-900">{p.student_roll_number || '2023-BS-AI-025'}</span>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.short_description}
                      </p>
                    </div>

                    {/* Footer: Tech tags and Action */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1">
                        {p.technologies?.slice(0, 4).map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded"
                          >
                            {t.name}
                          </span>
                        ))}
                        {p.technologies?.length > 4 && (
                          <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                            +{p.technologies.length - 4}
                          </span>
                        )}
                      </div>

                      {/* CTA Links */}
                      <div className="flex items-center space-x-3 text-xs">
                        {p.github_url && (
                          <a
                            href={p.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                            title="GitHub Repository"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          to={`/showcase/${p.id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <span>Explore Project</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Filter Sidebar (Fully Aligned, min-w-0, Never Cut Off) */}
        <div className="lg:col-span-4 min-w-0 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 w-full box-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Search &amp; Filters
                </span>
                <h3 className="text-sm font-bold text-slate-900">Project Directory</h3>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Keyword, title, student, roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors font-mono"
              >
                Apply Search
              </button>
            </form>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-200">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Academic Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1320]"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id.toString()}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Domain Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B1320]"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Classification</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs text-slate-800"
                >
                  <option value="">All Classifications</option>
                  <option value="Semester Project">Semester Project</option>
                  <option value="Final Year Project">Final Year Project</option>
                  <option value="Research Project">Research Project</option>
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sequence Order</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs text-slate-800"
                >
                  <option value="newest">Recently Submitted</option>
                  <option value="oldest">Earliest First</option>
                  <option value="alpha">Alphabetical Order</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Notice Block */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              University Policy Notice
            </span>
            <h4 className="font-bold text-slate-900 text-xs">Academic Integrity &amp; Showcase</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Showcase projects represent student submissions catalogued for academic review and peer exploration. Internal marks, grading rubrics, and faculty evaluations are strictly restricted to authorized evaluators and the respective project authors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreProjectsPage;
