import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en" className="bg-black">
        <Head>
          {/* Viewport for mobile optimization - prevents iOS zoom on input focus */}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

          {/* Primary Meta Tags */}
          <title>Flow Research - Connect with Professors & Research Opportunities</title>
          <meta name="title" content="Flow Research - Connect with Professors & Research Opportunities" />
          <meta name="description" content="Find and connect with professors for research collaboration opportunities. AI-powered personalized email generation to help students and researchers build academic connections." />
          <meta name="keywords" content="professors, research collaboration, academic connections, research opportunities, university professors, PhD research, academic networking" />
          <meta name="author" content="Flow Research" />
          <meta name="robots" content="index, follow" />
          <meta name="language" content="English" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://flow-research.com/" />
          <meta property="og:title" content="Flow Research - Connect with Professors & Research Opportunities" />
          <meta property="og:description" content="Find and connect with professors for research collaboration opportunities. AI-powered personalized email generation to help students and researchers build academic connections." />
          <meta property="og:image" content="https://flow-research.com/full name website logo.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Flow Research" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://flow-research.com/" />
          <meta property="twitter:title" content="Flow Research - Connect with Professors & Research Opportunities" />
          <meta property="twitter:description" content="Find and connect with professors for research collaboration opportunities. AI-powered personalized email generation to help students and researchers build academic connections." />
          <meta property="twitter:image" content="https://flow-research.com/full name website logo.png" />

          {/* Additional SEO */}
          <meta name="theme-color" content="#0CF2A0" />
          <meta name="msapplication-TileColor" content="#0CF2A0" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <link rel="canonical" href="https://flow-research.com/" />

          {/* Favicon links */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
          <link rel="manifest" href="/site.webmanifest" />

          {/* Structured Data - Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Flow Research",
                "url": "https://flow-research.com",
                "logo": "https://flow-research.com/full name website logo.png",
                "description": "AI-powered platform connecting students and researchers with professors for research collaboration opportunities",
                "sameAs": [
                  "https://github.com/Bharath-Erusalagandi/flow-research"
                ]
              })
            }}
          />
        </Head>
        <body className="bg-black text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument; 