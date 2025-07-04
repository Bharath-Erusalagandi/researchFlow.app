import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

// Check if Supabase environment variables are available
const isMissingEnvVars = 
  typeof window !== 'undefined' && 
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const AuthComponent = (props: any) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [envWarning, setEnvWarning] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // If environment variables are missing, show warning but allow access in development
          if (isMissingEnvVars) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('⚠️ Supabase environment variables missing. Authentication disabled.');
              setEnvWarning(true);
              setIsAuthenticated(true); // Allow access in development
              setLoading(false);
              return;
            } else {
              // In production, redirect to login
              router.push('/login');
              return;
            }
          }

          // Get the current session from Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (!session) {
            router.push('/login');
            return;
          }
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication check failed:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };
      
      // Set up auth state change listener
      let subscription: { unsubscribe: () => void } | null = null;
      
      if (!isMissingEnvVars) {
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setIsAuthenticated(true);
            } else if (event === 'SIGNED_OUT') {
              setIsAuthenticated(false);
              router.push('/login');
            }
          }
        );
        
        subscription = data.subscription;
      }
      
      checkAuth();
      
      // Cleanup subscription on unmount
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }, [router]);
    
    if (loading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-[#0CF2A0] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    
    if (isAuthenticated) {
      return (
        <>
          {envWarning && process.env.NODE_ENV !== 'production' && (
            <div className="bg-yellow-900/80 border border-yellow-600 text-yellow-200 px-4 py-2 text-sm fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
              <div>
                ⚠️ Supabase environment variables are missing. Authentication is disabled in development mode.
                Run <code className="bg-yellow-900 px-1 py-0.5 rounded">npm run setup-env</code> to configure.
              </div>
              <button 
                className="text-yellow-200 hover:text-white ml-2"
                onClick={() => setEnvWarning(false)}
              >
                ×
              </button>
            </div>
          )}
          <WrappedComponent {...props} />
        </>
      );
    }
    
    // This return is not strictly necessary as we're redirecting
    // but it helps TypeScript and React to be happy
    return null;
  };
  
  return AuthComponent;
};

export default withAuth; 