import React, { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleOAuthProviderClientProps {
  children: ReactNode;
}

export const GoogleOAuthProviderClient: React.FC<GoogleOAuthProviderClientProps> = ({ children }) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}; 