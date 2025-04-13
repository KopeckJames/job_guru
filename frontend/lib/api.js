import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/token', new URLSearchParams(credentials)),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
};

// Interview API
export const interviewAPI = {
  createInterview: (interviewData) => api.post('/interviews', interviewData),
  getInterviews: () => api.get('/interviews'),
  getInterview: (id) => api.get(`/interviews/${id}`),
  createSession: (interviewId, sessionData) => api.post(`/interviews/${interviewId}/sessions`, sessionData),
  getSessions: (interviewId) => api.get(`/interviews/${interviewId}/sessions`),
  submitFeedback: (interviewId, sessionId) => api.post(`/interviews/${interviewId}/sessions/${sessionId}/feedback`),
};

// Resume API
export const resumeAPI = {
  createResume: (resumeData) => api.post('/resumes', resumeData),
  getResumes: () => api.get('/resumes'),
  getResume: (id) => api.get(`/resumes/${id}`),
  createVersion: (resumeId, versionData) => api.post(`/resumes/${resumeId}/versions`, versionData),
  getVersions: (resumeId) => api.get(`/resumes/${resumeId}/versions`),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  generateResume: (resumeId, jobDescription) => api.post(`/resumes/${resumeId}/generate`, { job_description: jobDescription }),
  generateFromScratch: (data) => api.post('/resumes/generate-from-scratch', data),
};

// Question API
export const questionAPI = {
  createCategory: (categoryData) => api.post('/questions/categories', categoryData),
  getCategories: (includeGlobal = true) => api.get(`/questions/categories?include_global=${includeGlobal}`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  getQuestions: (params) => api.get('/questions', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  generateAnswer: (questionId, answerData) => api.post(`/questions/${questionId}/answer`, answerData),
};

// Job Application API
export const jobAPI = {
  searchJobs: (searchQuery) => api.post('/applications/search', searchQuery),
  saveJobPosting: (postingData) => api.post('/applications/postings', postingData),
  getJobPostings: () => api.get('/applications/postings'),
  applyToJob: (applicationData) => api.post('/applications/apply', applicationData),
  getApplications: (status) => api.get('/applications/applications', { params: { status } }),
  updateApplicationStatus: (applicationId, status) => api.put(`/applications/applications/${applicationId}/status`, { status }),
};

export default api;
