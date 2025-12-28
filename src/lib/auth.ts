import { NextRequest, NextResponse } from 'next/server'

export function checkBasicAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Analytics Dashboard"',
      },
    })
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = atob(base64Credentials)
  const [username, password] = credentials.split(':')

  const validUser = process.env.ANALYTICS_USER
  const validPass = process.env.ANALYTICS_PASSWORD

  if (!validUser || !validPass) {
    console.error('ANALYTICS_USER or ANALYTICS_PASSWORD not set')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  if (username !== validUser || password !== validPass) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Analytics Dashboard"',
      },
    })
  }

  return null // Auth successful
}
