import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/fixes.css';

// For client-side only rendering
import dynamic from 'next/dynamic';

// Create a client-side only wrapper for GoogleOAuthProvider
const GoogleOAuthProviderClient = dynamic(
  () => import('../components/google-provider').then((mod) => mod.GoogleOAuthProviderClient),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <GoogleOAuthProviderClient>
        <Component {...pageProps} />
      </GoogleOAuthProviderClient>
    </>
  );
} 