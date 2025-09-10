'use client'

import { useState, useEffect } from 'react'
import { Search, Music, Loader2 } from 'lucide-react'
import { SpotifyPlaylist } from '../types'
import { getUserPlaylists } from '../utils/spotifyApi'

interface PlaylistSelectorProps {
  accessToken: string
  onPlaylistSelect: (playlist: SpotifyPlaylist) => void
  selectedPlaylist?: SpotifyPlaylist | null
  isLoading?: boolean
}

export default function PlaylistSelector({ 
  accessToken, 
  onPlaylistSelect, 
  selectedPlaylist 
}: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [filteredPlaylists, setFilteredPlaylists] = useState<SpotifyPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlaylists()
  }, [accessToken])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlaylists(playlists)
    } else {
      const filtered = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredPlaylists(filtered)
    }
  }, [searchTerm, playlists])

  const loadPlaylists = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const userPlaylists = await getUserPlaylists(accessToken)
      setPlaylists(userPlaylists)
      setFilteredPlaylists(userPlaylists)
    } catch (err) {
      setError('Failed to load playlists. Please try again.')
      console.error('Error loading playlists:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="card text-center neumorphic-card-hover">
        <Loader2 className="w-8 h-8 mx-auto animate-spin neumorphic-accent mb-4" />
        <p className="neumorphic-subtitle">Loading your playlists...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center neumorphic-card-hover">
        <p className="neumorphic-error mb-4">{error}</p>
        <button 
          onClick={loadPlaylists}
          className="btn-secondary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="card neumorphic-card-hover">
      <div className="mb-6">
        <h2 className="text-2xl font-bold neumorphic-title mb-2">Select a Playlist</h2>
        <p className="neumorphic-subtitle">
          Choose a playlist to organize by BPM and Camelot number
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 neumorphic-subtitle w-5 h-5" />
        <input
          type="text"
          placeholder="Search playlists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full pl-10"
        />
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => onPlaylistSelect(playlist)}
            className={`cursor-pointer rounded-lg p-4 transition-all duration-200 hover:scale-105 ${
              selectedPlaylist?.id === playlist.id
                ? 'neumorphic-card-inset neumorphic-accent'
                : 'neumorphic-card hover:neumorphic-shadow'
            }`}
          >
            {/* Playlist Image */}
            <div className="mb-3">
              {playlist.images && playlist.images.length > 0 ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-full h-32 object-cover rounded-lg neumorphic-shadow-sm"
                />
              ) : (
                <div className="w-full h-32 neumorphic-card-inset rounded-lg flex items-center justify-center">
                  <Music className="w-12 h-12 neumorphic-subtitle" />
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div>
              <h3 className="font-semibold neumorphic-title mb-1 truncate">
                {playlist.name}
              </h3>
              <p className="text-sm neumorphic-subtitle mb-2 line-clamp-2">
                {playlist.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-xs neumorphic-subtitle">
                <span>{playlist.tracks.total} tracks</span>
                {selectedPlaylist?.id === playlist.id && (
                  <span className="neumorphic-accent font-medium">Selected</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlaylists.length === 0 && (
        <div className="text-center py-8">
          <Music className="w-16 h-16 mx-auto neumorphic-subtitle mb-4" />
          <p className="neumorphic-subtitle">
            {searchTerm ? 'No playlists match your search.' : 'No playlists found.'}
          </p>
        </div>
      )}
    </div>
  )
}
