import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string[] } }
) {
  const [width = '200', height = '200'] = params.size
  const w = parseInt(width) || 200
  const h = parseInt(height) || 200

  // Generate a simple SVG placeholder
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#F1F5F9"/>
    <rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.4}" height="${h * 0.25}" rx="4" fill="#CBD5E1"/>
    <circle cx="${w * 0.5}" cy="${h * 0.35}" r="${Math.min(w, h) * 0.08}" fill="#94A3B8"/>
    <path d="M${w * 0.3} ${h * 0.65} L${w * 0.45} ${h * 0.45} L${w * 0.55} ${h * 0.55} L${w * 0.65} ${h * 0.4} L${w * 0.7} ${h * 0.65} Z" fill="#94A3B8" opacity="0.6"/>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
