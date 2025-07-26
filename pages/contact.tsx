import React from 'react';
import Head from 'next/head';
import { Mail, Phone, MessageSquare, HelpCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

const ContactPage = () => {
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>Contact | Research Connect</title>
        <meta name="description" content="Contact the Research Connect team for support and inquiries" />
      </Head>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-display text-4xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-subheading text-lg text-gray-300 mb-2">
              We'd love to hear from you
            </p>
            <p className="text-body text-gray-400 mb-8">
              Reach out for collaboration opportunities, support, or just to say hello.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-heading text-xl text-white mb-2">Contact Information</h2>
                <p className="text-body text-gray-300">
                  Email: <span className="text-code text-blue-400">contact@researchflow.com</span>
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <p className="text-caption text-gray-400 text-center">
                  Response time: Usually within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage; 