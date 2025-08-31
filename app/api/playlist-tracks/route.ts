import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const playlistId = searchParams.get('playlistId')
  const authorization = request.headers.get('authorization')

  if (!playlistId) {
    return NextResponse.json(
      { error: 'Playlist ID is required' },
      { status: 400 }
    )
  }

  if (!authorization) {
    return NextResponse.json(
      { error: 'Authorization header is required' },
      { status: 401 }
    )
  }

  try {
    console.log(`Fetching playlist tracks for playlist: ${playlistId}`)
    console.log(`Authorization header: ${authorization.substring(0, 20)}...`)
    
    // First, test if our authorization works with a simple API call
    console.log('Testing authorization with a simple API call...')
    const testResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': authorization
      }
    })
    
    if (testResponse.ok) {
      const userData = await testResponse.json()
      console.log('Authorization test successful, user:', userData.display_name)
    } else {
      console.error('Authorization test failed:', testResponse.status, await testResponse.text())
    }
    
    // Get playlist tracks
    const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': authorization
      }
    })

    if (!tracksResponse.ok) {
      const errorText = await tracksResponse.text()
      console.error('Playlist tracks response error:', tracksResponse.status, errorText)
      throw new Error(`Failed to fetch playlist tracks: ${tracksResponse.status}`)
    }

    const tracksData = await tracksResponse.json()
    const tracks = tracksData.items
      .map((item: any) => item.track)
      .filter((track: any) => track !== null && track.type === 'track') // Only include actual music tracks

    console.log(`Found ${tracks.length} music tracks in playlist`)

    if (tracks.length === 0) {
      return NextResponse.json({
        tracks: [],
        message: 'No music tracks found in this playlist'
      })
    }

    // We no longer need to fetch audio features from the API since we're doing real-time analysis
    // Just return the basic track information
    console.log(`Loaded ${tracks.length} tracks for real-time audio analysis`)

    // Since we're doing real-time audio analysis, return all tracks without filtering
    // The audio features will be analyzed in real-time when the user clicks "Analyze All Tracks"
    console.log(`Returning all ${tracks.length} tracks for real-time analysis`)

    return NextResponse.json({
      tracks: tracks,
      totalTracks: tracks.length,
      message: `Loaded ${tracks.length} tracks. Use real-time audio analysis to get BPM and key information.`
    })

  } catch (error) {
    console.error('Error fetching playlist tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist tracks' },
      { status: 500 }
    )
  }
}
