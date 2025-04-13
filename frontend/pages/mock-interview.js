import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MockInterview from '../components/MockInterview';
import { toast } from 'react-toastify';

export default function MockInterviewPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);
  const [interviewConfig, setInterviewConfig] = useState(null);
  
  const interviewTypes = [
    {
      id: 'general',
      title: 'General Interview',
      description: 'Practice common behavioral and situational questions suitable for any job.',
      icon: '👥',
      difficulty: 'Easy to Medium'
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      description: 'Practice technical questions related to software development, data science, and engineering.',
      icon: '💻',
      difficulty: 'Medium to Hard'
    },
    {
      id: 'leadership',
      title: 'Leadership Interview',
      description: 'Practice questions focused on leadership, management, and team collaboration.',
      icon: '🚀',
      difficulty: 'Medium'
    },
    {
      id: 'sales',
      title: 'Sales & Marketing',
      description: 'Practice questions for sales, marketing, and customer-facing roles.',
      icon: '📈',
      difficulty: 'Medium'
    },
    {
      id: 'consulting',
      title: 'Consulting Interview',
      description: 'Practice case interviews and consulting-specific questions.',
      icon: '📊',
      difficulty: 'Hard'
    },
    {
      id: 'custom',
      title: 'Custom Interview',
      description: 'Create a custom interview with questions tailored to your specific needs.',
      icon: '✨',
      difficulty: 'Varies'
    }
  ];
  
  const handleSelectType = (type) => {
    setSelectedType(type);
    
    // In a real implementation, this would fetch interview questions from the API
    // For now, we'll just set a mock interview ID
    setInterviewConfig({
      id: 1,
      type: type.id,
      title: type.title
    });
  };
  
  const handleCompleteInterview = (responses) => {
    // In a real implementation, this would save the interview results to the API
    toast.success('Interview completed and saved!');
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Mock Interview | Job Guru</title>
        <meta name="description" content="Practice with AI-powered mock interviews" />
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Mock Interview</h1>
        
        {!interviewConfig ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Interview Type</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviewTypes.map((type) => (
                <div
                  key={type.id}
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedType?.id === type.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => handleSelectType(type)}
                >
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      Difficulty: {type.difficulty}
                    </span>
                    {selectedType?.id === type.id && (
                      <span className="text-xs font-medium text-blue-600">Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedType && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setInterviewConfig({
                    id: 1,
                    type: selectedType.id,
                    title: selectedType.title
                  })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Interview
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{interviewConfig.title}</h2>
                <p className="text-gray-600">Answer each question as if you were in a real interview.</p>
              </div>
              <button
                onClick={() => setInterviewConfig(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                Change Interview Type
              </button>
            </div>
            
            <MockInterview
              interviewId={interviewConfig.id}
              onComplete={handleCompleteInterview}
            />
          </div>
        )}
      </main>
    </div>
  );
}
