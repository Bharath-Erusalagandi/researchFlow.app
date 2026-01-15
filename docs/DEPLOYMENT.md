# 🚀 Netlify Deployment Guide for uniFlow

This guide will walk you through deploying your Research Connect application to Netlify with the custom domain "uniFlow".

## 📋 Pre-Deployment Checklist

✅ **Application is security-hardened**
✅ **Dependencies updated to latest secure versions**
✅ **Netlify configuration files created**
✅ **Environment variables documented**

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment with security enhancements"
   git push origin main
   ```

2. **Ensure your repository is on GitHub, GitLab, or Bitbucket**

### Step 2: Connect to Netlify

1. **Go to [Netlify](https://netlify.com) and sign up/login**

2. **Click "New site from Git"**

3. **Choose your Git provider and authorize Netlify**

4. **Select your `Researchconnect` repository**

5. **Configure build settings:**
   - **Build command:** `npm run build-netlify`
   - **Publish directory:** `.next`
   - **Node version:** `18`

### Step 3: Set Environment Variables

In Netlify dashboard, go to **Site settings > Environment variables** and add:

#### Required Variables:
```
GROQ_API_KEY=[your-groq-api-key]
NEXT_PUBLIC_SUPABASE_URL=https://vutajjxzfbiocaxmscbz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dGFqanh6ZmJpb2NheG1zY2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTgwNjgsImV4cCI6MjA2MzE3NDA2OH0.oouUhiQC8Zpb1eTnX5cj7wwjZfLE_ZzhYKxMpp1GEmI
NEXT_PUBLIC_GOOGLE_CLIENT_ID=52260082776-t645l465pv40h5b5mpkocrqerd5c1ao5.apps.googleusercontent.com
```

### Step 4: Deploy Your Site

1. **Click "Deploy site"**
2. **Wait for build to complete** (usually 2-5 minutes)
3. **Verify deployment at the provided `.netlify.app` URL**

### Step 5: Configure Custom Domain "uniFlow"

#### Option A: If you own uniflow.com domain

1. **Go to Site settings > Domain management**
2. **Click "Add custom domain"**
3. **Enter your domain:** `uniflow.com`
4. **Configure DNS records as instructed:**
   - Add A record pointing to Netlify's IP
   - Add CNAME for www subdomain
5. **SSL certificate will be automatically provisioned**

#### Option B: Use Netlify subdomain

1. **Go to Site settings > Domain management**
2. **Click "Options > Edit site name"**
3. **Change to:** `uniflow`
4. **Your site will be available at:** `uniflow.netlify.app`

### Step 6: Verify Security Features

After deployment, verify these security features are working:

1. **HTTPS redirect:** Visit `http://` version - should redirect to `https://`
2. **Security headers:** Check with [Security Headers](https://securityheaders.com)
3. **Rate limiting:** Test API endpoints for rate limiting responses
4. **Authentication:** Test Google OAuth login flow

## 🌐 DNS Configuration (For Custom Domain)

If using your own domain, configure these DNS records:

```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     uniflow.netlify.app
```

## 🔒 Post-Deployment Security

### 1. Monitor Your Application
- Set up Netlify Analytics
- Monitor error logs in Netlify dashboard
- Set up uptime monitoring

### 2. Regular Maintenance
- Update dependencies monthly
- Monitor security advisories
- Review access logs periodically

### 3. Backup Strategy
- Your code is backed up in Git
- Database backups through MongoDB Atlas
- Environment variables documented securely

## 🚨 Troubleshooting

### Build Failures
1. Check build logs in Netlify dashboard
2. Verify environment variables are set correctly
3. Test build locally: `npm run build-netlify`

### API Issues
1. Verify all environment variables are set
2. Check function logs in Netlify dashboard
3. Test API endpoints individually

### Domain Issues
1. Verify DNS propagation (can take 24-48 hours)
2. Check domain configuration in Netlify
3. Ensure SSL certificate is active

## 📞 Support

If you encounter issues:
1. Check Netlify documentation
2. Review build and function logs
3. Test locally with production environment variables
4. Contact Netlify support if needed

## 🎉 Success!

Your Research Connect application should now be live at your uniFlow domain with:
- ✅ Secure HTTPS
- ✅ Custom domain
- ✅ Security headers
- ✅ Rate limiting
- ✅ Authentication
- ✅ All features working

Welcome to production! 🚀 