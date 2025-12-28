import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { path, referrer, screenSize, language, sessionId, browser } = body

    if (!path || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || undefined

    await prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        userAgent,
        browser: browser || null,
        sessionId,
        screenSize: screenSize || null,
        language: language || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking page view:', error)
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    )
  }
}
