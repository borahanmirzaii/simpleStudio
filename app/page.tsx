'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [dbMessage, setDbMessage] = useState('')
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  async function checkDatabaseConnection() {
    try {
      // Test the connection by calling the test function
      const { data, error } = await supabase.rpc('test_connection')

      if (error) {
        setDbStatus('error')
        setDbMessage(error.message)
      } else {
        setDbStatus('connected')
        setDbMessage(data || 'Connected successfully!')
      }
    } catch (err) {
      setDbStatus('error')
      setDbMessage(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Status Badge */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              dbStatus === 'error' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-white text-sm">
              {dbStatus === 'connected' ? '✅ Database Connected' :
               dbStatus === 'error' ? '❌ Database Error' :
               '🔄 Checking Connection...'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white text-sm">✅ App Deployed</span>
          </div>
        </div>

        {/* Error Message */}
        {dbStatus === 'error' && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{dbMessage}</p>
            <p className="text-red-300/60 text-xs mt-2">
              Make sure to set your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.
            </p>
          </div>
        )}

        {/* Main Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Describe your story..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 text-4xl text-white font-light pb-4 outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && prompt.trim()) {
                alert('Video generation will be implemented next!')
              }
            }}
          />
          <p className="text-white/40 mt-4 text-sm">
            Press Enter to generate (Coming soon...)
          </p>
        </div>

        {/* Info */}
        <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <h2 className="text-white text-lg font-semibold mb-2">🎬 Simple Studio</h2>
          <p className="text-white/60 text-sm mb-4">
            AI-powered video generation platform. Turn your ideas into stunning videos.
          </p>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-white/10 rounded text-white/80 text-xs">
              Next.js 15
            </div>
            <div className="px-3 py-1 bg-white/10 rounded text-white/80 text-xs">
              Supabase
            </div>
            <div className="px-3 py-1 bg-white/10 rounded text-white/80 text-xs">
              Vercel
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {dbStatus === 'connected' && (
          <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">✓ {dbMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
