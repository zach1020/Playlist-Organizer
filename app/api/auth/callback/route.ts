import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    // Redirect to main page with error
    const mainPageUrl = new URL(SPOTIFY_REDIRECT_URI.replace('/api/auth/callback', ''))
    mainPageUrl.searchParams.set('error', error)
    return NextResponse.redirect(mainPageUrl.toString())
  }

  if (!code) {
    // Redirect to main page with error
    const mainPageUrl = new URL(SPOTIFY_REDIRECT_URI.replace('/api/auth/callback', ''))
    mainPageUrl.searchParams.set('error', 'no_code')
    return NextResponse.redirect(mainPageUrl.toString())
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    // Redirect to main page with error
    const mainPageUrl = new URL(SPOTIFY_REDIRECT_URI.replace('/api/auth/callback', ''))
    mainPageUrl.searchParams.set('error', 'config_error')
    return NextResponse.redirect(mainPageUrl.toString())
  }

  try {
    console.log('Exchanging authorization code for tokens...')
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', tokenResponse.status, errorText)
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful, token type:', tokenData.token_type)
    console.log('Token expires in:', tokenData.expires_in, 'seconds')
    
    // Redirect back to the main page with the access token
    const mainPageUrl = new URL(SPOTIFY_REDIRECT_URI.replace('/api/auth/callback', ''))
    mainPageUrl.searchParams.set('access_token', tokenData.access_token)
    
    return NextResponse.redirect(mainPageUrl.toString())
    
  } catch (error) {
    console.error('Token exchange error:', error)
    // Redirect to main page with error
    const mainPageUrl = new URL(SPOTIFY_REDIRECT_URI.replace('/api/auth/callback', ''))
    mainPageUrl.searchParams.set('error', 'token_exchange_failed')
    return NextResponse.redirect(mainPageUrl.toString())
  }
}
