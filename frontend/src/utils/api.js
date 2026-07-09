const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper to fetch with auth token and error handling
 */
async function request(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured. Set it in your Vercel environment variables.');
  }

  const token = localStorage.getItem('token');
  const headers = options.headers || {};
  
  if (token && !options.isMultipart) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...(!options.isMultipart ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    }
  };

  // Remove helper flag so it doesn't get sent to fetch
  delete config.isMultipart;

  const url = `${API_URL}${endpoint}`;
  console.log(`[API Request] Calling ${url}`, config.method || 'GET');

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (name, email, password, target_role) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, target_role })
    }),

  login: (email, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (profileData) => 
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  // Orchestrator Evaluation
  evaluateFull: (formData) => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return request('/orchestrator/evaluate', {
      method: 'POST',
      headers,
      body: formData,
      isMultipart: true
    });
  },

  // Independent Agent Runs
  reviewResume: (formData) => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return request('/agents/resume-review', {
      method: 'POST',
      headers,
      body: formData,
      isMultipart: true
    });
  },

  getMockInterviewQuestion: (targetRole) => 
    request(`/agents/mock-interview/question?targetRole=${encodeURIComponent(targetRole)}`),

  evaluateMockInterview: (question, answer) => 
    request('/agents/mock-interview', {
      method: 'POST',
      body: JSON.stringify({ question, answer })
    }),

  analyzeSkillGap: (targetRole, currentSkills) => 
    request('/agents/skill-gap', {
      method: 'POST',
      body: JSON.stringify({ targetRole, currentSkills })
    }),

  getCodingProblems: () => request('/agents/coding-eval/problems'),

  evaluateCoding: (problemTitle, codeSubmitted) => 
    request('/agents/coding-eval', {
      method: 'POST',
      body: JSON.stringify({ problemTitle, codeSubmitted })
    }),

  evaluateCommunication: (responseText) => 
    request('/agents/communication', {
      method: 'POST',
      body: JSON.stringify({ responseText })
    }),

  // Student Reports
  getStudentReport: (studentId) => request(`/student/${studentId}/report`),
  getStudentHistory: (studentId) => request(`/student/${studentId}/history`),

  // Admin Portal
  getAdminScores: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ).toString();
    return request(`/admin/student-scores?${query}`);
  }
};
