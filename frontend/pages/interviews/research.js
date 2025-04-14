import { useState } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { interviewAPI } from '../../lib/api';

export default function InterviewResearchPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Call the research API
      const response = await interviewAPI.researchQuestions(data.jobTitle, data.jobDescription);
      
      // Set the questions
      setQuestions(response.data);
      
      toast.success('Interview questions researched successfully!');
    } catch (error) {
      console.error('Error researching interview questions:', error);
      toast.error('Failed to research interview questions');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Research Interview Questions | Job Guru</title>
        <meta name="description" content="Research interview questions for your job application" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Research Interview Questions</h1>
        
        <p className="text-gray-600 mb-8">
          Enter the job title and description to get tailored interview questions that will help you prepare for your interview.
          Our AI-powered deep research will analyze the job requirements and generate relevant questions across different categories.
        </p>
        
        {!questions ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer, Product Manager, UX Designer"
                  {...register('jobTitle', { required: 'Job title is required' })}
                />
                {errors.jobTitle && <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>}
              </div>
              
              <div className="mb-6">
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste the full job description here..."
                  rows="10"
                  {...register('jobDescription', { required: 'Job description is required' })}
                />
                {errors.jobDescription && <p className="mt-1 text-sm text-red-600">{errors.jobDescription.message}</p>}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Researching...
                    </>
                  ) : (
                    'Research Questions'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-8">
            <button
              onClick={() => setQuestions(null)}
              className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Research Form
            </button>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technical Questions</h2>
              <div className="space-y-4">
                {questions.technical.map((q, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-gray-800 font-medium">{q.question}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                      </span>
                      {q.skill && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                          {q.skill}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Behavioral Questions</h2>
              <div className="space-y-4">
                {questions.behavioral.map((q, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-gray-800 font-medium">{q.question}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                      </span>
                      {q.skill && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                          {q.skill}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Situational Questions</h2>
              <div className="space-y-4">
                {questions.situational.map((q, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="text-gray-800 font-medium">{q.question}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Questions</h2>
                <div className="space-y-4">
                  {questions.company.map((q, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="text-gray-800 font-medium">{q.question}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                        </span>
                        {q.type && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {q.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Role-Specific Questions</h2>
                <div className="space-y-4">
                  {questions.role_specific.map((q, index) => (
                    <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <p className="text-gray-800 font-medium">{q.question}</p>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  // In a real implementation, this would save to the database
                  toast.success('Questions saved to your account!');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Questions
              </button>
              
              <button
                onClick={() => {
                  // In a real implementation, this would download a PDF
                  toast.success('Questions downloaded!');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
