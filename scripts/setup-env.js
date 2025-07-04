#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

// Check if the file already exists
if (fs.existsSync(ENV_FILE_PATH)) {
  console.log('⚠️  .env.local file already exists.');
  rl.question('Do you want to overwrite it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log('Operation cancelled. Existing .env.local file was not modified.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  rl.question('Enter your Supabase URL: ', (supabaseUrl) => {
    rl.question('Enter your Supabase Anon Key: ', (supabaseAnonKey) => {
      rl.question('Enter your Google Client ID (from Google Cloud Console): ', (googleClientId) => {
        const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${googleClientId}

# Other Environment Variables
# Add additional environment variables below if needed
`;

        fs.writeFileSync(ENV_FILE_PATH, envContent);
        console.log('✅ .env.local file has been created successfully.');
        console.log(`📝 File location: ${ENV_FILE_PATH}`);
        rl.close();
      });
    });
  });
}

rl.on('close', () => {
  console.log('\n👋 Setup completed. Happy coding!');
  process.exit(0);
}); 