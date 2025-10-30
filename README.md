# Simple Studio - AI Video Generator

A minimalist AI-powered video generation platform built with Next.js 15, Supabase, and deployed on Vercel.

## Features

- **Simple Interface**: One input field to describe your story
- **Real-time Status**: Live database connection monitoring
- **Scalable Architecture**: Built on Next.js 15 with Supabase backend
- **Production Ready**: Optimized for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Future AI Integration**: Google AI (Gemini, Imagen 3, Veo 2)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd simpleStudio
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Once created, go to **Project Settings > API**
4. Copy your **Project URL** and **anon/public key**

### 3. Run Database Migration

In your Supabase project:
1. Go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL

This creates:
- `generations` table for storing video data
- Indexes for performance
- Test function to verify connection

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see:
- ✅ Database Connected (green badge)
- ✅ App Deployed (green badge)

## Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

2. Go to [https://vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

Vercel will automatically:
- Build your app
- Deploy to production
- Provide a live URL
- Auto-deploy on every git push

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add environment variables when prompted.

## Project Structure

```
simpleStudio/
├── app/
│   ├── globals.css          # Tailwind styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with DB status
├── lib/
│   └── supabase.ts          # Supabase client config
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── .env.example             # Environment template
├── .env.local               # Your credentials (gitignored)
└── vercel.json              # Vercel config
```

## Database Schema

### `generations` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| prompt | TEXT | User input text |
| video_url | TEXT | Generated video URL |
| status | TEXT | processing/completed/failed |
| created_at | TIMESTAMP | Creation time |
| completed_at | TIMESTAMP | Completion time |
| metadata | JSONB | Additional data |

## Verification Checklist

After deployment, verify:

- [ ] App loads at your Vercel URL
- [ ] Database connection badge shows green ✅
- [ ] No console errors
- [ ] Input field is responsive
- [ ] Tailwind styles are working

## Troubleshooting

### Database Connection Error

1. Check environment variables in Vercel dashboard
2. Verify Supabase URL and key are correct
3. Ensure SQL migration was run in Supabase
4. Check Supabase project is active (not paused)

### Build Errors on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript has no errors: `npm run build` locally

### Local Development Issues

1. Make sure `.env.local` exists and has correct values
2. Run `npm install` to ensure all dependencies are installed
3. Clear Next.js cache: `rm -rf .next`

## Next Steps

This is the MVP foundation. Future enhancements:

1. **AI Integration**: Add Google AI APIs for video generation
2. **User Authentication**: Add Supabase Auth
3. **Video Storage**: Use Supabase Storage for videos
4. **Queue System**: Add Inngest for background processing
5. **Gallery**: Show recent generations
6. **Share Feature**: One-click sharing

## Support

For issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## License

MIT
