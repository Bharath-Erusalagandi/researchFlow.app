# Sign-Up Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Email address is invalid" Error

**Problem**: You're seeing an error like `AuthApiError: Email address "example@gmail.com" is invalid`

**Causes & Solutions**:

1. **Missing Environment Variables** (Most Common)
   - **Cause**: Supabase environment variables are not configured
   - **Solution**: Run the environment setup script:
     ```bash
     npm run setup-env
     ```
   - Follow the prompts to enter your Supabase credentials

2. **Invalid Email Format**
   - **Cause**: Email contains invalid characters or format
   - **Solution**: 
     - Use a standard email format: `user@domain.com`
     - Avoid special characters in the email
     - Make sure there are no spaces before/after the email

3. **Supabase Configuration Issues**
   - **Cause**: Supabase project settings may restrict email domains
   - **Solution**: Check your Supabase dashboard:
     - Go to Authentication → Settings
     - Check "Allow email confirmations"
     - Verify email domain restrictions

### 🔧 Environment Setup

#### Method 1: Automated Setup (Recommended)
```bash
npm run setup-env
```

#### Method 2: Manual Setup
1. Create a `.env.local` file in your project root
2. Add these variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Google OAuth (Optional)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

#### Getting Supabase Credentials:
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy your "URL" and "anon/public" key

### 🔍 Development Mode

**If you don't have Supabase configured**, the app will run in development mode:
- ✅ Mock authentication (bypasses real signup)
- ✅ Local storage for user data
- ✅ All features work for testing
- ⚠️ Data is not persistent across devices

### 🚀 Testing Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the signup flow**:
   - Visit `/signup` or `/login`
   - Try signing up with email/password
   - Check console for any error messages

3. **Check environment variables**:
   ```bash
   npm run test-env
   ```

### 📧 Email Confirmation

If you successfully sign up but can't log in:
1. Check your email for a confirmation link
2. Click the link to activate your account
3. Return to the app and try logging in

**If you don't receive the confirmation email**:
- Check your spam folder
- Verify the email address is correct
- Check Supabase dashboard → Authentication → Users

### 🔒 Common Supabase Settings

In your Supabase dashboard, ensure:
- **Email confirmations**: Enabled (if you want email verification)
- **Email confirmations**: Disabled (for immediate access)
- **User registration**: Enabled
- **Email domain restrictions**: None (unless specific domains needed)

### 🆘 Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Verify your Supabase project** is active and not paused
3. **Test with a different email address**
4. **Try the Google sign-up option** if configured

### 💡 Quick Fix for Development

If you just want to test the app without setting up authentication:
1. Don't configure Supabase environment variables
2. The app will automatically use mock authentication
3. You can sign up with any email/password combination
4. All features will work for local testing

### 📝 Need Help?

- Check the console logs for detailed error messages
- Review your Supabase project settings
- Ensure all environment variables are correctly set
- Try the automated setup script: `npm run setup-env`

## Success Indicators

✅ **You know it's working when**:
- No console errors during signup
- Successful redirect to `/search` page after signup
- User data appears in Supabase dashboard (if configured)
- Can access personalized features

---

*Last updated: $(date)* 