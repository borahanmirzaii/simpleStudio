'use client'

import { useState } from 'react'

interface Scene {
  scene_number: number
  description: string
  image_prompt: string
}

interface GenerationFlowProps {
  prompt: string
  session: any
  onReset: () => void
}

export default function GenerationFlow({ prompt, session, onReset }: GenerationFlowProps) {
  const [status, setStatus] = useState<'generating' | 'success' | 'error'>('generating')
  const [currentStep, setCurrentStep] = useState(0)
  const [story, setStory] = useState('')
  const [scenes, setScenes] = useState<Scene[]>([])
  const [error, setError] = useState('')

  const steps = [
    { icon: '✍️', label: 'Writing story', key: 'writing' },
    { icon: '🎨', label: 'Creating scenes', key: 'scenes' },
    { icon: '🎬', label: 'Generating visuals', key: 'visuals' },
    { icon: '✨', label: 'Finalizing', key: 'final' }
  ]

  // Start generation when component mounts
  useState(() => {
    generateVideo()
  })

  async function generateVideo() {
    try {
      setCurrentStep(0)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      // Simulate progress through steps
      setCurrentStep(1)
      await new Promise(resolve => setTimeout(resolve, 500))

      setStory(data.story)
      setCurrentStep(2)
      await new Promise(resolve => setTimeout(resolve, 500))

      setScenes(data.scenes || [])
      setCurrentStep(3)
      await new Promise(resolve => setTimeout(resolve, 500))

      setStatus('success')

    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="text-red-400 text-xl font-semibold mb-2">❌ Generation Failed</h3>
            <p className="text-red-300/80 text-sm mb-4">{error}</p>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-white text-3xl font-light mb-2">Story Generated!</h2>
            <p className="text-white/60 text-sm">Your prompt: &ldquo;{prompt}&rdquo;</p>
          </div>

          {/* Story */}
          <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <h3 className="text-white text-xl font-semibold mb-4">📖 Your Story</h3>
            <p className="text-white/80 text-base leading-relaxed whitespace-pre-wrap">{story}</p>
          </div>

          {/* Scenes */}
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4">🎬 Scene Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenes.map((scene, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/40 text-sm">Scene {scene.scene_number}</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{scene.description}</h4>
                  <p className="text-white/60 text-xs">{scene.image_prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 <strong>Next step:</strong> Add Vertex AI credentials to generate images and videos from these scenes.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onReset}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Generating state
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Prompt Display */}
        <div className="text-center mb-12">
          <p className="text-white/60 text-sm mb-2">Generating from:</p>
          <p className="text-white text-2xl font-light">&ldquo;{prompt}&rdquo;</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-8 mb-8">
          {steps.map((step, i) => (
            <div
              key={step.key}
              className={`flex flex-col items-center transition-opacity duration-300 ${
                i <= currentStep ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div className={`text-4xl mb-2 ${i === currentStep ? 'animate-bounce' : ''}`}>
                {step.icon}
              </div>
              <p className="text-white/80 text-sm">{step.label}</p>
            </div>
          ))}
        </div>

        {/* Loading Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <p className="text-white/40 text-sm text-center mt-4">
          This may take a few seconds...
        </p>
      </div>
    </div>
  )
}
