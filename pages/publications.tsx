import React from 'react';
import Head from 'next/head';
import { FileText, Search, Download, ExternalLink, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

const PublicationsPage = () => {
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>Publications | Research Connect</title>
        <meta name="description" content="Browse academic publications and research papers" />
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
                <FileText className="h-6 w-6 text-[#0CF2A0]" />
                <span>Publications</span>
              </h1>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-8 flex-grow">
          <p className="mb-8 text-gray-300">Access the latest academic publications and research papers from professors and students across various disciplines.</p>
          
          {/* Search and filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 flex items-center bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search publications..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none"
                />
              </div>
              <select className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-[#0CF2A0]/50">
                <option>All Categories</option>
                <option>Computer Science</option>
                <option>Biology</option>
                <option>Chemistry</option>
                <option>Physics</option>
                <option>Psychology</option>
              </select>
              <select className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:border-[#0CF2A0]/50">
                <option>Sort By: Recent</option>
                <option>Sort By: Most Cited</option>
                <option>Sort By: A-Z</option>
              </select>
            </div>
          </div>
          
          {/* Publications list */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 hover:shadow-[0_0_15px_rgba(12,242,160,0.15)] transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-[#0CF2A0]/10 text-[#0CF2A0] text-xs rounded-full mb-3">Computer Science</span>
                    <h2 className="text-xl font-semibold text-white mb-2">Advances in Deep Learning for Natural Language Processing</h2>
                    <p className="text-gray-300 mb-2">Authors: Jane Smith, John Doe, Robert Johnson</p>
                    <p className="text-gray-400 mb-1">Journal: International Journal of Computer Science</p>
                    <p className="text-gray-400 mb-3">Published: March 2023</p>
                    <p className="text-gray-400 text-sm mb-4">This paper presents novel approaches to improving transformer-based language models for low-resource languages and specialized domains.</p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0CF2A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <strong>Peer Reviewed</strong>
                      </span>
                      <span className="text-sm text-gray-300">
                        <strong>Citations:</strong> 42
                      </span>
                      <span className="text-sm text-gray-300">
                        <strong>DOI:</strong> 10.1234/example.2023.01
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <button className="bg-[#0CF2A0]/20 text-[#0CF2A0] px-4 py-2 rounded hover:bg-[#0CF2A0]/30 transition-colors border border-[#0CF2A0]/30 flex items-center gap-2 whitespace-nowrap">
                      <ExternalLink className="h-4 w-4" />
                      <span>View Publication</span>
                    </button>
                    <button className="bg-gray-800/50 text-gray-300 px-4 py-2 rounded hover:bg-gray-800 transition-colors border border-gray-700 flex items-center gap-2 whitespace-nowrap">
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-1">
              <button className="px-3 py-1 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition-colors">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded ${
                    page === 1 
                      ? 'bg-[#0CF2A0]/20 text-[#0CF2A0] border border-[#0CF2A0]/30' 
                      : 'border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-1 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition-colors">
                Next
              </button>
            </nav>
          </div>
        </div>
        
        {/* Simple footer to ensure proper padding at bottom */}
        <footer className="bg-black border-t border-gray-800 py-6 mt-8">
          <div className="container mx-auto px-6">
            <p className="text-center text-gray-500 text-sm">© {new Date().getFullYear()} Research Connect. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicationsPage; 