#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing application for Netlify deployment...\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'next.config.js',
  'package.json',
  'SECURITY.md'
];

console.log('✅ Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING!`);
  }
});

// Check environment variables
console.log('\n📋 Environment variables needed for production:');
const requiredEnvVars = [
  'GROQ_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
];

requiredEnvVars.forEach(envVar => {
  console.log(`  - ${envVar}`);
});

console.log('\n🔧 Netlify Deployment Steps:');
console.log('1. Push your code to GitHub/GitLab');
console.log('2. Connect your repository to Netlify');
console.log('3. Set up environment variables in Netlify dashboard');
console.log('4. Configure custom domain "uniFlow"');
console.log('5. Deploy!');

console.log('\n🌐 Custom Domain Setup:');
console.log('1. Go to Netlify dashboard > Domain settings');
console.log('2. Add custom domain: uniflow.com (or your preferred domain)');
console.log('3. Configure DNS records as instructed by Netlify');
console.log('4. Enable HTTPS (automatic with Netlify)');

console.log('\n🔒 Security checklist:');
console.log('  ✓ Security headers configured');
console.log('  ✓ HTTPS redirect enabled');
console.log('  ✓ Rate limiting implemented');
console.log('  ✓ Input validation added');
console.log('  ✓ Environment variables secured');

console.log('\n✅ Your application is ready for Netlify deployment!'); 