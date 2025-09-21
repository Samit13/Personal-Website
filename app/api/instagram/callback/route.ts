import { NextResponse } from 'next/server'

// Removed Instagram OAuth callback. Keeping file with a no-op endpoint so build doesn't fail on empty module.
export const GET = async () => NextResponse.json({ status: 'removed' }, { status: 200 })

