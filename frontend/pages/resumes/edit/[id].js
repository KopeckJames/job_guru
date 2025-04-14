import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';

export default function EditResumePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  
  // Fetch resume details on component mount
  useEffect(() => {
    const fetchResume = () => {
      if (!id) return; // Wait for id to be available
      
      try {
        setIsLoading(true);
        
        // Get resumes from local storage
        const storedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
        
        // Find the resume with the matching id
        const foundResume = storedResumes.find(r => r.id.toString() === id.toString());
        
        if (foundResume) {
          setResume(foundResume);
          
          // Set form values
          setValue('title', foundResume.title);
          setValue('description', foundResume.description);
          setValue('target_job', foundResume.target_job);
          setValue('target_company', foundResume.target_company);
          setValue('industry', foundResume.industry);
          setValue('content', foundResume.content);
        } else {
          toast.error('Resume not found');
          router.push('/resumes');
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
        toast.error('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResume();
  }, [id, router, setValue]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Get existing resumes from local storage
      const storedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
      
      // Find the index of the resume to update
      const resumeIndex = storedResumes.findIndex(r => r.id.toString() === id.toString());
      
      if (resumeIndex !== -1) {
        // Update the resume
        const updatedResume = {
          ...storedResumes[resumeIndex],
          title: data.title,
          description: data.description,
          target_job: data.target_job || '',
          target_company: data.target_company || '',
          industry: data.industry || '',
          content: data.content,
          updated_at: new Date().toISOString()
        };
        
        // Replace the old resume with the updated one
        storedResumes[resumeIndex] = updatedResume;
        
        // Save updated resumes back to local storage
        localStorage.setItem('resumes', JSON.stringify(storedResumes));
        
        toast.success('Resume updated successfully');
        router.push(`/resumes/${id}`);
      } else {
        toast.error('Resume not found');
      }
    } catch (error) {
      console.error('Error updating resume:', error);
      toast.error('Failed to update resume');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (!resume) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resume Not Found</h2>
          <p className="text-gray-600 mb-6">The resume you're looking for doesn't exist or has been deleted.</p>
          <Link href="/resumes" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Back to Resumes
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>Edit Resume | Job Guru</title>
        <meta name="description" content="Edit your resume" />
      </Head>
      
      <div className="mb-8">
        <Link href={`/resumes/${id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Resume
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Resume</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Resume Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer Resume"
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
              rows="3"
              {...register('description')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Resume Content
            </label>
            <textarea
              id="content"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Your resume content..."
              rows="20"
              {...register('content')}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
