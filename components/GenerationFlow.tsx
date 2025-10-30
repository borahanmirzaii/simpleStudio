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
  const [status, setStatus] = useState<'generating' | 'success' | 'error' | 'generating-video' | 'video-ready'>('generating')
  const [currentStep, setCurrentStep] = useState(0)
  const [story, setStory] = useState('')
  const [scenes, setScenes] = useState<Scene[]>([])
  const [error, setError] = useState('')
  const [generationId, setGenerationId] = useState('')
  const [videoOperation, setVideoOperation] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoProgress, setVideoProgress] = useState(0)

  const steps = [
    { icon: '✍️', label: 'Writing story', key: 'writing' },
    { icon: '🎨', label: 'Creating scenes', key: 'scenes' },
    { icon: '🎬', label: 'Generating visuals', key: 'visuals' },
    { icon: '✨', label: 'Finalizing', key: 'final' }
  ]

  // Start generation when component mounts
  useState(() => {
    generateStory()
  })

  async function generateStory() {
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
      setGenerationId(data.generation_id || '')
      setCurrentStep(3)
      await new Promise(resolve => setTimeout(resolve, 500))

      setStatus('success')

    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  async function generateVideo() {
    if (!scenes || scenes.length === 0) {
      setError('No scenes available for video generation')
      return
    }

    setStatus('generating-video')
    setVideoProgress(0)

    try {
      // Use the first scene for video generation
      const firstScene = scenes[0]
      const videoPrompt = `${firstScene.description}. ${firstScene.image_prompt}`

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          prompt: videoPrompt,
          generationId: generationId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Video generation failed')
      }

      setVideoOperation(data.operation)

      // Start polling for video completion
      pollVideoStatus(data.operation)

    } catch (err) {
      console.error('Video generation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  async function pollVideoStatus(operationName: string) {
    const maxAttempts = 60 // Poll for up to 10 minutes (60 * 10 seconds)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch('/api/check-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ operationName })
        })

        const data = await response.json()

        if (data.done) {
          setVideoUrl(data.videoUrl || '')
          setStatus('video-ready')
          setVideoProgress(100)
        } else {
          attempts++
          setVideoProgress(Math.min((attempts / maxAttempts) * 100, 95))

          if (attempts < maxAttempts) {
            // Continue polling every 10 seconds
            setTimeout(poll, 10000)
          } else {
            throw new Error('Video generation timeout')
          }
        }
      } catch (err) {
        console.error('Error checking video status:', err)
        setError(err instanceof Error ? err.message : 'Failed to check video status')
        setStatus('error')
      }
    }

    poll()
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

  // Video generation in progress
  if (status === 'generating-video') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4 animate-pulse">🎬</div>
            <h2 className="text-white text-3xl font-light mb-2">Generating Video...</h2>
            <p className="text-white/60 text-sm">This may take 2-5 minutes</p>
          </div>

          <div className="mb-8">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            <p className="text-white/60 text-sm text-center mt-4">
              {Math.round(videoProgress)}% complete
            </p>
          </div>

          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              🎥 Veo 3.1 is creating your video from the first scene...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Video ready
  if (status === 'video-ready') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-white text-3xl font-light mb-2">Video Ready!</h2>
            <p className="text-white/60 text-sm">Your AI-generated video is complete</p>
          </div>

          {videoUrl && (
            <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
              <video
                controls
                className="w-full rounded-lg"
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            {videoUrl && (
              <a
                href={videoUrl}
                download="generated-video.mp4"
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
              >
                Download Video
              </a>
            )}
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

          {/* Video Generation */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
            <h3 className="text-purple-400 text-lg font-semibold mb-2">🎥 Ready for Video?</h3>
            <p className="text-white/60 text-sm mb-4">
              Generate an AI video from your first scene using Veo 3.1 (takes 2-5 minutes)
            </p>
            <button
              onClick={generateVideo}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all"
            >
              Generate Video with Veo 3.1
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onReset}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Create Another Story
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
