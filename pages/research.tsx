import React from 'react';
import Head from 'next/head';
import { BookOpen, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import withAuth from '../components/withAuth';

const ResearchPage = () => {
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>Research | Research Connect</title>
        <meta name="description" content="Explore research opportunities and projects" />
      </Head>
      <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-black border-b border-gray-800 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-[#0CF2A0]" />
              </button>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#0CF2A0]" />
                <span>Research Opportunities</span>
              </h1>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-8 flex-grow">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-4 mb-8 border border-gray-700">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search research projects..."
              className="flex-1 bg-transparent border-none text-white focus:outline-none"
            />
            <button className="bg-[#0CF2A0]/20 text-[#0CF2A0] px-4 py-2 rounded hover:bg-[#0CF2A0]/30 transition-colors border border-[#0CF2A0]/30">
              Search
            </button>
          </div>
          
          <p className="mb-8 text-gray-300">Discover and apply for cutting-edge research projects across various disciplines to enhance your academic and professional growth.</p>
          
          {/* Research categories */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-white">Research Categories</h2>
            <div className="flex flex-wrap gap-3">
              {['Computer Science', 'Biology', 'Chemistry', 'Physics', 'Psychology', 'Engineering'].map((category) => (
                <button 
                  key={category}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    category === 'Computer Science' 
                      ? 'bg-[#0CF2A0]/10 text-[#0CF2A0]' 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Research project cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 hover:shadow-[0_0_15px_rgba(12,242,160,0.15)] transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-[#0CF2A0]/10 text-[#0CF2A0] text-xs rounded-full mb-3">Computer Science</span>
                <h2 className="text-xl font-semibold text-white mb-2">Machine Learning Research Project</h2>
                <p className="text-gray-300 mb-1">Professor: Dr. John Smith</p>
                <p className="text-gray-400 mb-3">Duration: 6 months</p>
                <p className="text-gray-400 text-sm mb-4">Looking for students interested in exploring applications of deep learning in healthcare data analysis.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Posted: 2 days ago</span>
                  <button className="bg-[#0CF2A0]/20 text-[#0CF2A0] px-4 py-2 rounded hover:bg-[#0CF2A0]/30 transition-colors border border-[#0CF2A0]/30">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Simple footer to ensure proper padding at bottom */}
        <footer className="bg-black border-t border-gray-800 py-6">
          <div className="container mx-auto px-6">
            <p className="text-center text-gray-500 text-sm">© {new Date().getFullYear()} Research Connect. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default withAuth(ResearchPage); 