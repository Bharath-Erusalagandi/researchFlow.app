# Research Connect - Setup Guide

This guide will help you set up the required environment variables for authentication with Supabase.

## Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com) if you don't have one)
2. Node.js and npm installed on your system

## Setting Up Supabase and Environment Variables

### Step 1: Create a Supabase Project

1. Log in to [Supabase](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details and create the project
4. Wait for the project to be initialized (this may take a few minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the gear icon (Settings) in the left sidebar
2. Go to "API" in the submenu
3. Here you'll find your "Project URL" and "API Keys"
4. Copy the "Project URL" (this will be your `NEXT_PUBLIC_SUPABASE_URL`)
5. Copy the "anon public" key (this will be your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Step 3: Configure Google OAuth (Optional for Google Sign-In)

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Find "Google" and click the toggle to enable it
3. You'll need to set up a Google OAuth application:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized JavaScript origins:
     - For development: `http://localhost:3000` (or whatever port you're using)
     - For production: Your production domain
   - Add authorized redirect URIs:
     - Copy the "Redirect URL" shown in your Supabase Google provider settings
   - Click "Create" and note your Client ID and Client Secret
4. Enter the Client ID and Client Secret in the Supabase Google provider settings
5. Click "Save"

### Step 4: Set Environment Variables in Your Project

Run our helper script to set up your environment variables:

```bash
npm run setup-env
```

When prompted:
- Enter your Supabase URL (the "Project URL" you copied earlier)
- Enter your Supabase Anon Key (the "anon public" key you copied earlier)

This will create a `.env.local` file in your project root.

### Step 5: Restart Your Development Server

Stop your current development server (if it's running) by pressing `Ctrl+C` in the terminal where it's running, then start it again:

```bash
npm run dev
```

## Verifying Your Setup

1. Your application should now start without any "Missing Supabase environment variables" errors
2. Navigate to the login page
3. Try signing in with Google (if you configured it)
4. After successful authentication, you should be redirected to the dashboard

## Troubleshooting

### Common Issues

#### "Missing Supabase environment variables" Error

- Make sure you've run `npm run setup-env` and provided the correct URL and key
- Verify that your `.env.local` file exists and contains the correct values
- Restart your development server after making changes to environment variables

#### Google Sign-In Not Working

- Verify that you've correctly set up the Google OAuth credentials in both Google Cloud Console and Supabase
- Check that the redirect URIs match exactly
- Look for errors in your browser console

#### Error in Development Mode

If you see development mode warnings but the app seems to work:
- This is normal if you haven't set up the environment variables yet
- The app falls back to mock authentication in development mode
- For production, you must properly configure Supabase

#### Other Issues

If you encounter any other issues:
1. Check the browser console for errors
2. Check the terminal where your development server is running for server-side errors
3. Verify your Supabase project settings

## Next Steps

Once your authentication is working correctly, you might want to:

1. Customize the profile page to save additional user information
2. Implement role-based access control
3. Add additional authentication providers through Supabase
4. Set up a database schema for your application data

For more details on Supabase authentication, see [Supabase Auth Documentation](https://supabase.com/docs/guides/auth). 