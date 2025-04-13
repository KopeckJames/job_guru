import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import InterviewCopilot from '../components/InterviewCopilot';
import { interviewAPI } from '../lib/api';
import { toast } from 'react-toastify';

export default function InterviewCopilotPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  // Fetch interviews on component mount
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        const response = await interviewAPI.getInterviews();
        setInterviews(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Failed to load interviews');
        setIsLoading(false);
      }
    };
    
    fetchInterviews();
  }, []);
  
  // Create a new interview session
  const createSession = async (interviewId) => {
    try {
      setIsCreatingSession(true);
      const response = await interviewAPI.createSession(interviewId, {
        scheduled_at: new Date().toISOString(),
        notes: 'Created from Interview Copilot page',
      });
      
      setSessionId(response.data.id);
      setSelectedInterview(interviewId);
      setIsCreatingSession(false);
      toast.success('Interview session created');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create interview session');
      setIsCreatingSession(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Interview Copilot | Job Guru</title>
        <meta name="description" content="Get real-time AI assistance during your interviews" />
      </Head>
      
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Job Guru</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/interview-copilot" className="text-blue-600 font-medium">
              Interview Copilot
            </Link>
            <Link href="/resumes" className="text-gray-600 hover:text-blue-600">
              Resumes
            </Link>
            <Link href="/questions" className="text-gray-600 hover:text-blue-600">
              Questions
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="text-gray-600 hover:text-blue-600">
              Profile
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Interview Copilot</h1>
        
        {!selectedInterview ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select an Interview</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : interviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{interview.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{interview.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {interview.job_title && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {interview.job_title}
                        </span>
                      )}
                      {interview.company && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {interview.company}
                        </span>
                      )}
                      {interview.difficulty && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {interview.difficulty}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => createSession(interview.id)}
                      disabled={isCreatingSession}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                      {isCreatingSession ? 'Creating Session...' : 'Start Interview'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any interviews yet.</p>
                <Link href="/interviews/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Create Interview
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-200px)]">
            <InterviewCopilot interviewId={selectedInterview} sessionId={sessionId} />
          </div>
        )}
      </main>
    </div>
  );
}
