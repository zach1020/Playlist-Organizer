// Client-side Spotify authentication for Electron app
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'your_client_id_here'
const REDIRECT_URI = 'http://localhost:3000/callback'

export const getSpotifyAuthUrl = () => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
    'user-library-modify'
  ].join(' ')

  const params = new URLSearchParams({
    response_type: 'token',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    show_dialog: 'true'
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export const handleSpotifyCallback = (): string | null => {
  if (typeof window === 'undefined') return null

  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  
  const accessToken = params.get('access_token')
  const error = params.get('error')
  
  if (error) {
    console.error('Spotify auth error:', error)
    return null
  }
  
  return accessToken
}

export const clearSpotifyAuth = () => {
  if (typeof window !== 'undefined') {
    window.location.hash = ''
  }
}
