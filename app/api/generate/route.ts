import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import { ALLOWED_EMAIL } from '@/lib/config'

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
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

    // Verify the user's email is the allowed one
    if (user.email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: `Access denied. Only ${ALLOWED_EMAIL} can use this service.` },
        { status: 403 }
      )
    }

    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Create a new generation record in Supabase
    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        prompt,
        status: 'processing',
        metadata: { step: 'initializing' }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    try {
      // Step 1: Expand the prompt into a full story using Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

      const storyPrompt = `You are a creative storyteller. Transform this short idea into a compelling 200-300 word story with vivid visual details:

"${prompt}"

Make it cinematic, emotional, and rich with imagery. Focus on visual scenes that could be turned into images.`

      const result = await model.generateContent(storyPrompt)
      const story = result.response.text()

      // Update the generation with the story
      await supabase
        .from('generations')
        .update({
          metadata: {
            step: 'story_generated',
            story
          }
        })
        .eq('id', generation.id)

      // Step 2: Break the story into scenes (using Gemini)
      const scenesPrompt = `Break this story into 4-6 visual scenes. For each scene, provide a detailed image generation prompt.

Story: ${story}

Format your response as a JSON array of objects with this structure:
[
  {
    "scene_number": 1,
    "description": "brief scene description",
    "image_prompt": "detailed prompt for image generation"
  }
]

Only return the JSON array, nothing else.`

      const scenesResult = await model.generateContent(scenesPrompt)
      const scenesText = scenesResult.response.text()

      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = scenesText.match(/\[[\s\S]*\]/)
      const scenes = jsonMatch ? JSON.parse(jsonMatch[0]) : []

      // Update with scenes
      await supabase
        .from('generations')
        .update({
          metadata: {
            step: 'scenes_generated',
            story,
            scenes
          }
        })
        .eq('id', generation.id)

      // Step 3: Placeholder for Imagen image generation
      // Note: Imagen requires Vertex AI setup with GCP credentials
      // For now, we'll mark as completed with the story and scenes

      await supabase
        .from('generations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            step: 'completed',
            story,
            scenes,
            note: 'Image and video generation require Vertex AI setup'
          }
        })
        .eq('id', generation.id)

      return NextResponse.json({
        success: true,
        generation_id: generation.id,
        story,
        scenes,
        message: 'Story and scenes generated successfully! Add Vertex AI credentials for image/video generation.'
      })

    } catch (aiError) {
      console.error('AI generation error:', aiError)

      // Update status to failed
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          metadata: {
            step: 'failed',
            error: aiError instanceof Error ? aiError.message : 'Unknown error'
          }
        })
        .eq('id', generation.id)

      return NextResponse.json(
        { error: 'AI generation failed: ' + (aiError instanceof Error ? aiError.message : 'Unknown error') },
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
