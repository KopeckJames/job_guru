import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '../lib/authContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Create a client
const queryClient = new QueryClient();

// Pages that don't require authentication
const publicPages = ['/', '/login', '/signup', '/forgot-password'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the client-side
    if (typeof window !== 'undefined') {
      // For demo purposes, we'll automatically log in the user
      // In a real app, you would check if the user is authenticated
      const token = localStorage.getItem('token');
      const isPublicPage = publicPages.includes(router.pathname);

      if (!token && !isPublicPage) {
        // For demo purposes, set a token to simulate being logged in
        localStorage.setItem('token', 'mock-token');
      }

      setIsLoading(false);
    }
  }, [router.pathname]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
