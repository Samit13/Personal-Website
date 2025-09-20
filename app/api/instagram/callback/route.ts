import { NextResponse } from 'next/server'

// OAuth redirect callback placeholder for Instagram Basic Display (no-op)
// This endpoint exists to satisfy Next.js routing and avoid empty module errors.
// If you wire up OAuth later, replace this with proper code exchange handling.
export const GET = async () => NextResponse.json({ status: 'ok' }, { status: 200 })
export const POST = async () => NextResponse.json({ status: 'ok' }, { status: 200 })

