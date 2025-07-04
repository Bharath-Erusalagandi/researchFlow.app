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
                <Mail className="h-6 w-6 text-[#0CF2A0]" />
                <span>Contact Us</span>
              </h1>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-8 flex-grow">
          <div className="max-w-3xl mx-auto">
            <p className="mb-8 text-gray-300">Have questions or feedback? Reach out to our team and we&apos;ll get back to you as soon as possible.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 hover:shadow-[0_0_15px_rgba(12,242,160,0.15)] transition-all duration-300">
                <h2 className="text-xl font-semibold mb-4 text-white">General Inquiries</h2>
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-5 w-5 text-[#0CF2A0]" />
                    <span>info@researchconnect.edu</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-5 w-5 text-[#0CF2A0]" />
                    <span>(555) 123-4567</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 hover:shadow-[0_0_15px_rgba(12,242,160,0.15)] transition-all duration-300">
                <h2 className="text-xl font-semibold mb-4 text-white">Technical Support</h2>
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-5 w-5 text-[#0CF2A0]" />
                    <span>support@researchconnect.edu</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-5 w-5 text-[#0CF2A0]" />
                    <span>(555) 987-6543</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact form */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 mb-10">
              <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#0CF2A0]" />
                <span>Send us a Message</span>
              </h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/50"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <select className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/50" required>
                    <option value="">Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Feedback</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                  <textarea
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white h-32 focus:border-[#0CF2A0]/50 focus:outline-none focus:ring-1 focus:ring-[#0CF2A0]/50"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 bg-gray-800 border-gray-700 text-[#0CF2A0] rounded focus:ring-[#0CF2A0]/50 focus:ring-offset-gray-900" id="privacy-policy" />
                  <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-300">
                    I agree to the privacy policy
                  </label>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="bg-[#0CF2A0]/20 text-[#0CF2A0] px-6 py-2 rounded hover:bg-[#0CF2A0]/30 transition-colors border border-[#0CF2A0]/30"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            
            {/* FAQ section */}
            <div>
              <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#0CF2A0]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-4">
                {[
                  {
                    question: "How do I apply for a research position?",
                    answer: "Browse through available research opportunities, select the one you're interested in, and click the 'Apply' button. You'll need to complete your profile information before applying."
                  },
                  {
                    question: "Can I contact professors directly?",
                    answer: "Yes, once you've created an account, you can send messages to professors through our platform. We recommend reviewing their research areas first."
                  },
                  {
                    question: "How do I update my student profile?",
                    answer: "Go to your Profile page and click on 'Edit Profile'. From there, you can update your personal information, research interests, and academic background."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-gray-900/70 border border-gray-800 rounded-lg p-4 hover:shadow-[0_0_15px_rgba(12,242,160,0.10)] transition-all duration-300">
                    <h3 className="font-semibold mb-2 text-white">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
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

export default ContactPage; 