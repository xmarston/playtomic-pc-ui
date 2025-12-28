import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkBasicAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = checkBasicAuth(request)
  if (authError) return authError

  try {
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Default to last 30 days if no dates provided
    const now = new Date()
    const defaultStart = new Date(now)
    defaultStart.setDate(defaultStart.getDate() - 30)
    defaultStart.setHours(0, 0, 0, 0)

    const rangeStart = startDateParam ? new Date(startDateParam) : defaultStart
    rangeStart.setHours(0, 0, 0, 0)

    const rangeEnd = endDateParam ? new Date(endDateParam) : now
    rangeEnd.setHours(23, 59, 59, 999)

    const views = await prisma.pageView.findMany({
      where: {
        timestamp: { gte: rangeStart, lte: rangeEnd },
      },
      select: {
        timestamp: true,
        sessionId: true,
      },
      orderBy: { timestamp: 'asc' },
    })

    // Calculate number of days in range
    const days = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000))

    // Group by date
    const viewsByDate = new Map<
      string,
      { views: number; sessions: Set<string> }
    >()

    for (let i = 0; i <= days; i++) {
      const date = new Date(rangeStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      viewsByDate.set(dateStr, { views: 0, sessions: new Set() })
    }

    for (const view of views) {
      const dateStr = view.timestamp.toISOString().split('T')[0]
      const dayData = viewsByDate.get(dateStr)
      if (dayData) {
        dayData.views++
        dayData.sessions.add(view.sessionId)
      }
    }

    const chartData = Array.from(viewsByDate.entries()).map(
      ([date, data]) => ({
        date,
        views: data.views,
        uniqueVisitors: data.sessions.size,
      })
    )

    return NextResponse.json({ data: chartData })
  } catch (error) {
    console.error('Error fetching analytics views:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
