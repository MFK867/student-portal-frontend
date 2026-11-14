import React, { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, Shield, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile, updateStudentProfile } from '../../services/api';

export const StudentProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    degree_program: '',
    semester: 1,
    section: ''
  });

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getStudentProfile();
        setProfileData(res.data);
        setFormData({
          name: user?.name || '',
          degree_program: res.data.degree_program || '',
          semester: res.data.semester || 1,
          section: res.data.section || 'A'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await updateStudentProfile({
        name: formData.name,
        degree_program: formData.degree_program,
        semester: parseInt(formData.semester, 10),
        section: formData.section
      });
      setProfileData(res.data);
      updateUserProfile({
        ...user,
        name: formData.name,
        student_profile: {
          ...user.student_profile,
          ...res.data
        }
      });
      setSuccess('Student profile information updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading student profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="bg-[#0B1320] text-white rounded-2xl p-6 sm:p-8">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
          Academic Identity
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Student Profile</h1>
        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
          Manage your student credentials and academic enrollment status.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1320] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-mono">{profileData?.student_id}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profileData?.department_name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Read-Only Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Student ID (Locked)
              </span>
              <p className="font-mono font-bold text-slate-800 mt-1">{profileData?.student_id}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Assigned upon verification</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                University Email Address (Locked)
              </span>
              <p className="font-semibold text-slate-800 mt-1 font-mono">{user?.email}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Official @tuf.edu.pk mailbox</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Academic Department
              </span>
              <p className="font-semibold text-slate-800 mt-1">{profileData?.department_name} ({profileData?.department_code})</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Account Status
              </span>
              <p className="font-semibold text-emerald-700 mt-1 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Active &bull; Verified</span>
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Editable Profile Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Degree Program
              </label>
              <input
                type="text"
                required
                value={formData.degree_program}
                onChange={(e) => setFormData({ ...formData, degree_program: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Section
                </label>
                <input
                  type="text"
                  required
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#0B1320]/20 uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#0B1320] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;