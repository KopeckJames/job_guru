import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => {
    return router.pathname === path ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Job Guru</h1>
          </Link>

          {isAuthenticated ? (
            <>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className={isActive('/dashboard')}>
                  Dashboard
                </Link>
                <Link href="/interview-copilot" className={isActive('/interview-copilot')}>
                  Interview Copilot
                </Link>
                <Link href="/resumes" className={isActive('/resumes')}>
                  Resumes
                </Link>
                <Link href="/interviews/research" className={isActive('/interviews/research')}>
                  Interview Research
                </Link>
                <Link href="/questions" className={isActive('/questions')}>
                  Questions
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <Link href="/profile" className={isActive('/profile')}>
                  Profile
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-600 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex space-x-4">
              <Link href="/login" className="px-4 py-2 text-blue-600 hover:text-blue-800">
                Log In
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
