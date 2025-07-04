# 🔐 Google OAuth Credentials Update

## Updated Google OAuth Configuration

### **Client Credentials:**
- **Client ID:** `52260082776-t645l465pv40h5b5mpkocrqerd5c1ao5.apps.googleusercontent.com`
- **Client Secret:** `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`

## 🚀 Netlify Environment Variables Update

Since your Netlify is connected to GitHub, you need to update the environment variables in your Netlify dashboard:

### **Step 1: Go to Netlify Dashboard**
1. Visit [app.netlify.com](https://app.netlify.com)
2. Select your site (`flowresearch`)
3. Go to **Site settings** → **Environment variables**

### **Step 2: Update Google Client ID**
Find `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and update it to:
```
52260082776-t645l465pv40h5b5mpkocrqerd5c1ao5.apps.googleusercontent.com
```

### **Step 3: Add Google Client Secret (if needed)**
If your application uses server-side Google authentication, add:
```
GOOGLE_CLIENT_SECRET=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
```

### **Step 4: Redeploy**
After updating environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or simply push a new commit to GitHub (auto-deploy)

## 🔍 Critical: Google Cloud Console Configuration

### **Exact Settings Required in Google Cloud Console:**

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Navigate to APIs & Services → Credentials**
3. **Find your OAuth 2.0 Client ID:** `52260082776-t645l465pv40h5b5mpkocrqerd5c1ao5`
4. **Click to edit it**

### **Set EXACTLY these URLs:**

**Authorized JavaScript origins:**
```
https://flowresearch.netlify.app
```

**Authorized redirect URIs:**
```
https://flowresearch.netlify.app
https://flowresearch.netlify.app/auth/callback
```

⚠️ **IMPORTANT:** No localhost, no other domains - ONLY the Netlify URLs above!

## 🔐 OAuth Consent Screen Setup

1. **Go to APIs & Services → OAuth consent screen**
2. **Ensure it's configured with:**
   - **User Type:** External (for public app)
   - **Application name:** Research Flow or uniFlow
   - **Authorized domains:** `netlify.app`
3. **Add test users:** `mightymonarch07@gmail.com`
4. **Publishing status:** In production OR add yourself as test user

## 🐛 Fix "OAuth client was not found" Error

This error means Google Cloud Console configuration is incorrect. Follow these EXACT steps:

### **Step 1: Delete Old Configurations**
✅ You already did this

### **Step 2: Verify Current Client ID**
In Google Cloud Console, confirm you see:
```
52260082776-t645l465pv40h5b5mpkocrqerd5c1ao5.apps.googleusercontent.com
```

### **Step 3: Configure URLs (CRITICAL)**
Set EXACTLY these URLs in your OAuth client:

**JavaScript origins:**
```
https://flowresearch.netlify.app
```

**Redirect URIs:**
```
https://flowresearch.netlify.app
https://flowresearch.netlify.app/auth/callback
```

### **Step 4: Save and Wait**
- Click **SAVE** in Google Cloud Console
- Wait 5-10 minutes for changes to propagate
- Test authentication again

## ✅ Success Checklist

- [ ] Updated `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Netlify
- [ ] Added `GOOGLE_CLIENT_SECRET` in Netlify (if needed)
- [ ] Set ONLY Netlify URLs in Google Cloud Console (no localhost)
- [ ] Configured OAuth consent screen
- [ ] Waited 5-10 minutes for propagation
- [ ] Tested Google login on live site

## 🎯 Final Test

1. **Go to:** https://flowresearch.netlify.app
2. **Click Google Sign-In**
3. **Should redirect to Google without errors**
4. **After login, should return to your app**

If you still get "OAuth client was not found", the Client ID in Google Cloud Console doesn't match the one in your Netlify environment variables. 