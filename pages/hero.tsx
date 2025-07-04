import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HeroRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the home page
    router.push('/');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white text-xl">Redirecting to home page...</p>
    </div>
  );
} 