import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'photos')
    const files = await fs.readdir(dir)
    const photos = files
      .filter((f) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((name) => `/photos/${name}`)
    return NextResponse.json({ photos })
  } catch (e) {
    return NextResponse.json({ photos: [] })
  }
}
