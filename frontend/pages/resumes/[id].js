import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

export default function ResumeDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  }, [id, router]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle resume deletion
  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      // Get existing resumes from local storage
      const storedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
      
      // Filter out the resume to delete
      const updatedResumes = storedResumes.filter(r => r.id.toString() !== id.toString());
      
      // Save updated resumes back to local storage
      localStorage.setItem('resumes', JSON.stringify(updatedResumes));
      
      toast.success('Resume deleted successfully');
      router.push('/resumes');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };
  
  // Handle resume download
  const handleDownload = () => {
    if (!resume) return;
    
    try {
      // Create a blob with the resume content
      const blob = new Blob([resume.content || ''], { type: 'text/plain' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title || 'resume'}.txt`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
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
        <title>{resume.title || 'Resume'} | Job Guru</title>
        <meta name="description" content="View and manage your resume" />
      </Head>
      
      <div className="mb-8">
        <Link href="/resumes" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Resumes
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{resume.title}</h1>
        
        <div className="flex space-x-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          
          <Link
            href={`/resumes/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resume Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Resume Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="text-gray-800">{formatDate(resume.created_at)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-800">{resume.description || 'No description'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Target Job</h3>
                <p className="text-gray-800">{resume.target_job || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Target Company</h3>
                <p className="text-gray-800">{resume.target_company || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                <p className="text-gray-800">{resume.industry || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">ATS Score</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        resume.ats_score >= 80 ? 'bg-green-600' :
                        resume.ats_score >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${resume.ats_score || 0}%` }}
                    ></div>
                  </div>
                  <span className={`font-medium ${
                    resume.ats_score >= 80 ? 'text-green-600' :
                    resume.ats_score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {resume.ats_score || 0}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Resume Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Resume Content</h2>
            
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
              {resume.content || 'No content available'}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
