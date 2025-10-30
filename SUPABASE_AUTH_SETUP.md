# Supabase Authentication Setup Guide

## ⚠️ CRITICAL: Configure Supabase Auth to Protect Your API

Without proper Supabase Auth configuration, **anyone can bypass the login screen** and use your Gemini API credits!

Follow these steps carefully:

---

## Step 1: Enable Email Authentication

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on **Authentication** in the left sidebar
3. Click on **Providers**
4. Make sure **Email** is **ENABLED** (toggle should be green)

---

## Step 2: Configure Site URL

This is **CRITICAL** - without this, magic links won't work!

1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to your deployed Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
   (Replace with your actual Vercel URL)

3. Add **Redirect URLs** (optional but recommended):
   ```
   https://your-app-name.vercel.app
   https://your-app-name.vercel.app/**
   http://localhost:3000 (for local development)
   ```

---

## Step 3: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. You can customize the **Magic Link** template
3. Default template works fine, but you can add your branding

---

## Step 4: Test Authentication Flow

### Local Testing:
```bash
npm run dev
# Visit http://localhost:3000
# Try logging in with borahanmirzaii@gmail.com
# Check your email for the magic link
# Click the link - you should be logged in
```

### Production Testing:
```
1. Visit your Vercel URL
2. Try logging in with a DIFFERENT email (not borahanmirzaii@gmail.com)
   → You should get: "Access restricted"

3. Try logging in with borahanmirzaii@gmail.com
   → You should receive a magic link email

4. Click the magic link
   → You should be redirected back and logged in

5. Try generating a story
   → Should work!

6. Open incognito/private window, visit the app
   → You should see the login screen
   → Trying to use the app without logging in should fail
```

---

## Step 5: Verify Environment Variables in Vercel

Make sure these are set in your Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-key
ALLOWED_EMAIL=borahanmirzaii@gmail.com
```

---

## Troubleshooting

### Problem: "Anyone can still access the app"

**Cause**: Supabase Auth not configured or Site URL is wrong

**Solution**:
1. Double-check Site URL in Supabase matches your Vercel URL
2. Make sure Email provider is enabled
3. Redeploy your Vercel app after changing Supabase settings

### Problem: "Magic link doesn't work"

**Cause**: Site URL mismatch or redirect URL not configured

**Solution**:
1. Check Supabase **Authentication** → **URL Configuration**
2. Site URL must exactly match your deployment URL
3. Add both `https://your-domain.com` and `https://your-domain.com/**` to redirect URLs

### Problem: "Email not being sent"

**Cause**: Supabase email provider not configured or rate-limited

**Solution**:
1. Check **Authentication** → **Providers** → Email is enabled
2. For production, configure a custom SMTP provider (Settings → Auth → SMTP)
3. Supabase's default email has rate limits for free tier

### Problem: "Can generate stories in incognito mode"

**Cause**: API route not properly checking authentication

**Solution**:
1. Make sure you've deployed the latest code with authentication
2. Check browser network tab - API calls should fail with 401 if not authenticated
3. Clear all cookies and try again

---

## Security Checklist

Before going live, verify:

- [ ] Email provider is enabled in Supabase
- [ ] Site URL is correctly set to your Vercel domain
- [ ] Redirect URLs include your domain
- [ ] `ALLOWED_EMAIL` environment variable is set in Vercel
- [ ] You can log in with borahanmirzaii@gmail.com
- [ ] Other emails are rejected
- [ ] Incognito mode shows login screen
- [ ] API calls without auth return 401 error
- [ ] Magic link redirects back to your app

---

## Advanced: Custom SMTP (Recommended for Production)

For better email deliverability and no rate limits:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Use a service like:
   - SendGrid
   - AWS SES
   - Mailgun
   - Resend

3. Configure SMTP credentials
4. Test by sending a magic link

---

## Need Help?

If authentication still isn't working:

1. Check Supabase logs: **Authentication** → **Logs**
2. Check Vercel logs for API errors
3. Open browser DevTools → Network tab
4. Try to log in and see what errors appear

Common errors:
- `Invalid login credentials` → Check Supabase email provider
- `Email link is invalid or has expired` → Check Site URL
- `Authentication required` → Session not persisting (cookie issue)
