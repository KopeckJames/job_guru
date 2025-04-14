import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { resumeAPI } from '../../lib/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import SuggestionApplier from '../../components/SuggestionApplier';
import { extractTextFromFile, analyzeResumeText } from '../../lib/fileParser';

export default function UploadResumePage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [improvedResumeText, setImprovedResumeText] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('bg-blue-50', 'border-blue-300');
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Check if file is PDF or Word document
      if (file.type === 'application/pdf' ||
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setUploadedFile(file);
      } else {
        toast.error('Please upload a PDF or Word document');
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Set up progress tracking
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          // Increment by 5% until we reach 90%
          const newProgress = prev < 90 ? Math.min(prev + 5, 90) : prev;
          return newProgress;
        });
      }, 200);

      // Extract text from the file
      const extractedText = await extractTextFromFile(uploadedFile);
      setResumeText(extractedText);

      // Complete the progress
      clearInterval(progressTimer);
      setUploadProgress(100);

      // Move to job description step
      setStep(2);
      toast.success('Resume uploaded successfully! Please add job details.');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error(`Failed to upload resume: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = () => {
    if (!jobDescription) {
      toast.error('Please enter a job description');
      return;
    }

    try {
      setIsUploading(true);

      // Analyze the resume text against the job description
      const resumeAnalysis = analyzeResumeText(resumeText, jobDescription);

      // Set the analysis results
      setAnalysis(resumeAnalysis);
      setStep(3);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(`Failed to analyze resume: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveResume = async (data) => {
    try {
      setIsUploading(true);

      // Use improved text if available, otherwise use original
      const finalResumeText = improvedResumeText || resumeText;

      console.log('Saving resume with data:', {
        title: data.title,
        description: data.description,
        target_job: data.target_job,
        target_company: data.target_company,
        industry: data.industry,
        textLength: finalResumeText.length
      });

      // In a real implementation, this would call the API
      // const response = await resumeAPI.createResume({
      //   title: data.title,
      //   description: data.description,
      //   target_job: data.target_job,
      //   target_company: data.target_company,
      //   industry: data.industry,
      //   content: finalResumeText
      // });

      // Mock successful save
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a mock resume object to store in local storage
      const newResume = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        target_job: data.target_job || '',
        target_company: data.target_company || '',
        industry: data.industry || '',
        content: finalResumeText,
        created_at: new Date().toISOString(),
        ats_score: analysis.ats_score
      };

      // Get existing resumes from local storage or initialize empty array
      const existingResumes = JSON.parse(localStorage.getItem('resumes') || '[]');

      // Add new resume to the array
      existingResumes.push(newResume);

      // Save updated resumes array to local storage
      localStorage.setItem('resumes', JSON.stringify(existingResumes));

      toast.success('Resume saved successfully!');
      router.push('/resumes');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle applying suggestions to improve resume
  const handleApplySuggestions = (improvedText) => {
    setImprovedResumeText(improvedText);
    toast.success('Improvements applied! Your resume has been updated.');
  };

  return (
    <Layout>
      <Head>
        <title>Upload Resume | Job Guru</title>
        <meta name="description" content="Upload and analyze your existing resume" />
      </Head>

      <div className="mb-8">
        <Link href="/resumes" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Resumes
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Upload Resume</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span className="text-sm mt-2">Upload Resume</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span className="text-sm mt-2">Job Details</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span className="text-sm mt-2">Analysis</span>
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Your Resume</h2>

          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Upload your existing resume to analyze it and optimize it for job applications.
              We support PDF and Word documents.
            </p>

            <div
              ref={dropAreaRef}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />

              {uploadedFile ? (
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-800 mb-2">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your resume file here, or click to browse
                  </p>
                  <label
                    htmlFor="resume-file"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  >
                    Browse Files
                  </label>
                </div>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!uploadedFile || isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Upload & Analyze'
              )}
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Enter Job Details</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="job-title"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Software Engineer"
                {...register('target_job')}
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company (Optional)
              </label>
              <input
                id="company"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Google, Amazon"
                {...register('target_company')}
              />
            </div>

            <div>
              <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                id="job-description"
                rows="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                Adding a detailed job description helps us analyze your resume against the specific requirements.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isUploading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Analysis */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Resume Analysis</h2>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">ATS Score</h3>
                  <div className="flex items-center">
                    <span className={`text-lg font-bold ${
                      analysis.ats_score >= 80 ? 'text-green-600' :
                      analysis.ats_score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {analysis.ats_score}/100
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      analysis.ats_score >= 80 ? 'bg-green-600' :
                      analysis.ats_score >= 60 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${analysis.ats_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-gray-600">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Keyword Analysis</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(analysis.keyword_match).map(([keyword, score]) => (
                      <div key={keyword} className="flex flex-col">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{keyword}</span>
                          <span className={score >= 0.8 ? 'text-green-600' : score >= 0.5 ? 'text-yellow-600' : 'text-red-600'}>
                            {Math.round(score * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              score >= 0.8 ? 'bg-green-600' : score >= 0.5 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-3">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.map((keyword) => (
                    <span key={keyword} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resume Details Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Resume Details</h2>

              <form onSubmit={handleSubmit(handleSaveResume)} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Resume Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer Resume"
                    defaultValue={`${analysis.parsed_sections.contact.name}'s Resume`}
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A brief description of this resume..."
                    defaultValue={`Uploaded on ${new Date().toLocaleDateString()}`}
                    {...register('description')}
                  />
                </div>

                <div>
                  <label htmlFor="target_job" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Job Title
                  </label>
                  <input
                    id="target_job"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                    {...register('target_job')}
                  />
                </div>

                <div>
                  <label htmlFor="target_company" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Company (Optional)
                  </label>
                  <input
                    id="target_company"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Google, Amazon"
                    {...register('target_company')}
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    id="industry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('industry')}
                  >
                    <option value="">Select an industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  >
                    {isUploading ? 'Saving...' : improvedResumeText ? 'Save Improved Resume' : 'Save Resume'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Suggestions to improve ATS score */}
          <div className="lg:col-span-3">
            <SuggestionApplier
              suggestions={analysis.suggestions}
              originalText={analysis.original_text}
              analysis={analysis}
              onApplySuggestions={handleApplySuggestions}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
