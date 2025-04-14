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
    // For demo purposes, we'll just log the error and return a mock response
    // instead of logging the user out
    console.error('API Error:', error?.response?.status, error?.response?.data || error.message);

    // Check if we have a response object
    if (!error.response) {
      // Network error or server not available
      console.log('Network error or server not available');
      return Promise.resolve({ data: [] }); // Return empty data
    }

    // Handle different error status codes
    switch (error.response.status) {
      case 401: // Unauthorized
        console.log('Authentication error - using mock data instead');
        // Don't log out in demo mode
        return Promise.resolve({ data: [] }); // Return empty data

      case 404: // Not found
        console.log('Resource not found - using mock data instead');
        return Promise.resolve({ data: [] }); // Return empty data

      default:
        console.log('Other API error - using mock data instead');
        return Promise.resolve({ data: [] }); // Return empty data
    }
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

  // Deep Research for Interview Questions
  researchQuestions: async (jobTitle, jobDescription) => {
    // In a real implementation, this would call an API endpoint
    // that uses OpenAI or similar service to research questions
    // return api.post('/interviews/research', { jobTitle, jobDescription });

    // For now, simulate an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate questions based on job title and description
    return {
      data: generateInterviewQuestions(jobTitle, jobDescription)
    };
  }
};

/**
 * Generate interview questions based on job title and description
 * @param {string} jobTitle - The job title
 * @param {string} jobDescription - The job description
 * @returns {Object} - Generated questions by category
 */
function generateInterviewQuestions(jobTitle, jobDescription) {
  // Extract key skills and requirements from job description
  const skills = extractSkillsFromJobDescription(jobDescription);
  const requirements = extractRequirementsFromJobDescription(jobDescription);

  // Determine job category
  const category = determineJobCategory(jobTitle, jobDescription);

  // Generate questions based on job category, skills, and requirements
  return {
    technical: generateTechnicalQuestions(category, skills, requirements),
    behavioral: generateBehavioralQuestions(category, skills, requirements),
    situational: generateSituationalQuestions(category, skills, requirements),
    company: generateCompanyQuestions(jobDescription),
    role_specific: generateRoleSpecificQuestions(jobTitle, requirements)
  };
}

/**
 * Extract skills from job description
 * @param {string} jobDescription - The job description
 * @returns {Array<string>} - Extracted skills
 */
function extractSkillsFromJobDescription(jobDescription) {
  if (!jobDescription) return [];

  // Common technical skills to look for
  const technicalSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
    'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'oracle', 'nosql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
    'agile', 'scrum', 'kanban', 'waterfall', 'tdd', 'ci/cd',
    'machine learning', 'ai', 'data science', 'data analysis', 'big data',
    'rest api', 'graphql', 'microservices', 'serverless'
  ];

  // Soft skills to look for
  const softSkills = [
    'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'time management', 'adaptability', 'creativity', 'collaboration', 'organization',
    'project management', 'attention to detail', 'analytical', 'interpersonal',
    'presentation', 'negotiation', 'conflict resolution', 'decision making'
  ];

  const allSkills = [...technicalSkills, ...softSkills];
  const foundSkills = [];
  const lowerDesc = jobDescription.toLowerCase();

  // Look for skills in the text
  for (const skill of allSkills) {
    if (lowerDesc.includes(skill)) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
}

/**
 * Extract requirements from job description
 * @param {string} jobDescription - The job description
 * @returns {Array<string>} - Extracted requirements
 */
function extractRequirementsFromJobDescription(jobDescription) {
  if (!jobDescription) return [];

  // Look for requirements section
  const sections = jobDescription.split(/requirements|qualifications|what you need|what we are looking for/i);

  if (sections.length > 1) {
    // Extract bullet points or sentences from the requirements section
    const requirementsSection = sections[1].split(/responsibilities|about the role|what you do/i)[0];
    const bulletPoints = requirementsSection.split(/[•\-*]|\d+\./);

    // Clean up and return requirements
    return bulletPoints
      .map(point => point.trim())
      .filter(point => point.length > 10 && point.length < 200)
      .slice(0, 8); // Limit to 8 requirements
  }

  return [];
}

/**
 * Determine job category based on title and description
 * @param {string} jobTitle - The job title
 * @param {string} jobDescription - The job description
 * @returns {string} - Job category
 */
