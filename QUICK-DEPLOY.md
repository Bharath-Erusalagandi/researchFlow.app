# 🚀 Quick Deploy to Netlify - uniFlow

## ⚡ Fast Track Deployment

### 1. Push to Git (2 minutes)
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Netlify Setup (5 minutes)
1. Go to [netlify.com](https://netlify.com)
2. "New site from Git" → Connect GitHub → Select this repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

### 3. Environment Variables (3 minutes)
Copy-paste into Netlify Environment Variables:

```
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_SUPABASE_URL=https://vutajjxzfbiocaxmscbz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dGFqanh6ZmJpb2NheG1zY2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTgwNjgsImV4cCI6MjA2MzE3NDA2OH0.oouUhiQC8Zpb1eTnX5cj7wwjZfLE_ZzhYKxMpp1GEmI
NEXT_PUBLIC_GOOGLE_CLIENT_ID=52260082776-t645l465pv40h5b5mpkocrqerd5c1ao5.apps.googleusercontent.com
```

### 4. Deploy & Test (2 minutes)
1. Click "Deploy site"
2. Wait for green "Published" status
3. Test your live site!

### 5. Custom Domain "uniFlow" (1 minute)
- **Option A:** Own domain → Domain settings → Add custom domain
- **Option B:** Netlify subdomain → Site settings → Change site name to "uniflow"

## 🎯 Your Live Site
After deployment, your site will be live at:
- `https://uniflow.netlify.app` (Netlify subdomain)
- `https://uniflow.com` (if you own the domain)

## ✅ Success Checklist
- [ ] Site loads correctly
- [ ] HTTPS is working
- [ ] Search functionality works
- [ ] Google OAuth login works
- [ ] API endpoints respond correctly

## 🚨 If Something Goes Wrong
1. Check Netlify build logs
2. Verify environment variables are set
3. Test locally first: `npm run build`

**Total Time: ~15 minutes** ⏱️

You're live! 🎉 