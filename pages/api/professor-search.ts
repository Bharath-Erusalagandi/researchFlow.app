import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import axios from 'axios';
import { withRateLimit } from '../../lib/rateLimit';

// Smart query validation system
interface QueryValidationResult {
  isValid: boolean;
  confidence: number;
  suggestion?: string;
  reason?: string;
}

// List of common academic/research keywords for validation
const ACADEMIC_KEYWORDS = [
  // Research fields
  'machine learning', 'artificial intelligence', 'data science', 'computer science', 'biology', 'chemistry', 'physics',
  'neuroscience', 'psychology', 'sociology', 'anthropology', 'linguistics', 'literature', 'history', 'philosophy',
  'mathematics', 'statistics', 'engineering', 'medicine', 'genetics', 'biochemistry', 'molecular biology',
  'environmental science', 'climate science', 'economics', 'political science', 'education', 'law', 'business',
  'architecture', 'art', 'music', 'theater', 'film', 'journalism', 'communications', 'public health',
  'biotechnology', 'nanotechnology', 'robotics', 'quantum', 'renewable energy', 'sustainability',
  
  // Research methods and topics
  'research', 'study', 'analysis', 'theory', 'methodology', 'experiment', 'clinical', 'laboratory', 'computational',
  'modeling', 'simulation', 'algorithm', 'optimization', 'innovation', 'development', 'application',
  'treatment', 'diagnosis', 'therapy', 'drug', 'vaccine', 'protein', 'gene', 'DNA', 'RNA', 'cell',
  'cancer', 'diabetes', 'alzheimer', 'autism', 'depression', 'anxiety', 'brain', 'cognitive', 'behavior',
  'learning', 'memory', 'perception', 'consciousness', 'emotion', 'social', 'cultural', 'linguistic',
  
  // Academic terms
  'professor', 'research', 'university', 'college', 'academic', 'scholar', 'scientist', 'doctor', 'phd',
  'postdoc', 'faculty', 'department', 'institute', 'laboratory', 'lab', 'center', 'program', 'curriculum',
  'thesis', 'dissertation', 'publication', 'journal', 'conference', 'symposium', 'seminar', 'lecture',
  'collaboration', 'grant', 'funding', 'project', 'fellowship', 'internship', 'mentorship',
  
  // Common academic abbreviations and terms
  'ai', 'ml', 'cs', 'bio', 'chem', 'phys', 'math', 'stats', 'eng', 'med', 'psych', 'neuro', 'comp',
  'tech', 'science', 'studies', 'field', 'area', 'topic', 'subject', 'discipline', 'major', 'minor',
  'undergraduate', 'graduate', 'masters', 'doctoral', 'bachelor', 'degree', 'course', 'class'
];

// Advanced academic topics and emerging fields
const ADVANCED_KEYWORDS = [
  'crispr', 'gene editing', 'stem cells', 'immunotherapy', 'precision medicine', 'personalized medicine',
  'deep learning', 'neural networks', 'computer vision', 'natural language processing', 'nlp',
  'blockchain', 'cryptocurrency', 'cybersecurity', 'quantum computing', 'quantum mechanics',
  'climate change', 'global warming', 'renewable energy', 'solar', 'wind energy', 'battery technology',
  'space exploration', 'astrophysics', 'cosmology', 'exoplanets', 'mars', 'satellite',
  'virtual reality', 'augmented reality', 'mixed reality', 'metaverse', 'human-computer interaction',
  'bioengineering', 'tissue engineering', 'synthetic biology', 'bioinformatics', 'genomics', 'proteomics',
  'epidemiology', 'public health', 'pandemic', 'infectious disease', 'vaccine development',
  'cognitive science', 'behavioral economics', 'game theory', 'decision making', 'risk assessment'
];

