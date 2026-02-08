import { NextRequest, NextResponse } from 'next/server'

const backendBase = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

function mapApiPath(pathSegments: string[]) {
  if (pathSegments[0] === 'stats') return 'client/stats'
  if (pathSegments[0] === 'replies') {
    if (pathSegments.length > 1) {
      return `client/replies/${pathSegments.slice(1).join('/')}`
    }
    return 'client/replies'
  }
  return pathSegments.join('/')
}

async function proxy(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  const mappedPath = mapApiPath(pathSegments)
  const targetUrl = new URL(`${backendBase}/${mappedPath}`)
  targetUrl.search = request.nextUrl.search

  const headers = new Headers(request.headers)
  headers.delete('host')

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()
  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body
  })

  const responseHeaders = new Headers(response.headers)
  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders
  })
}

export async function GET(request: NextRequest) {
  return proxy(request)
}

export async function POST(request: NextRequest) {
  return proxy(request)
}

export async function PATCH(request: NextRequest) {
  return proxy(request)
}

export async function PUT(request: NextRequest) {
  return proxy(request)
}

export async function DELETE(request: NextRequest) {
  return proxy(request)
}
