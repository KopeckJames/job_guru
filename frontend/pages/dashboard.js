import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    profilePicture: null
  });
  
  const [stats, setStats] = useState({
    interviews: {
      total: 12,
      completed: 8,
      upcoming: 2
    },
    resumes: {
      total: 3,
      atsScore: 85
    },
    applications: {
      total: 15,
      pending: 8,
      rejected: 3,
      interviews: 4
    },
    practiceHours: 6.5
  });
  
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'interview',
      title: 'Mock Interview - Software Engineer',
      date: '2023-06-15T14:30:00Z',
      status: 'completed',
      score: 4.2
    },
    {
      id: 2,
      type: 'resume',
      title: 'Updated Software Engineer Resume',
      date: '2023-06-14T10:15:00Z',
      status: 'updated',
      atsScore: 92
    },
    {
      id: 3,
      type: 'application',
      title: 'Applied to Senior Developer at Tech Corp',
      date: '2023-06-12T09:45:00Z',
      status: 'applied'
    },
    {
      id: 4,
      type: 'interview',
      title: 'Interview Copilot Session - Product Manager',
      date: '2023-06-10T16:00:00Z',
      status: 'completed',
      duration: 45
    }
  ]);
  
  const [upcomingInterviews, setUpcomingInterviews] = useState([
    {
      id: 1,
      company: 'Tech Innovations',
      position: 'Senior Software Engineer',
      date: '2023-06-20T13:00:00Z',
      type: 'Technical Interview',
      preparationStatus: 75
    },
    {
      id: 2,
      company: 'Global Solutions',
      position: 'Full Stack Developer',
      date: '2023-06-25T15:30:00Z',
      type: 'Behavioral Interview',
      preparationStatus: 40
    }
  ]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | Job Guru</title>
        <meta name="description" content="Your personal dashboard for interview preparation" />
      </Head>
      
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Job Guru</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/dashboard" className="text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/interview-copilot" className="text-gray-600 hover:text-blue-600">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/mock-interview" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Start Mock Interview
            </Link>
            <Link href="/interview-copilot" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              Launch Interview Copilot
            </Link>
          </div>
        </div>
        
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt={userData.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <span className="text-2xl font-semibold text-blue-600">
                  {userData.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Welcome back, {userData.name.split(' ')[0]}!</h2>
              <p className="text-gray-600">
                Continue your interview preparation journey. You've made great progress!
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Interviews</h3>
              <span className="text-3xl text-blue-600">{stats.interviews.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">{stats.interviews.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-medium">{stats.interviews.upcoming}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Resumes</h3>
              <span className="text-3xl text-blue-600">{stats.resumes.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average ATS Score</span>
                <span className="font-medium">{stats.resumes.atsScore}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Applications</h3>
              <span className="text-3xl text-blue-600">{stats.applications.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium">{stats.applications.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interviews</span>
                <span className="font-medium">{stats.applications.interviews}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Practice</h3>
              <span className="text-3xl text-blue-600">{stats.practiceHours}h</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Practice Time</span>
                <span className="font-medium">{stats.practiceHours} hours</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Interviews */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Upcoming Interviews</h3>
              </div>
              
              {upcomingInterviews.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">{interview.position}</h4>
                          <p className="text-gray-600">{interview.company}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">{formatDate(interview.date)}</div>
                          <div className="text-sm text-gray-600">{formatTime(interview.date)}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-600">{interview.type}</span>
                        <span className="text-sm font-medium text-blue-600">
                          Preparation: {interview.preparationStatus}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${interview.preparationStatus}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-4">
                        <button
                          onClick={() => router.push(`/interviews/${interview.id}/prepare`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Prepare
                        </button>
                        <button
                          onClick={() => router.push(`/interview-copilot?interview=${interview.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Use Copilot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600 mb-4">You don't have any upcoming interviews.</p>
                  <Link href="/mock-interview" className="text-blue-600 hover:text-blue-800">
                    Schedule a mock interview
                  </Link>
                </div>
              )}
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <Link href="/interviews" className="text-blue-600 hover:text-blue-800 text-sm">
                  View all interviews →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          activity.type === 'interview' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'resume' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'interview' ? '🎙️' :
                           activity.type === 'resume' ? '📄' : '🔍'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{activity.title}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {formatDate(activity.date)} at {formatTime(activity.date)}
                          </p>
                          
                          {activity.status === 'completed' && activity.score && (
                            <div className="text-sm">
                              <span className="text-gray-600">Score: </span>
                              <span className="font-medium text-blue-600">{activity.score}/5</span>
                            </div>
                          )}
                          
                          {activity.status === 'updated' && activity.atsScore && (
                            <div className="text-sm">
                              <span className="text-gray-600">ATS Score: </span>
                              <span className="font-medium text-green-600">{activity.atsScore}%</span>
                            </div>
                          )}
                          
                          {activity.status === 'completed' && activity.duration && (
                            <div className="text-sm">
                              <span className="text-gray-600">Duration: </span>
                              <span className="font-medium">{activity.duration} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No recent activity.</p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-4">
                <Link href="/resumes/create" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm font-medium text-gray-800">Create Resume</div>
                </Link>
                
                <Link href="/mock-interview" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">🎙️</div>
                  <div className="text-sm font-medium text-gray-800">Mock Interview</div>
                </Link>
                
                <Link href="/questions" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">❓</div>
                  <div className="text-sm font-medium text-gray-800">Practice Questions</div>
                </Link>
                
                <Link href="/applications" className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm font-medium text-gray-800">Job Search</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
