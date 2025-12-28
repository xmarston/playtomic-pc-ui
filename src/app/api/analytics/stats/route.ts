import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkBasicAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = checkBasicAuth(request)
  if (authError) return authError

  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parse date range or use defaults
    const rangeStart = startDate ? new Date(startDate) : monthAgo
    const rangeEnd = endDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000) : tomorrow

    const dateFilter = { timestamp: { gte: rangeStart, lt: rangeEnd } }

    const [
      totalViews,
      uniqueSessions,
      todayViews,
      weekViews,
      topPages,
      topReferrers,
      browsers,
      userAgents,
    ] = await Promise.all([
      prisma.pageView.count({ where: dateFilter }),
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: dateFilter,
        _count: true,
      }),
      prisma.pageView.count({
        where: { timestamp: { gte: today, lt: tomorrow } },
      }),
      prisma.pageView.count({
        where: { timestamp: { gte: weekAgo, lt: tomorrow } },
      }),
      prisma.pageView.groupBy({
        by: ['path'],
        where: dateFilter,
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ['referrer'],
        where: { ...dateFilter, referrer: { not: null } },
        _count: { referrer: true },
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ['browser'],
        where: { ...dateFilter, browser: { not: null } },
        _count: { browser: true },
        orderBy: { _count: { browser: 'desc' } },
        take: 10,
      }),
      prisma.pageView.groupBy({
        by: ['userAgent'],
        where: { ...dateFilter, userAgent: { not: null } },
        _count: { userAgent: true },
        orderBy: { _count: { userAgent: 'desc' } },
        take: 20,
      }),
    ])

    return NextResponse.json({
      totalViews,
      uniqueSessions: uniqueSessions.length,
      todayViews,
      weekViews,
      topPages: topPages.map((p: { path: string; _count: { path: number } }) => ({
        path: p.path,
        count: p._count.path,
      })),
      topReferrers: topReferrers.map((r: { referrer: string | null; _count: { referrer: number } }) => ({
        referrer: r.referrer || 'Direct',
        count: r._count.referrer,
      })),
      browsers: browsers.map((b: { browser: string | null; _count: { browser: number } }) => ({
        browser: b.browser || 'Unknown',
        count: b._count.browser,
      })),
      userAgents: userAgents.map((ua: { userAgent: string | null; _count: { userAgent: number } }) => ({
        userAgent: ua.userAgent || 'Unknown',
        count: ua._count.userAgent,
      })),
    })
  } catch (error) {
    console.error('Error fetching analytics stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
