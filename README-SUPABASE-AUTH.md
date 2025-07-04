# Supabase Authentication Setup

This document explains how to set up and use Supabase authentication in this application.

## Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com) if you don't have one)
2. A Google Cloud Platform account (for Google OAuth)

## Setup Steps

### 1. Set up a Supabase Project

1. Log in to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Make note of your Supabase URL and Anon Key (found in Project Settings > API)

### 2. Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Set up OAuth credentials:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add authorized JavaScript origins:
     - For development: `http://localhost:3000`
     - For production: Your production domain
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/auth/callback`
     - For production: `https://your-domain.com/auth/callback`
   - Copy the Client ID and Client Secret
4. Enter the Client ID and Client Secret in Supabase Auth settings for Google provider

### 3. Set up Environment Variables

Run the setup script:

```bash
npm run setup-env
```

When prompted, enter your Supabase URL and Anon Key.

Alternatively, you can manually create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Flow

### Sign In with Google

The application uses the `@react-oauth/google` package to render the Google Sign-In button. When a user signs in with Google, the flow is:

1. User clicks the Google Sign-In button
2. Google authentication popup appears
3. After successful authentication, Google returns an ID token
4. The ID token is sent to Supabase for verification and user creation/update
5. Supabase creates a session and returns session data
6. The user is redirected to the application dashboard

### Authentication State Management

Supabase handles the session management automatically. The authentication state is checked in the following ways:

1. When the application loads, it checks for an existing session
2. The `onAuthStateChange` event listener updates the UI when the auth state changes

### Protected Routes

Routes are protected using the `withAuth` higher-order component (HOC) that:

1. Checks if the user is authenticated
2. Shows a loading state while checking
3. Redirects to the login page if not authenticated
4. Renders the protected component if authenticated

## Usage Examples

### Sign Out

```javascript
import { supabase } from '@/lib/supabase';

const handleSignOut = async () => {
  await supabase.auth.signOut();
  // Redirect or update UI as needed
};
```

### Get Current User

```javascript
import { supabase } from '@/lib/supabase';

const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return user;
};
```

### Update User Profile

```javascript
import { supabase } from '@/lib/supabase';

const updateProfile = async (updates) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });
  
  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  
  return true;
};
```

## Troubleshooting

### Common Issues

1. **"Invalid OAuth provider" error**: Make sure your Google OAuth credentials are correctly configured in Supabase.

2. **Redirect URI mismatch**: Ensure the redirect URIs match exactly between the Google Cloud Console and Supabase settings.

3. **CORS issues**: For development, ensure you're using `localhost` and not `127.0.0.1`.

### Debugging

To debug authentication issues:

1. Check the browser console for errors
2. Verify environment variables are correctly set
3. Review the Supabase authentication logs in the dashboard
4. Test the authentication flow with the Supabase JavaScript client in the browser console

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://github.com/MomenSherif/react-oauth) 