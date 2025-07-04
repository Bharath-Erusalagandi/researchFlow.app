#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Checking Environment Variables...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

let missingVars = [];

if (!supabaseUrl) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!googleClientId) {
  missingVars.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
}

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(variable => {
    console.log(`   - ${variable}`);
  });
  console.log('\n👉 Please run: npm run setup-env');
} else {
  console.log('✅ Supabase URL: ' + maskString(supabaseUrl));
  console.log('✅ Supabase Anon Key: ' + maskString(supabaseAnonKey));
  console.log('✅ Google Client ID: ' + maskString(googleClientId));
  console.log('\n🎉 All required environment variables are set!');
}

console.log('\n');

// Helper function to mask sensitive information
function maskString(str) {
  if (!str) return '';
  if (str.length <= 8) return '********';
  
  // Show first 4 and last 4 characters, mask the rest
  return str.substring(0, 4) + '...' + str.substring(str.length - 4);
} 