import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          router.push('/signup?error=auth_callback_error');
          return;
        }

        if (data.session) {
          // Successfully authenticated
          console.log('Email confirmation successful');
          router.push('/search?confirmed=true');
        } else {
          // No session found
          router.push('/signup?error=no_session');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/signup?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0CF2A0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Confirming your email...</h2>
        <p className="text-gray-400">Please wait while we verify your account.</p>
      </div>
    </div>
  );
} 