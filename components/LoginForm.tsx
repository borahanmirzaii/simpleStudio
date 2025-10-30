'use client'

import { useState } from 'react'
import { NEXT_PUBLIC_ALLOWED_EMAIL as ALLOWED_EMAIL } from '@/lib/config'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error)
        return
      }

      setStatus('success')
      setMessage(data.message)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to send login link')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-light mb-2">🎬 Simple Studio</h1>
          <p className="text-white/60 text-sm">AI-powered video generation</p>
        </div>

        {status === 'success' ? (
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-green-400 text-xl font-semibold mb-2">Check Your Email!</h3>
              <p className="text-green-300/80 text-sm mb-4">{message}</p>
              <p className="text-white/60 text-xs">
                Click the link in your email to log in
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <label className="block text-white/80 text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ALLOWED_EMAIL}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-white/60 transition-colors"
                required
                disabled={status === 'loading'}
              />

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-xs">
                  🔒 <strong>Restricted Access:</strong> Only {ALLOWED_EMAIL} can use this app
                </p>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>
        )}

        <p className="text-white/40 text-xs text-center mt-8">
          We&rsquo;ll send you a magic link to log in securely
        </p>
      </div>
    </div>
  )
}
