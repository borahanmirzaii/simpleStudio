import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ALLOWED_EMAIL } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Only allow the specific email
    if (email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: `Access restricted. Only ${ALLOWED_EMAIL} is allowed to use this app.` },
        { status: 403 }
      )
    }

    // Send magic link to the allowed email
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for the login link!'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
