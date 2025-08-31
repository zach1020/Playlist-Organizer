import { SpotifyPlaylist } from '../types'

// Create a new playlist
export async function createSpotifyPlaylist(
  accessToken: string, 
  userId: string,
  name: string, 
  description: string
): Promise<SpotifyPlaylist> {
  console.log(`Creating playlist for user ${userId}: "${name}"`)
  
  // Create the playlist
  const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      public: false
    })
  })

  if (!playlistResponse.ok) {
    const errorText = await playlistResponse.text()
    console.error('Playlist creation failed:', playlistResponse.status, errorText)
    throw new Error(`Failed to create playlist: ${playlistResponse.status} - ${errorText}`)
  }

  const playlist = await playlistResponse.json()
  console.log('Playlist created successfully:', playlist.id, playlist.name)
  return playlist
}

// Add tracks to a playlist
export async function addTracksToPlaylist(
  accessToken: string, 
  playlistId: string, 
  trackUris: string[]
): Promise<void> {
  console.log(`Adding ${trackUris.length} tracks to playlist ${playlistId}`)
  
  // Spotify API allows max 100 tracks per request
  const batchSize = 100
  
  for (let i = 0; i < trackUris.length; i += batchSize) {
    const batch = trackUris.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    
    console.log(`Adding batch ${batchNumber}: ${batch.length} tracks`)
    
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: batch
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to add tracks batch ${batchNumber}:`, response.status, errorText)
      throw new Error(`Failed to add tracks batch ${batchNumber}: ${response.status} - ${errorText}`)
    }
    
    console.log(`Successfully added batch ${batchNumber}`)
  }
  
  console.log(`All ${trackUris.length} tracks added successfully to playlist ${playlistId}`)
}

// Verify playlist exists and get its details
export async function verifyPlaylistExists(
  accessToken: string, 
  playlistId: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (response.ok) {
      const playlist = await response.json()
      console.log(`Playlist verified: ${playlist.name} (${playlist.id})`)
      return true
    } else {
      console.error(`Playlist verification failed: ${response.status}`)
      return false
    }
  } catch (error) {
    console.error('Error verifying playlist:', error)
    return false
  }
}

// Get user's playlists
export async function getUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
  const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user playlists')
  }

  const data = await response.json()
  return data.items
}

// Get playlist tracks with audio features
export async function getPlaylistTracksWithFeatures(
  accessToken: string, 
  playlistId: string
): Promise<any[]> {
  // First get the playlist tracks
  const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!tracksResponse.ok) {
    throw new Error('Failed to fetch playlist tracks')
  }

  const tracksData = await tracksResponse.json()
  const tracks = tracksData.items.map((item: any) => item.track).filter((track: any) => track !== null)

  // Get audio features for all tracks
  const trackIds = tracks.map((track: any) => track.id)
  const featuresResponse = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )

  if (!featuresResponse.ok) {
    throw new Error('Failed to fetch audio features')
  }

  const featuresData = await featuresResponse.json()
  const features = featuresData.audio_features

  // Combine track data with audio features
  return tracks.map((track: any, index: number) => ({
    ...track,
    tempo: features[index]?.tempo,
    key: features[index]?.key,
    mode: features[index]?.mode
  }))
}
