export interface SpotifyTrack {
  id: string
  uri: string
  name: string
  artists: Array<{
    id: string
    name: string
  }>
  album: {
    id: string
    name: string
    images: Array<{
      url: string
      width: number
      height: number
    }>
  }
  duration_ms: number
  tempo?: number // BPM
  key?: number // Musical key (0-11, where 0 = C, 1 = C#, etc.)
  mode?: number // 0 = minor, 1 = major
}

export interface OrganizedPlaylist {
  bpm: number
  camelot: string
  tracks: SpotifyTrack[]
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: Array<{
    url: string
    width: number
    height: number
  }>
  tracks: {
    total: number
  }
}

export interface SpotifyUser {
  id: string
  display_name: string
  images: Array<{
    url: string
    width: number
    height: number
  }>
}
