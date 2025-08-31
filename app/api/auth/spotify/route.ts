import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID

// Automatically detect environment and set appropriate redirect URI
function getRedirectUri(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const referer = request.headers.get('referer') || ''
  const origin = request.headers.get('origin') || ''
  
  // Debug logging
  console.log('🔍 Debug - Host header:', host)
  console.log('🔍 Debug - Referer:', referer)
  console.log('🔍 Debug - Origin:', origin)
  console.log('🔍 Debug - Full request URL:', request.url)
  
  // Check if any of the headers contain ngrok (both ngrok.io and ngrok-free.app)
  const isNgrok = host.includes('ngrok.io') || host.includes('ngrok-free.app') || 
                  referer.includes('ngrok.io') || referer.includes('ngrok-free.app') || 
                  origin.includes('ngrok.io') || origin.includes('ngrok-free.app')
  const isVercel = host.includes('vercel.app') || host.includes('capys-amazing-playlist-organizer.com')
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  // Debug the detection logic
  console.log('🔍 Debug - isNgrok:', isNgrok)
  console.log('🔍 Debug - isVercel:', isVercel)
  console.log('🔍 Debug - isLocalhost:', isLocalhost)
  console.log('🔍 Debug - host.includes("ngrok.io"):', host.includes('ngrok.io'))
  console.log('🔍 Debug - host.includes("ngrok-free.app"):', host.includes('ngrok-free.app'))
  console.log('🔍 Debug - referer.includes("ngrok.io"):', referer.includes('ngrok.io'))
  console.log('🔍 Debug - referer.includes("ngrok-free.app"):', referer.includes('ngrok-free.app'))
  
  if (isNgrok) {
    console.log('🔍 Debug - Detected ngrok, using HTTPS redirect')
    // Extract ngrok domain from the most reliable source
    let ngrokDomain = host
    if (host.includes('ngrok.io') || host.includes('ngrok-free.app')) {
      ngrokDomain = host
    } else if (referer.includes('ngrok.io') || referer.includes('ngrok-free.app')) {
      try {
        const refererUrl = new URL(referer)
        ngrokDomain = refererUrl.hostname
      } catch (e) {
        ngrokDomain = host
      }
    } else if (origin.includes('ngrok.io') || origin.includes('ngrok-free.app')) {
      try {
        const originUrl = new URL(origin)
        ngrokDomain = originUrl.hostname
      } catch (e) {
        ngrokDomain = host
      }
    }
    
    console.log('🔍 Debug - Extracted ngrok domain:', ngrokDomain)
    return `https://${ngrokDomain}/api/auth/callback`
  } else if (isVercel) {
    console.log('🔍 Debug - Detected Vercel, using production redirect')
    // Use the actual host from the request instead of hardcoding
    return `https://${host}/api/auth/callback`
  } else if (isLocalhost) {
    console.log('🔍 Debug - Detected localhost, using HTTP redirect')
    return 'http://localhost:3000/api/auth/callback'
  } else {
    console.log('🔍 Debug - Using fallback redirect')
    return process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
  }
}

export async function GET(request: NextRequest) {
  if (!SPOTIFY_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Spotify client ID not configured' },
      { status: 500 }
    )
  }

  const scopes = [
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email',
    'user-top-read'
  ].join(' ')

  const authUrl = new URL('https://accounts.spotify.com/authorize')
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('redirect_uri', getRedirectUri(request))
  authUrl.searchParams.append('scope', scopes)
  authUrl.searchParams.append('show_dialog', 'true')

  return NextResponse.redirect(authUrl.toString())
}
