import { NextResponse } from 'next/server'

// Minimal Instagram Basic Display API fetcher (server-side)
// Provide a long-lived access token in process.env.INSTAGRAM_ACCESS_TOKEN
// Docs: https://developers.facebook.com/docs/instagram-basic-display-api/
export async function GET() {
	const token = process.env.INSTAGRAM_ACCESS_TOKEN
	if (!token) {
		return NextResponse.json({ media: [] }, { status: 200 })
	}
	try {
		const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username'
		const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=24`
		const res = await fetch(url, { cache: 'no-store' })
		if (!res.ok) throw new Error(`IG error ${res.status}`)
		const data = await res.json()
		return NextResponse.json({ media: data.data || [] })
	} catch (e) {
		return NextResponse.json({ media: [], error: String(e) }, { status: 200 })
	}
}