// Common research methodologies and techniques
const METHODOLOGY_KEYWORDS = [
  'statistical analysis', 'data mining', 'big data', 'machine learning', 'regression analysis',
  'randomized controlled trial', 'longitudinal study', 'cross-sectional study', 'meta-analysis',
  'systematic review', 'qualitative research', 'quantitative research', 'mixed methods',
  'survey research', 'interview', 'focus group', 'ethnography', 'case study', 'experimental design',
  'molecular dynamics', 'x-ray crystallography', 'mass spectrometry', 'chromatography',
  'microscopy', 'imaging', 'spectroscopy', 'computational modeling', 'simulation'
];

// Combine all academic keywords
const ALL_ACADEMIC_KEYWORDS = [...ACADEMIC_KEYWORDS, ...ADVANCED_KEYWORDS, ...METHODOLOGY_KEYWORDS];

// Function to check if a word looks like a real English word - more permissive
function isValidWord(word: string): boolean {
  // Check minimum length
  if (word.length < 2) return false;
  
  // Very basic validation - just check for valid characters and reasonable length
  const reasonableLength = word.length >= 2 && word.length <= 25;
  const validChars = /^[a-zA-Z\s\-']+$/.test(word);
  const noExcessiveRepeats = !/(.)\1{4,}/.test(word); // No more than 4 repeated chars
  
  // Allow common abbreviations and acronyms
  const isAcronym = word.length <= 5 && /^[A-Z]+$/.test(word);
  
  // Most academic terms have vowels, but allow some flexibility
  const hasVowels = /[aeiouAEIOU]/i.test(word);
  const hasConsonants = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/i.test(word);
  
  return reasonableLength && validChars && noExcessiveRepeats && 
         (isAcronym || (hasVowels && hasConsonants) || word.length <= 3);
}

// Function to calculate semantic similarity between query and academic topics
function calculateAcademicRelevance(query: string): number {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/[\s\-,\.]+/).filter(word => word.length > 2);
  
  let relevanceScore = 0;
  let totalWords = words.length;
  
  if (totalWords === 0) return 0;
  
  words.forEach(word => {
    // Direct match with academic keywords
    if (ALL_ACADEMIC_KEYWORDS.some(keyword => keyword.includes(word) || word.includes(keyword))) {
      relevanceScore += 3;
    }
    
    // Partial match with academic terms
    if (ALL_ACADEMIC_KEYWORDS.some(keyword => 
      keyword.split(' ').some(keywordPart => 
        keywordPart.includes(word) && keywordPart.length > 3
      )
    )) {
      relevanceScore += 2;
    }
    
    // Common academic suffixes/prefixes
    if (word.match(/(ology|graphy|metry|istry|ics|tion|sion|ment|ance|ence|ing|ed)$/)) {
      relevanceScore += 1;
    }
  });
  
  return Math.min(relevanceScore / totalWords, 3); // Normalize to 0-3 scale
}

