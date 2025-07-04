import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import axios from 'axios';
import { withRateLimit } from '../../lib/rateLimit';

// Define interface for Professor data
interface Professor {
  name: string;
  field_of_research: string;
  university_name: string;
  email: string;
  official_url: string;
  publications?: number;
  citations?: number;
  title?: string;
  source?: string;
}

// Read and parse CSV file
const getProfessorsData = (): Professor[] => {
  try {
    const filePath = path.resolve(process.cwd(), 'data', 'professors.csv');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    return records;
  } catch (error) {
    console.error('Error reading professor data:', error);
    return [];
  }
};

// Get an AI suggestion for the search query
async function getAISuggestion(query: string, professors: Professor[]): Promise<string> {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return "I couldn't generate personalized recommendations at this time. Please explore the professor results below and consider reaching out to those whose research aligns with your interests.";
    }
    
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    const prompt = `
      A user is searching for professors who research: "${query}".
      
      Based on the search results, I need a personalized recommendation focused on:
      1. Suggesting 1-2 specific professors from the results that would be best to contact
      2. Mentioning why they're particularly good matches for this research interest
      3. Providing a brief, friendly email conversation starter for reaching out to them
      
      Here are the professors in the search results:
      ${JSON.stringify(professors.map(p => ({
        name: p.name,
        field: p.field_of_research,
        university: p.university_name
      })))}
      
      Keep your response under 200 words, conversational, and helpful. Use a professional tone.
      Do not format with markdown.
    `;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful academic research assistant. You provide personalized professor recommendations and practical advice for initiating research collaborations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('Error getting AI suggestion:', error);
    
    // Handle specific Groq API errors
    if (error.response?.status === 429) {
      return "Our AI recommendation service is currently experiencing high demand. While I can't provide personalized suggestions right now, you can still browse the professor results below. Try again in a few minutes for AI-powered recommendations.";
    } else if (error.response?.status === 401) {
      return "AI recommendations are temporarily unavailable due to authentication issues. Please explore the professor results below manually.";
    } else if (error.response?.status >= 500) {
      return "Our AI recommendation service is temporarily down for maintenance. Please explore the professor results below, and the AI suggestions will be back online shortly.";
    }
    
    return "I couldn't generate personalized recommendations at this time. Please explore the professor results below and consider reaching out to those whose research aligns with your interests.";
  }
}

// Call Groq AI to get relevant professors for a search query
async function getRelevantProfessors(query: string, allProfessors: Professor[]): Promise<Professor[]> {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      // Fallback to basic search if no API key
      return basicSearchFallback(query, allProfessors);
    }
    
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    // Limit the number of professors to avoid token limits
    const professorsForGroq = allProfessors.slice(0, 100);
    
    const prompt = `
      Based on this user input: "${query}", return the most relevant professors from this dataset as a JSON array.
      Include professors who match closely or are in similar subfields.
      The response should ONLY be a valid JSON array of objects with no additional text.
      Each object should include name, field_of_research, university_name, email, and official_url fields.
      Limit results to the 10 most relevant professors.
      
      Dataset: ${JSON.stringify(professorsForGroq)}
    `;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that matches professors to research queries. Your response should be ONLY a valid JSON array with no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse the response from Groq
    const content = response.data.choices[0].message.content;
    
    // Extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error('Could not parse JSON from Groq response');
      return basicSearchFallback(query, allProfessors);
    }
  } catch (error: any) {
    console.error('Error calling Groq AI:', error);
    
    // Handle specific Groq API errors
    if (error.response?.status === 429) {
      console.log('Groq API rate limit exceeded, falling back to basic search');
    } else if (error.response?.status === 401) {
      console.log('Groq API authentication failed, falling back to basic search');
    } else if (error.response?.status >= 500) {
      console.log('Groq API server error, falling back to basic search');
    }
    
    // Fallback: basic filtering if Groq AI fails
    return basicSearchFallback(query, allProfessors);
  }
}

// Basic search fallback when Groq API is unavailable
function basicSearchFallback(query: string, allProfessors: Professor[]): Professor[] {
  return allProfessors.filter(professor => {
    const searchTerms = query.toLowerCase().split(' ');
    const fieldMatches = searchTerms.some(term => 
      professor.field_of_research.toLowerCase().includes(term)
    );
    const nameMatches = searchTerms.some(term => 
      professor.name.toLowerCase().includes(term)
    );
    const uniMatches = searchTerms.some(term => 
      professor.university_name.toLowerCase().includes(term)
    );
    
    return fieldMatches || nameMatches || uniMatches;
  }).slice(0, 10);
}

// Enhanced basic search with better matching
function enhancedBasicSearch(query: string, allProfessors: Professor[]): Professor[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return allProfessors.filter(professor => {
    const fieldLower = professor.field_of_research.toLowerCase();
    const nameLower = professor.name.toLowerCase();
    const uniLower = professor.university_name.toLowerCase();
    
    // Score-based matching for better relevance
    let score = 0;
    
    searchTerms.forEach(term => {
      // Exact field matches get highest score
      if (fieldLower.includes(term)) score += 10;
      // Name matches get medium score
      if (nameLower.includes(term)) score += 5;
      // University matches get lower score
      if (uniLower.includes(term)) score += 2;
    });
    
    return score > 0;
  })
  .sort((a, b) => {
    // Sort by relevance (field matches first)
    const aFieldMatches = searchTerms.filter(term => 
      a.field_of_research.toLowerCase().includes(term)
    ).length;
    const bFieldMatches = searchTerms.filter(term => 
      b.field_of_research.toLowerCase().includes(term)
    ).length;
    
    return bFieldMatches - aFieldMatches;
  })
  .slice(0, 15); // Increased limit for better results
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Sanitize query input
    const sanitizedQuery = query.trim().slice(0, 200); // Limit length
    
    if (sanitizedQuery.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters long' });
    }

    // Get all professors data
    const allProfessors = getProfessorsData();
    
    if (allProfessors.length === 0) {
      return res.status(500).json({ message: 'Failed to load professor data' });
    }

    // Get relevant professors using enhanced search or Groq AI
    let relevantProfessors: Professor[];
    
    try {
      // Try Groq AI first for intelligent matching
      relevantProfessors = await getRelevantProfessors(sanitizedQuery, allProfessors);
    } catch (error) {
      console.log('Groq AI failed, using enhanced basic search');
      // Fallback to enhanced basic search
      relevantProfessors = enhancedBasicSearch(sanitizedQuery, allProfessors);
    }
    
    // Add mock enhanced data for better UI display
    const enhancedProfessors = relevantProfessors.map((prof, index) => ({
      ...prof,
      publications: Math.floor(Math.random() * 100) + 20,
      citations: Math.floor(Math.random() * 5000) + 1000,
      title: `Professor of ${prof.field_of_research.split(';')[0] || prof.field_of_research}`,
      source: 'Local Database'
    }));
    
    // Get an AI suggestion for the results
    const aiSuggestion = await getAISuggestion(sanitizedQuery, enhancedProfessors);
    
    return res.status(200).json({ 
      professors: enhancedProfessors,
      aiSuggestion,
      total: enhancedProfessors.length
    });
  } catch (error) {
    console.error('Error in professor search API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Export with rate limiting: 30 requests per 15 minutes
export default withRateLimit(handler, {
  maxRequests: 30,
  windowMs: 15 * 60 * 1000,
  message: 'Too many search requests. Please wait before searching again.'
}); 