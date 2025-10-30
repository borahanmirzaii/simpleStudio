import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '@/lib/supabase'
import { ALLOWED_EMAIL } from '@/lib/config'

// Initialize Google GenAI with Veo support
const genai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Verify the user's email
    if (user.email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: `Access denied. Only ${ALLOWED_EMAIL} can use this service.` },
        { status: 403 }
      )
    }

    const { prompt, generationId } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!genai) {
      return NextResponse.json(
        { error: 'Google AI API key not configured. Please set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    try {
      // Start video generation with Veo 3.1
      console.log('Starting Veo video generation with prompt:', prompt)

      const operation = await genai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt,
      })

      console.log('Video generation started, operation:', operation.name)

      // Update generation record with video operation
      if (generationId) {
        await supabase
          .from('generations')
          .update({
            metadata: {
              video_operation: operation.name,
              video_status: 'generating',
              video_started_at: new Date().toISOString()
            }
          })
          .eq('id', generationId)
      }

      return NextResponse.json({
        success: true,
        operation: operation.name,
        message: 'Video generation started. Use the operation ID to check status.',
        estimatedTime: '2-5 minutes'
      })

    } catch (veoError) {
      console.error('Veo generation error:', veoError)

      return NextResponse.json(
        {
          error: 'Video generation failed: ' + (veoError instanceof Error ? veoError.message : 'Unknown error'),
          details: 'Veo 3.1 might require special API access or your API key might not have video generation enabled.'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'Invalid request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 400 }
    )
  }
}
