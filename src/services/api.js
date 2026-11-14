import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token and handle multipart headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tuf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData, delete manual Content-Type header so the browser / Axios automatically
  // appends the multipart boundary string: multipart/form-data; boundary=...
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle global 401s (expired session)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check if not on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('tuf_token');
        localStorage.removeItem('tuf_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ----------------- AUTH API -----------------
export const loginUser = (data) => api.post('/login', data);
export const registerStudent = (data) => api.post('/register/student', data);
export const loginStudent = (data) => api.post('/login/student', data);
export const loginTeacher = (data) => api.post('/login/teacher', data);
export const getCurrentUser = () => api.get('/user');
export const logoutUser = () => api.post('/logout');

// ----------------- METADATA API -----------------
export const getDepartments = () => api.get('/departments');
export const getCategories = () => api.get('/categories');
export const getTechnologies = () => api.get('/technologies');

// ----------------- STUDENT API -----------------
export const getStudentDashboard = () => api.get('/student/dashboard');
export const getStudentProfile = () => api.get('/student/profile');
export const updateStudentProfile = (data) => api.put('/student/profile', data);
export const getStudentProjects = () => api.get('/student/projects');
export const getMySingleProject = () => api.get('/student/my-project');
export const createStudentProject = (data) => api.post('/student/projects', data);
export const getStudentProjectDetail = (id) => api.get(`/student/projects/${id}`);
export const updateStudentProject = (id, data) => api.put(`/student/projects/${id}`, data);

export const uploadSrsDocument = (id, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/student/projects/${id}/upload-srs`, formData, {
    onUploadProgress
  });
};

export const uploadSourceCode = (id, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/student/projects/${id}/upload-code`, formData, {
    onUploadProgress
  });
};

export const uploadTitleImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/files/upload-title-image', formData);
};

export const getProjectFeedback = (id) => api.get(`/student/projects/${id}/feedback`);
export const getProjectGrade = (id) => api.get(`/student/projects/${id}/grade`);

// ----------------- TEACHER API -----------------
export const getTeacherDashboard = () => api.get('/teacher/dashboard');
export const getTeacherSubmissions = (params) => api.get('/teacher/submissions', { params });
export const getTeacherSubmissionDetail = (id) => api.get(`/teacher/submissions/${id}`);
export const decideProjectTitle = (id, data) => api.post(`/teacher/projects/${id}/title-decision`, data);
export const updateProjectReviewStatus = (id, data) => api.post(`/teacher/projects/${id}/review-status`, data);
export const getEvaluationCriteria = () => api.get('/teacher/evaluation-criteria');
export const evaluateProject = (id, data) => api.post(`/teacher/projects/${id}/evaluate`, data);
export const getRegisteredStudents = (params) => api.get('/teacher/students', { params });

// ----------------- SHOWCASE API -----------------
export const getShowcaseProjects = (params) => api.get('/showcase/projects', { params });
export const getShowcaseProjectDetail = (id) => api.get(`/showcase/projects/${id}`);

// ----------------- NOTIFICATIONS API -----------------
export const getNotifications = () => api.get('/notifications');
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post('/notifications/read-all');

// ----------------- FILE DOWNLOAD -----------------
export const downloadProjectFile = async (fileId, defaultFilename = 'download') => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: 'blob'
  });
  
  // Extract filename from Content-Disposition if present
  let filename = defaultFilename;
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.indexOf('filename=') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