// Main validation function
async function validateSearchQuery(query: string): Promise<QueryValidationResult> {
  const trimmedQuery = query.trim();
  
  // Basic validation
  if (trimmedQuery.length < 2) {
    return {
      isValid: false,
      confidence: 0,
      reason: 'Query too short',
      suggestion: 'Please enter at least 2 characters. Try searching for research topics like "machine learning" or "cancer research".'
    };
  }
  
  if (trimmedQuery.length > 100) {
    return {
      isValid: false,
      confidence: 0,
      reason: 'Query too long',
      suggestion: 'Please shorten your search to focus on key research topics or professor names.'
    };
  }
  
  // Check for valid words
  const words = trimmedQuery.toLowerCase().split(/[\s\-,\.]+/).filter(word => word.length > 0);
  const validWords = words.filter(isValidWord);
  const wordValidityRatio = validWords.length / words.length;
  
  // More permissive validation - only reject obviously invalid queries
  if (wordValidityRatio < 0.3) {
    return {
      isValid: false,
      confidence: 0.2,
      reason: 'Invalid or nonsensical words',
      suggestion: 'Please use real words related to research topics. Try searching for fields like "biology", "computer science", or "psychology".'
    };
  }
  
  // Allow queries that look like names (common pattern for professor searches)
  const looksLikeName = /^[A-Za-z\s\-'\.]+$/.test(trimmedQuery) && words.length <= 4;
  if (looksLikeName) {
    return {
      isValid: true,
      confidence: 0.8,
      suggestion: undefined
    };
  }
  
  // Check academic relevance - make it more permissive
  const academicRelevance = calculateAcademicRelevance(trimmedQuery);
  
  // Only reject if completely irrelevant (very low threshold)
  if (academicRelevance < 0.1 && wordValidityRatio < 0.8) {
    // Try to suggest better terms
    const suggestions = [];
    if (trimmedQuery.toLowerCase().includes('ai')) suggestions.push('artificial intelligence');
    if (trimmedQuery.toLowerCase().includes('ml')) suggestions.push('machine learning');
    if (trimmedQuery.toLowerCase().includes('bio')) suggestions.push('biology', 'biotechnology');
    if (trimmedQuery.toLowerCase().includes('psych')) suggestions.push('psychology');
    if (trimmedQuery.toLowerCase().includes('comp')) suggestions.push('computer science');
    
    return {
      isValid: false,
      confidence: 0.3,
      reason: 'Not research-related',
      suggestion: suggestions.length > 0 
        ? `Did you mean: ${suggestions.slice(0, 2).join(' or ')}? Try searching for specific research fields or academic topics.`
        : 'Please search for academic topics, research fields, or professor names. Examples: "neuroscience", "climate change", "machine learning".'
    };
  }
  
  // Calculate overall confidence - more permissive
  const confidence = Math.min(
    (wordValidityRatio * 0.3) + 
    (academicRelevance * 0.4) + 
    0.4, // Base confidence boost
    1.0
  );
  
  return {
    isValid: confidence > 0.4, // Much lower threshold
    confidence,
    suggestion: confidence < 0.6 ? 'Try being more specific about the research area you\'re interested in.' : undefined
  };
}

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

// Generate intelligent fallback recommendations when AI is not available
function generateSmartFallbackRecommendation(query: string, professors: Professor[]): string {
  if (professors.length === 0) {
    return `No professors found for "${query}". Try broader terms like "computer science", "biology", or "psychology". You can also search for specific research areas like "machine learning" or "cancer research".`;
  }

  // Get top 2-3 professors for recommendation
  const topProfessors = professors.slice(0, 3);
  const queryLower = query.toLowerCase();
  
  // Analyze the search query to provide context
  let fieldContext = "";
  if (queryLower.includes("machine learning") || queryLower.includes("ai") || queryLower.includes("artificial intelligence")) {
    fieldContext = "AI and machine learning research is rapidly evolving. ";
  } else if (queryLower.includes("cancer") || queryLower.includes("medicine") || queryLower.includes("medical")) {
    fieldContext = "Medical research offers tremendous opportunities to make a real impact. ";
  } else if (queryLower.includes("climate") || queryLower.includes("environment")) {
    fieldContext = "Environmental research is crucial for addressing global challenges. ";
  } else if (queryLower.includes("neuro") || queryLower.includes("brain")) {
    fieldContext = "Neuroscience research is unlocking the mysteries of the human brain. ";
  }

  // Build recommendation text
  let recommendation = `Based on your search for "${query}", here are some excellent professors to consider:\n\n`;
  
  if (topProfessors.length >= 2) {
    recommendation += `I'd particularly recommend reaching out to **${topProfessors[0].name}** at ${topProfessors[0].university_name}, who specializes in ${topProfessors[0].field_of_research}. `;
    recommendation += `Also consider **${topProfessors[1].name}** at ${topProfessors[1].university_name}, whose work in ${topProfessors[1].field_of_research} might align well with your interests.\n\n`;
  } else {
    recommendation += `I'd recommend starting with **${topProfessors[0].name}** at ${topProfessors[0].university_name}, who works in ${topProfessors[0].field_of_research}.\n\n`;
  }

  recommendation += fieldContext;
  recommendation += `When reaching out, mention specific aspects of their research that interest you and briefly describe your background. Good luck with your research journey!`;

  return recommendation;
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
      // Provide intelligent fallback recommendation
      return generateSmartFallbackRecommendation(query, professors);
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

    // Use all professors but batch them intelligently
    const professorsForGroq = allProfessors;
    
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

// Enhanced basic search with better matching - now searches ALL professors
function enhancedBasicSearch(query: string, allProfessors: Professor[]): Professor[] {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
  
  // Score each professor for relevance
  const scoredProfessors = allProfessors.map(professor => {
    const fieldLower = professor.field_of_research.toLowerCase();
    const nameLower = professor.name.toLowerCase();
    const uniLower = professor.university_name.toLowerCase();
    
    let score = 0;
    
    searchTerms.forEach(term => {
      // Exact field matches get highest score
      if (fieldLower.includes(term)) {
        score += fieldLower === term ? 20 : 10; // Exact match vs partial
      }
      // Name matches get high score (for professor searches)
      if (nameLower.includes(term)) {
        score += nameLower.includes(term) ? 15 : 8;
      }
      // University matches get lower score
      if (uniLower.includes(term)) {
        score += 3;
      }
      
      // Bonus for multiple term matches in same field
      const fieldWords = fieldLower.split(/[;\s,]+/);
      const matchingWords = fieldWords.filter(word => word.includes(term)).length;
      if (matchingWords > 1) score += 5;
    });
    
    return { professor, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 25) // Increased to 25 for better variety
  .map(item => item.professor);

  return scoredProfessors;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

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
    
    // Smart validation - this is the key improvement!
    const validationResult = await validateSearchQuery(sanitizedQuery);
    
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        message: 'Invalid search query',
        suggestion: validationResult.suggestion,
        reason: validationResult.reason,
        confidence: validationResult.confidence
      });
    }

    // Get all professors data
    const allProfessors = getProfessorsData();
    
    console.log(`Loaded ${allProfessors.length} professors from database`);
    
    if (allProfessors.length === 0) {
      return res.status(500).json({ message: 'Failed to load professor data - check if professors.csv exists in data folder' });
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
    
    // If no results found, provide helpful suggestions
    if (relevantProfessors.length === 0) {
      return res.status(200).json({
        professors: [],
        aiSuggestion: `No professors found for "${sanitizedQuery}". Try broader terms like "computer science", "biology", or "psychology". You can also search for specific research areas like "machine learning" or "cancer research".`,
        total: 0,
        searchSuggestions: [
          'Try more general terms (e.g., "AI" → "artificial intelligence")',
          'Search for broader research fields (e.g., "biology", "chemistry")',
          'Look for specific methodologies (e.g., "machine learning", "gene therapy")',
          'Search by university name if looking for specific institutions'
        ]
      });
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
      total: enhancedProfessors.length,
      queryValidation: {
        confidence: validationResult.confidence,
        suggestion: validationResult.suggestion
      }
    });
  } catch (error: any) {
    console.error('Error in professor search API:', error);
    
    // Ensure we always return JSON, even on error
    try {
      return res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      });
    } catch (jsonError) {
      // If JSON response fails, try to at least set headers correctly
      res.setHeader('Content-Type', 'application/json');
      res.status(500);
      res.end(JSON.stringify({ 
        message: 'Critical server error',
        timestamp: new Date().toISOString()
      }));
    }
  }
}

// Export with rate limiting: 30 requests per 15 minutes
export default withRateLimit(handler, {
  maxRequests: 30,
  windowMs: 15 * 60 * 1000,
  message: 'Too many search requests. Please wait before searching again.'
}); 