import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkBasicAuth } from '@/lib/auth'

const RETENTION_MONTHS = 3

export async function POST(request: NextRequest) {
  const authError = checkBasicAuth(request)
  if (authError) return authError

  try {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - RETENTION_MONTHS)

    const countBefore = await prisma.pageView.count()

    const deleted = await prisma.pageView.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    const countAfter = await prisma.pageView.count()

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} records older than ${RETENTION_MONTHS} months`,
      details: {
        cutoffDate: cutoffDate.toISOString(),
        deletedCount: deleted.count,
        recordsBefore: countBefore,
        recordsAfter: countAfter,
      },
    })
  } catch (error) {
    console.error('Error cleaning up PageView records:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup analytics data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const authError = checkBasicAuth(request)
  if (authError) return authError

  try {
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - RETENTION_MONTHS)

    const totalRecords = await prisma.pageView.count()
    const oldRecords = await prisma.pageView.count({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    const oldestRecord = await prisma.pageView.findFirst({
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true },
    })

    const newestRecord = await prisma.pageView.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    })

    return NextResponse.json({
      retentionMonths: RETENTION_MONTHS,
      cutoffDate: cutoffDate.toISOString(),
      totalRecords,
      recordsToDelete: oldRecords,
      recordsToKeep: totalRecords - oldRecords,
      oldestRecord: oldestRecord?.timestamp?.toISOString() || null,
      newestRecord: newestRecord?.timestamp?.toISOString() || null,
    })
  } catch (error) {
    console.error('Error fetching cleanup stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cleanup stats' },
      { status: 500 }
    )
  }
}
