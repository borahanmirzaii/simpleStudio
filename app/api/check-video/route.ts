import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '@/lib/supabase'
import { ALLOWED_EMAIL } from '@/lib/config'

// Initialize Google GenAI
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

    if (authError || !user || user.email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    const { operationName } = await request.json()

    if (!operationName) {
      return NextResponse.json(
        { error: 'Operation name is required' },
        { status: 400 }
      )
    }

    if (!genai) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      )
    }

    try {
      // Check video generation status
      const operation = await genai.operations.getVideosOperation({
        operation: operationName as any,
      })

      console.log('Operation status:', operation.done ? 'Complete' : 'In progress')

      if (operation.done) {
        // Video is ready
        const video = operation.response?.generatedVideos?.[0]?.video

        return NextResponse.json({
          done: true,
          videoUrl: video?.uri || null,
          message: 'Video generation complete!'
        })
      } else {
        // Still processing
        return NextResponse.json({
          done: false,
          message: 'Video is still generating...'
        })
      }

    } catch (error) {
      console.error('Error checking video status:', error)
      return NextResponse.json(
        { error: 'Failed to check video status: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
