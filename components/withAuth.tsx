import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { cookies } from '@/lib/cookies';
import { PageTransition } from '@/components/ui/page-transition';

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
    const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
    const [showSmoothTransition, setShowSmoothTransition] = useState(false);

    // Auto-login function using cookie data
    const attemptAutoLogin = async () => {
      try {
        const sessionData = cookies.getUserSession();
        if (!sessionData || !sessionData.provider) return false;

        setIsAutoLoggingIn(true);
        setShowSmoothTransition(true);

        // Try to restore the session based on provider
        if (sessionData.provider === 'google' && sessionData.email) {
          // For Google, we'll try to refresh the session
          const { data, error } = await supabase.auth.getSession();
          if (data.session) {
            // Save the refreshed session to cookies
            cookies.setUserSession({
              userId: data.session.user.id,
              email: data.session.user.email || '',
              provider: 'google',
              expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            });
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error('Auto-login failed:', error);
        return false;
      } finally {
        setIsAutoLoggingIn(false);
      }
    };

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

          // First check if there's an active Supabase session
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (session) {
            // Save session to cookies for future auto-login
            cookies.setUserSession({
              userId: session.user.id,
              email: session.user.email || '',
              provider: session.user.app_metadata?.provider || 'unknown',
              expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            });
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }

          // If no active session, try auto-login from cookies
          const autoLoginSuccess = await attemptAutoLogin();
          if (autoLoginSuccess) {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }

          // If auto-login fails, redirect to login
          router.push('/login');
        } catch (error) {
          console.error('Authentication check failed:', error);
          // Clear invalid cookie data
          cookies.clearUserSession();
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
              // Save session to cookies when user signs in
              cookies.setUserSession({
                userId: session.user.id,
                email: session.user.email || '',
                provider: session.user.app_metadata?.provider || 'unknown',
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
              });
              setIsAuthenticated(true);
            } else if (event === 'SIGNED_OUT') {
              // Clear cookies when user signs out
              cookies.clearUserSession();
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
    
    if (loading || isAutoLoggingIn) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#0CF2A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#0CF2A0] text-sm font-medium">
              {isAutoLoggingIn ? 'Signing you back in...' : 'Checking authentication...'}
            </p>
            {isAutoLoggingIn && (
              <p className="text-gray-400 text-xs mt-2">Welcome back! We're restoring your session.</p>
            )}
          </div>
        </div>
      );
    }
    
    if (isAuthenticated) {
      const component = (
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

      return showSmoothTransition ? (
        <PageTransition isTransitioning={true}>
          {component}
        </PageTransition>
      ) : (
        component
      );
    }
    
    // This return is not strictly necessary as we're redirecting
    // but it helps TypeScript and React to be happy
    return null;
  };
  
  return AuthComponent;
};

export default withAuth; 