function determineJobCategory(jobTitle, jobDescription) {
  const title = jobTitle.toLowerCase();
  const desc = jobDescription.toLowerCase();

  // Check for software/engineering roles
  if (title.includes('software') || title.includes('developer') || title.includes('engineer') ||
      desc.includes('coding') || desc.includes('programming') || desc.includes('software development')) {
    return 'software_engineering';
  }

  // Check for data science roles
  if (title.includes('data sci') || title.includes('machine learning') || title.includes('ai') ||
      desc.includes('data science') || desc.includes('machine learning') || desc.includes('statistical')) {
    return 'data_science';
  }

  // Check for product management
  if (title.includes('product manager') || title.includes('product owner') ||
      desc.includes('product management') || desc.includes('product strategy')) {
    return 'product_management';
  }

  // Check for design roles
  if (title.includes('designer') || title.includes('ux') || title.includes('ui') ||
      desc.includes('user experience') || desc.includes('user interface') || desc.includes('design thinking')) {
    return 'design';
  }

  // Check for marketing roles
  if (title.includes('market') || title.includes('growth') || title.includes('seo') ||
      desc.includes('marketing') || desc.includes('customer acquisition') || desc.includes('brand')) {
    return 'marketing';
  }

  // Check for sales roles
  if (title.includes('sales') || title.includes('business development') || title.includes('account executive') ||
      desc.includes('sales') || desc.includes('revenue') || desc.includes('quota')) {
    return 'sales';
  }

  // Default to general
  return 'general';
}

/**
 * Generate technical questions based on job category and skills
 * @param {string} category - Job category
 * @param {Array<string>} skills - Extracted skills
 * @param {Array<string>} requirements - Job requirements
 * @returns {Array<Object>} - Technical questions
 */
function generateTechnicalQuestions(category, skills, requirements) {
  const questions = [];

  // Add category-specific questions
  switch (category) {
    case 'software_engineering':
      questions.push(
        { question: 'Can you explain the difference between REST and GraphQL?', difficulty: 'medium' },
        { question: 'What are the principles of object-oriented programming?', difficulty: 'medium' },
        { question: 'How do you approach debugging a complex issue in production?', difficulty: 'hard' },
        { question: 'Explain the concept of microservices architecture and its benefits.', difficulty: 'medium' }
      );
      break;

    case 'data_science':
      questions.push(
        { question: 'What is the difference between supervised and unsupervised learning?', difficulty: 'medium' },
        { question: 'How do you handle imbalanced datasets?', difficulty: 'hard' },
        { question: 'Explain the bias-variance tradeoff.', difficulty: 'hard' },
        { question: 'What evaluation metrics would you use for a classification problem?', difficulty: 'medium' }
      );
      break;

    case 'product_management':
      questions.push(
        { question: 'How do you prioritize features in a product roadmap?', difficulty: 'medium' },
        { question: 'Explain how you would validate a new product idea.', difficulty: 'medium' },
        { question: 'How do you balance stakeholder requests with user needs?', difficulty: 'hard' },
        { question: 'What metrics would you use to measure the success of a product?', difficulty: 'medium' }
      );
      break;

    case 'design':
      questions.push(
        { question: 'What is your design process from concept to implementation?', difficulty: 'medium' },
        { question: 'How do you incorporate user feedback into your designs?', difficulty: 'medium' },
        { question: 'Explain the difference between UX and UI design.', difficulty: 'easy' },
        { question: 'How do you ensure your designs are accessible?', difficulty: 'medium' }
      );
      break;

    case 'marketing':
      questions.push(
        { question: 'How do you measure the success of a marketing campaign?', difficulty: 'medium' },
        { question: 'What strategies would you use to increase customer engagement?', difficulty: 'medium' },
        { question: 'How do you stay updated with the latest marketing trends?', difficulty: 'easy' },
        { question: 'Explain your approach to content marketing.', difficulty: 'medium' }
      );
      break;

    case 'sales':
      questions.push(
        { question: 'How do you approach a new prospect?', difficulty: 'medium' },
        { question: 'What strategies do you use to overcome objections?', difficulty: 'medium' },
        { question: 'How do you prioritize your sales pipeline?', difficulty: 'medium' },
        { question: 'Describe your process for qualifying leads.', difficulty: 'medium' }
      );
      break;

    default:
      questions.push(
        { question: 'What are your greatest professional strengths?', difficulty: 'easy' },
        { question: 'How do you stay organized when managing multiple tasks?', difficulty: 'medium' },
        { question: 'Describe a challenging project you worked on.', difficulty: 'medium' },
        { question: 'How do you approach learning new skills?', difficulty: 'easy' }
      );
  }

  // Add skill-specific questions
  for (const skill of skills.slice(0, 3)) { // Limit to top 3 skills
    switch (skill) {
      case 'javascript':
        questions.push({
          question: 'Can you explain closures in JavaScript and provide an example?',
          difficulty: 'hard',
          skill: 'javascript'
        });
        break;
      case 'python':
        questions.push({
          question: 'What are Python generators and how do they differ from lists?',
          difficulty: 'medium',
          skill: 'python'
        });
        break;
      case 'react':
        questions.push({
          question: 'Explain the virtual DOM in React and why it is important.',
          difficulty: 'medium',
          skill: 'react'
        });
        break;
      case 'sql':
        questions.push({
          question: 'How would you optimize a slow SQL query?',
          difficulty: 'hard',
          skill: 'sql'
        });
        break;
      case 'aws':
        questions.push({
          question: 'What AWS services would you use for a highly available web application?',
          difficulty: 'medium',
          skill: 'aws'
        });
        break;
      case 'machine learning':
        questions.push({
          question: 'How would you handle overfitting in a machine learning model?',
          difficulty: 'hard',
          skill: 'machine learning'
        });
        break;
      case 'leadership':
        questions.push({
          question: 'How do you motivate team members during challenging projects?',
          difficulty: 'medium',
          skill: 'leadership'
        });
        break;
      case 'communication':
        questions.push({
          question: 'How do you ensure effective communication in a remote team?',
          difficulty: 'medium',
          skill: 'communication'
        });
        break;
      default:
        questions.push({
          question: `How have you applied ${skill} in your previous roles?`,
          difficulty: 'medium',
          skill: skill
        });
    }
  }

  return questions;
}

