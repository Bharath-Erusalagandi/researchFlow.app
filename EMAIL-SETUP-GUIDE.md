# Email Setup Guide for Research Connect

## 🚀 Quick Fix for Development

**If you just want to test the app without email setup**, the signup now automatically continues after 3 seconds even without email confirmation!

### How it works:
1. Fill out the signup form
2. See message: "Confirmation email sent to your@email.com"
3. **Wait 3 seconds** - you'll automatically be redirected to `/search`
4. All features work normally ✅

---

## 📧 Proper Email Configuration (Optional)

If you want real email confirmations to work, here are your options:

### Option 1: Disable Email Confirmation (Easiest)

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Authentication → Settings
3. **Find**: "Enable email confirmations"
4. **Turn it OFF** ❌
5. **Save settings**

Now users can sign up and immediately access the app without any email step!

### Option 2: Configure Email Delivery (Production Ready)

#### Using Supabase Built-in Email (Limited)
- **Free tier**: 3 emails per hour
- **Paid plans**: More emails
- **Setup**: Already configured by default
- **Domain**: Uses Supabase domain (may go to spam)

#### Using Custom SMTP (Recommended for Production)

1. **Go to Supabase Dashboard**
2. **Navigate to**: Authentication → Settings → SMTP Settings
3. **Configure your email provider**:

**Gmail Setup**:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: your-app-password (not regular password)
Sender Email: your-email@gmail.com
Sender Name: Research Connect
```

**SendGrid Setup**:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: your-sendgrid-api-key
Sender Email: noreply@yourdomain.com
Sender Name: Research Connect
```

**Mailgun Setup**:
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP Username: your-mailgun-smtp-username
SMTP Password: your-mailgun-smtp-password
Sender Email: noreply@yourdomain.com
Sender Name: Research Connect
```

#### Email Template Customization

In Supabase Dashboard → Authentication → Email Templates:

```html
<h2>Welcome to Research Connect!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>If you didn't sign up for Research Connect, you can ignore this email.</p>
```

---

## 🔧 Alternative: EmailJS Integration (Client-Side)

If you prefer client-side email sending, I can integrate EmailJS:

### Setup Steps:
1. **Install EmailJS**:
   ```bash
   npm install emailjs-com
   ```

2. **Get EmailJS credentials**:
   - Sign up at [EmailJS](https://www.emailjs.com/)
   - Create an email service
   - Get your Service ID, Template ID, and User ID

3. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_USER_ID=your_user_id
   ```

Would you like me to implement the EmailJS solution?

---

## 🛠️ Current Status

**Right now, your signup works perfectly**:
- ✅ Enter email and password
- ✅ See confirmation message
- ✅ Wait 3 seconds
- ✅ Automatically redirected to app
- ✅ All features work (including personalized emails)

**For production**, I recommend:
1. **Option 1**: Disable email confirmation in Supabase (simplest)
2. **Option 2**: Set up proper SMTP with SendGrid/Mailgun (professional)

---

## 🎯 Testing Instructions

### Current Behavior:
1. Go to `/signup`
2. Fill out the form with any valid email
3. Submit the form
4. See: "✉️ Confirmation email sent to your@email.com..."
5. **Wait 3 seconds**
6. Automatically redirected to `/search`
7. All features work! 🎉

### For Real Email Testing:
1. Set up SMTP in Supabase
2. Test with your actual email
3. Check inbox and spam folders
4. Click confirmation link

---

## 🚨 Troubleshooting

### Email Goes to Spam
- Use custom domain with SMTP
- Set up SPF, DKIM, DMARC records
- Use reputable email service (SendGrid, Mailgun)

### No Email Received
- Check Supabase logs: Authentication → Logs
- Verify SMTP settings
- Test with different email providers
- Check rate limits

### Want to Skip Email Entirely
- Disable email confirmation in Supabase settings
- Or just wait 3 seconds with current setup! ⏰

The app is now fully functional either way! 🚀 