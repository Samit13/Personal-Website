import { NextResponse } from 'next/server'

// Instagram API removed: this endpoint intentionally returns an empty list.
export const GET = async () => NextResponse.json({ media: [] }, { status: 200 })