/**
 * Generate behavioral questions based on job category and skills
 * @param {string} category - Job category
 * @param {Array<string>} skills - Extracted skills
 * @param {Array<string>} requirements - Job requirements
 * @returns {Array<Object>} - Behavioral questions
 */
function generateBehavioralQuestions(category, skills, requirements) {
  // Common behavioral questions
  const commonQuestions = [
    { question: 'Tell me about a time when you had to deal with a difficult team member.', difficulty: 'medium' },
    { question: 'Describe a situation where you had to meet a tight deadline.', difficulty: 'medium' },
    { question: 'Give an example of a time when you showed initiative.', difficulty: 'medium' },
    { question: 'Tell me about a time when you failed and what you learned from it.', difficulty: 'hard' },
    { question: 'Describe a situation where you had to adapt to a significant change.', difficulty: 'medium' }
  ];

  // Add category-specific behavioral questions
  const categoryQuestions = [];

  switch (category) {
    case 'software_engineering':
      categoryQuestions.push(
        { question: 'Tell me about a time when you had to refactor a complex piece of code.', difficulty: 'hard' },
        { question: 'Describe a situation where you had to balance code quality with tight deadlines.', difficulty: 'hard' }
      );
      break;

    case 'data_science':
      categoryQuestions.push(
        { question: 'Tell me about a time when your data analysis led to an important business decision.', difficulty: 'hard' },
        { question: 'Describe a situation where you had to explain complex data findings to non-technical stakeholders.', difficulty: 'medium' }
      );
      break;

    case 'product_management':
      categoryQuestions.push(
        { question: 'Tell me about a time when you had to make a difficult product decision with limited data.', difficulty: 'hard' },
        { question: 'Describe a situation where you had to balance competing priorities from different stakeholders.', difficulty: 'hard' }
      );
      break;

    case 'design':
      categoryQuestions.push(
        { question: 'Tell me about a time when you received critical feedback on your design and how you handled it.', difficulty: 'medium' },
        { question: 'Describe a situation where you had to defend your design decisions to stakeholders.', difficulty: 'hard' }
      );
      break;

    case 'marketing':
      categoryQuestions.push(
        { question: 'Tell me about a marketing campaign that did not perform as expected and what you learned.', difficulty: 'medium' },
        { question: 'Describe a situation where you had to pivot your marketing strategy quickly.', difficulty: 'hard' }
      );
      break;

    case 'sales':
      categoryQuestions.push(
        { question: 'Tell me about a time when you lost a major sale and how you handled it.', difficulty: 'hard' },
        { question: 'Describe a situation where you had to rebuild a damaged client relationship.', difficulty: 'hard' }
      );
      break;
  }

  // Add skill-specific behavioral questions
  const skillQuestions = [];

  for (const skill of skills.slice(0, 2)) { // Limit to top 2 skills
    if (skill === 'teamwork') {
      skillQuestions.push({
        question: 'Tell me about a successful team project and your contribution to it.',
        difficulty: 'medium',
        skill: 'teamwork'
      });
    } else if (skill === 'problem solving') {
      skillQuestions.push({
        question: 'Describe a complex problem you solved and your approach to solving it.',
        difficulty: 'hard',
        skill: 'problem solving'
      });
    } else if (skill === 'leadership') {
      skillQuestions.push({
        question: 'Tell me about a time when you had to lead a team through a difficult situation.',
        difficulty: 'hard',
        skill: 'leadership'
      });
    } else {
      skillQuestions.push({
        question: `Give me an example of how you have demonstrated ${skill} in your previous roles.`,
        difficulty: 'medium',
        skill: skill
      });
    }
  }

  // Combine and return questions
  return [...commonQuestions.slice(0, 3), ...categoryQuestions, ...skillQuestions];
}

