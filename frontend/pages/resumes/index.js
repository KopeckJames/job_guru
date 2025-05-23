import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { resumeAPI } from '../../lib/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resumes from local storage on component mount
  useEffect(() => {
    const fetchResumes = () => {
      try {
        setIsLoading(true);

        // Get resumes from local storage
        const storedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');

        // If no resumes in local storage, use mock data
        if (storedResumes.length === 0) {
          // Mock resume data
          const mockResumes = [
            {
              id: 1,
              title: 'Software Engineer Resume',
              description: 'Resume for tech companies',
              target_job: 'Software Engineer',
              ats_score: 85,
              created_at: '2023-05-15T10:30:00Z'
            },
            {
              id: 2,
              title: 'Product Manager Resume',
              description: 'Resume for product roles',
              target_job: 'Product Manager',
              ats_score: 78,
              created_at: '2023-06-20T14:45:00Z'
            }
          ];

          setResumes(mockResumes);
        } else {
          setResumes(storedResumes);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching resumes:', error);
        toast.error('Failed to load resumes');
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleDeleteResume = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      // Get existing resumes from local storage
      const storedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');

      // Filter out the resume to delete
      const updatedResumes = storedResumes.filter(resume => resume.id !== id);

      // Save updated resumes back to local storage
      localStorage.setItem('resumes', JSON.stringify(updatedResumes));

      // Update state
      setResumes(resumes.filter(resume => resume.id !== id));
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Resumes | Job Guru</title>
        <meta name="description" content="Manage your resumes and create new ones" />
      </Head>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Resumes</h1>
          <Link href="/resumes/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create New Resume
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{resume.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">{resume.description || 'No description'}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {resume.target_job && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {resume.target_job}
                      </span>
                    )}
                    {resume.industry && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {resume.industry}
                      </span>
                    )}
                    {resume.target_company && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {resume.target_company}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    Last updated: {new Date(resume.updated_at || resume.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between">
                  <div className="flex space-x-2">
                    <Link href={`/resumes/${resume.id}`} className="text-blue-600 hover:text-blue-800">
                      View
                    </Link>
                    <Link href={`/resumes/edit/${resume.id}`} className="text-blue-600 hover:text-blue-800">
                      Edit
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Resumes Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first resume to get started. You can build from scratch or upload an existing resume.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/resumes/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Create New Resume
              </Link>
              <Link href="/resumes/upload" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                Upload Resume
              </Link>
            </div>
          </div>
        )}
    </Layout>
  );
}
