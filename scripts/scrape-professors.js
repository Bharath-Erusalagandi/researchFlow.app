// Simple script to help gather professor information
// Run with: node scripts/scrape-professors.js

const axios = require('axios');
const cheerio = require('cheerio');

// Example: MIT EECS faculty scraper template
async function scrapeMITFaculty() {
  try {
    console.log('This is a template for scraping university faculty pages');
    console.log('Always check robots.txt and terms of service first!');
    
    // Example structure for manual data collection
    const facultyTemplate = {
      name: 'Dr. [Name]',
      field_of_research: '[Research areas from faculty page]',
      university_name: '[University]',
      email: '[email from contact info]',
      official_url: '[faculty profile URL]'
    };
    
    console.log('Faculty data template:', facultyTemplate);
    
    // Manual approach recommendations:
    console.log('\nBest manual approach:');
    console.log('1. Visit university faculty directory');
    console.log('2. Find professors in relevant departments');
    console.log('3. Copy: name, research areas, email, profile URL');
    console.log('4. Add to your CSV file');
    
    // Top university faculty directories
    const topDirectories = [
      'https://www.eecs.mit.edu/people/faculty-advisors/',
      'https://engineering.stanford.edu/people/faculty/',
      'https://seas.harvard.edu/faculty',
      'https://engineering.princeton.edu/faculty/',
      'https://www.eas.caltech.edu/people/faculty',
      'https://engineering.yale.edu/faculty',
      'https://www.cs.cmu.edu/directory/faculty',
      'https://engineering.jhu.edu/faculty/',
      'https://www.mccormick.northwestern.edu/faculty/',
      'https://www.engineering.cornell.edu/faculty'
    ];
    
    console.log('\nTop university faculty directories:');
    topDirectories.forEach(url => console.log(`- ${url}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Helper function to format professor data for CSV
function formatProfessorForCSV(professorData) {
  return {
    name: professorData.name,
    field_of_research: professorData.research.join('; '), // Join multiple areas
    university_name: professorData.university,
    email: professorData.email,
    official_url: professorData.profileUrl
  };
}

// Manual data entry helper
function addProfessorsToCSV() {
  console.log('\nTo add professors to your CSV:');
  console.log('1. Open data/professors.csv');
  console.log('2. Add new rows with this format:');
  console.log('   name,field_of_research,university_name,email,official_url');
  console.log('3. Ensure emails are verified and working');
  console.log('4. Use semicolons to separate multiple research areas');
}

if (require.main === module) {
  scrapeMITFaculty();
  addProfessorsToCSV();
} 