/**
 * Generate situational questions based on job category and skills
 * @param {string} category - Job category
 * @param {Array<string>} skills - Extracted skills
 * @param {Array<string>} requirements - Job requirements
 * @returns {Array<Object>} - Situational questions
 */
function generateSituationalQuestions(category, skills, requirements) {
  // Common situational questions
  const commonQuestions = [
    { question: 'How would you handle a situation where you disagree with your manager\'s decision?', difficulty: 'hard' },
    { question: 'What would you do if you were assigned a task but were not given clear instructions?', difficulty: 'medium' },
    { question: 'How would you prioritize multiple urgent tasks with the same deadline?', difficulty: 'medium' },
    { question: 'What would you do if you noticed a colleague was struggling with their workload?', difficulty: 'medium' }
  ];

  // Add category-specific situational questions
  const categoryQuestions = [];

  switch (category) {
    case 'software_engineering':
      categoryQuestions.push(
        { question: 'How would you handle a critical bug discovered in production right before a major release?', difficulty: 'hard' },
        { question: 'What would you do if you were asked to implement a feature that you believe has security flaws?', difficulty: 'hard' }
      );
      break;

    case 'data_science':
      categoryQuestions.push(
        { question: 'How would you approach a situation where the available data does not seem sufficient for the analysis requested?', difficulty: 'hard' },
        { question: 'What would you do if your analysis contradicts a widely held belief in the company?', difficulty: 'hard' }
      );
      break;

    case 'product_management':
      categoryQuestions.push(
        { question: 'How would you handle a situation where a key feature needs to be cut from the release due to time constraints?', difficulty: 'hard' },
        { question: 'What would you do if user feedback contradicts the product direction set by executives?', difficulty: 'hard' }
      );
      break;

    case 'design':
      categoryQuestions.push(
        { question: 'How would you handle a situation where user testing reveals major issues with your design just before launch?', difficulty: 'hard' },
        { question: 'What would you do if you were asked to design something that goes against UX best practices?', difficulty: 'medium' }
      );
      break;

    case 'marketing':
      categoryQuestions.push(
        { question: 'How would you handle a situation where a marketing campaign receives negative public feedback?', difficulty: 'hard' },
        { question: 'What would you do if your marketing budget was suddenly cut in half?', difficulty: 'medium' }
      );
      break;

    case 'sales':
      categoryQuestions.push(
        { question: 'How would you handle a situation where a competitor offers a lower price to your prospect?', difficulty: 'medium' },
        { question: 'What would you do if you discovered a client had unrealistic expectations about your product?', difficulty: 'medium' }
      );
      break;
  }

  // Combine and return questions
  return [...commonQuestions.slice(0, 2), ...categoryQuestions];
}

/**
 * Generate company-specific questions based on job description
 * @param {string} jobDescription - The job description
 * @returns {Array<Object>} - Company questions
 */
function generateCompanyQuestions(jobDescription) {
  // Standard company questions
  const standardQuestions = [
    { question: 'What interests you about our company?', difficulty: 'easy' },
    { question: 'How do you see yourself contributing to our company culture?', difficulty: 'medium' },
    { question: 'What do you know about our products/services?', difficulty: 'medium' },
    { question: 'Why do you want to work for our company specifically?', difficulty: 'medium' }
  ];

  // Try to extract company values or mission from job description
  const valueMatches = jobDescription.match(/(?:our values|we value|our mission|we believe)\s+(?:include|are|is)?\s+([^.]+)/i);

  if (valueMatches && valueMatches[1]) {
    const values = valueMatches[1].trim();
    standardQuestions.push({
      question: `Our company values include ${values}. How do these align with your personal values?`,
      difficulty: 'medium',
      type: 'values'
    });
  }

  return standardQuestions;
}

/**
 * Generate role-specific questions based on job title and requirements
 * @param {string} jobTitle - The job title
 * @param {Array<string>} requirements - Job requirements
 * @returns {Array<Object>} - Role-specific questions
 */
function generateRoleSpecificQuestions(jobTitle, requirements) {
  const questions = [
    { question: `What makes you a good fit for the ${jobTitle} role?`, difficulty: 'medium' },
    { question: `What do you think are the most important skills for a ${jobTitle}?`, difficulty: 'medium' },
    { question: `Where do you see the biggest challenges in this ${jobTitle} role?`, difficulty: 'medium' }
  ];

  // Add questions based on specific requirements
  for (const req of requirements.slice(0, 2)) { // Limit to 2 requirements
    const shortReq = req.length > 50 ? req.substring(0, 50) + '...' : req;
    questions.push({
      question: `The job requires ${shortReq}. Can you tell me about your experience with this?`,
      difficulty: 'medium',
      requirement: req
    });
  }

  return questions;
}

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
