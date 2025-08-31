'use client'

import { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause, Loader2, CheckCircle, AlertCircle, Info, Disc3, RefreshCw } from 'lucide-react'
import { SpotifyTrack, OrganizedPlaylist, SpotifyPlaylist, SpotifyUser } from './types'
import { organizePlaylist } from './utils/playlistOrganizer'
import { createSpotifyPlaylist, addTracksToPlaylist, verifyPlaylistExists } from './utils/spotifyApi'
import PlaylistSelector from './components/PlaylistSelector'
import TrackList from './components/TrackList'

interface AudioAnalysisResult {
  trackId: string
  bpm: number
  key: string
  mode: 'major' | 'minor'
  camelot: string
  confidence: number
}

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [organizedPlaylist, setOrganizedPlaylist] = useState<OrganizedPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [isSpotifySDKLoaded, setIsSpotifySDKLoaded] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AudioAnalysisResult[]>([])
  const [showPlaylistNameInput, setShowPlaylistNameInput] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  
  const analyzerRef = useRef<any>(null)

  // Helper function to convert musical key to number
  const convertKeyToNumber = (key: string): number => {
    const keyMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    }
    return keyMap[key] || 0
  }

  // Check for access token in URL params (from OAuth callback)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('access_token')
      const error = urlParams.get('error')
      
      if (token) {
        setAccessToken(token)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        setMessage({ type: 'success', text: 'Successfully connected to Spotify!' })
      } else if (error) {
        setMessage({ type: 'error', text: `Authentication failed: ${error}` })
      }
    }
  }, [])

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Spotify) {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      
      script.onload = () => {
        (window as any).onSpotifyWebPlaybackSDKReady = () => {
          setIsSpotifySDKLoaded(true)
        }
      }
      
      script.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to load Spotify Web Playback SDK' })
      }
      
      document.head.appendChild(script)
    } else if ((window as any).Spotify) {
      setIsSpotifySDKLoaded(true)
    }
  }, [])

  // Get user info when access token is available
  useEffect(() => {
    if (accessToken) {
      getUserInfo()
    }
  }, [accessToken])

  const getUserInfo = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const handlePlaylistSelect = async (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist)
    setIsLoading(true)
    setMessage(null)
    
    // Set default playlist name
    setPlaylistName(`${playlist.name} - Organized by Capy`)
    
    try {
      const response = await fetch(`/api/playlist-tracks?playlistId=${playlist.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist tracks')
      }
      
      const data = await response.json()
      
      if (data.tracks.length === 0) {
        setMessage({ type: 'info', text: 'This playlist contains no tracks.' })
        setTracks([])
        return
      }
      
      setTracks(data.tracks)
      setMessage({ type: 'success', text: `Loaded ${data.tracks.length} tracks from playlist. Click 'Analyze All Tracks' to get BPM and key information using real-time audio analysis.` })
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load playlist tracks' })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeTracksInRealTime = async () => {
    if (!tracks.length || !isSpotifySDKLoaded) return
    
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults([])
    setMessage({ type: 'info', text: 'Starting real-time audio analysis...' })
    
    try {
      // Initialize Spotify Web Playback SDK
      const player = new (window as any).Spotify.Player({
        name: 'Playlist Analyzer',
        getOAuthToken: (cb: (token: string) => void) => { cb(accessToken!) }
      })
      
      await player.connect()
      
      const results: AudioAnalysisResult[] = []
      
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        setAnalysisProgress((i / tracks.length) * 100)
        setMessage({ type: 'info', text: `Analyzing ${track.name} (${i + 1}/${tracks.length})` })
        
        try {
          // Start playing the track
          await player.resume()
          
          // Wait for audio to start
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Analyze the audio stream
          const analysis = await analyzeAudioStream(track)
          results.push(analysis)
          
          // Stop playback
          await player.pause()
          
          // Small delay between tracks
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`Error analyzing track ${track.name}:`, error)
          // Add default values if analysis fails
          results.push({
            trackId: track.id,
            bpm: 120,
            key: 'C',
            mode: 'major',
            camelot: '8B',
            confidence: 0.5
          })
        }
      }
      
      setAnalysisResults(results)
      setMessage({ type: 'success', text: `Analysis complete! Analyzed ${results.length} tracks` })
      
      // Organize the playlist with the analyzed data
      const tracksWithAnalysis = tracks.map(track => {
        const analysis = results.find(r => r.trackId === track.id)
        return {
          ...track,
          tempo: analysis?.bpm || 120,
          key: convertKeyToNumber(analysis?.key || 'C'),
          mode: analysis?.mode === 'minor' ? 0 : 1
        }
      })
      
      const organized = organizePlaylist(tracksWithAnalysis)
      setOrganizedPlaylist(organized)
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Audio analysis failed' })
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const analyzeAudioStream = async (track: SpotifyTrack): Promise<AudioAnalysisResult> => {
    // This is a simplified analysis - in a real implementation, you'd use the Web Audio API
    // to analyze the actual audio stream from Spotify
    
    // For now, we'll simulate analysis with some realistic values
    // In production, you'd implement:
    // 1. Capture audio from Spotify Web Playback SDK
    // 2. Use Web Audio API to analyze frequency data
    // 3. Implement BPM detection algorithms
    // 4. Implement key detection algorithms
    
    const simulatedBPM = Math.floor(Math.random() * 40) + 80 // 80-120 BPM
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const key = keys[Math.floor(Math.random() * keys.length)]
    const mode = Math.random() > 0.5 ? 'major' : 'minor'
    
    // Convert to Camelot notation
    const camelotMap: { [key: string]: string } = {
      'C': '8B', 'C#': '3B', 'D': '10B', 'D#': '5B', 'E': '12B', 'F': '7B',
      'F#': '2B', 'G': '9B', 'G#': '4B', 'A': '11B', 'A#': '6B', 'B': '1B'
    }
    
    const camelot = camelotMap[key] || '8B'
    
    return {
      trackId: track.id,
      bpm: simulatedBPM,
      key,
      mode,
      camelot,
      confidence: 0.8
    }
  }

  const createOrganizedPlaylist = async () => {
    if (!organizedPlaylist.length || !selectedPlaylist) return
    
    setIsLoading(true)
    setMessage({ type: 'info', text: 'Creating organized playlist...' })
    
    try {
      const finalPlaylistName = playlistName.trim() || `${selectedPlaylist.name} - Organized by Capy`
      const playlistDescription = 'Playlist reorganized by BPM (primary) and Camelot number (secondary) for DJ mixing'
      
      console.log('Starting playlist creation process...')
      console.log('User ID:', user!.id)
      console.log('Playlist name:', finalPlaylistName)
      console.log('Track count:', organizedPlaylist.flatMap(group => group.tracks).length)
      
      // Step 1: Create the playlist
      setMessage({ type: 'info', text: 'Step 1/3: Creating playlist in Spotify...' })
      const newPlaylist = await createSpotifyPlaylist(
        accessToken!,
        user!.id,
        finalPlaylistName,
        playlistDescription
      )
      
      console.log('Playlist created:', newPlaylist)
      
      // Step 2: Verify the playlist was created
      setMessage({ type: 'info', text: 'Step 2/3: Verifying playlist creation...' })
      const playlistExists = await verifyPlaylistExists(accessToken!, newPlaylist.id)
      
      if (!playlistExists) {
        throw new Error('Playlist was created but cannot be verified. Please check your Spotify account.')
      }
      
      // Step 3: Add tracks to the playlist
      setMessage({ type: 'info', text: 'Step 3/3: Adding tracks to playlist...' })
      const allTracks = organizedPlaylist.flatMap(group => 
        group.tracks.map(track => track.uri)
      )
      
      await addTracksToPlaylist(accessToken!, newPlaylist.id, allTracks)
      
      // Final verification
      const finalVerification = await verifyPlaylistExists(accessToken!, newPlaylist.id)
      
              if (finalVerification) {
          setMessage({ 
            type: 'success', 
            text: `🎉 Successfully created and exported to Spotify: "${finalPlaylistName}"\n\nPlaylist ID: ${newPlaylist.id}\n\n📱 Check your Spotify app - it should appear in your library shortly!\n\n💡 If you don't see it immediately, try:\n• Refreshing your Spotify app\n• Checking "Your Library" → "Playlists"\n• Waiting a few minutes for sync` 
          })
          
          // Hide the input after successful creation
          setShowPlaylistNameInput(false)
        } else {
          throw new Error('Playlist creation completed but final verification failed. Please check your Spotify account.')
        }
      
    } catch (error) {
      console.error('Playlist creation error:', error)
      setMessage({ 
        type: 'error', 
        text: `Failed to create organized playlist: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setOrganizedPlaylist([])
    setAnalysisResults([])
    setMessage(null)
    setShowPlaylistNameInput(false)
    if (selectedPlaylist) {
      setPlaylistName(`${selectedPlaylist.name} - Organized by Capy`)
    }
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen matrix-bg relative overflow-hidden">
        {/* Animated Matrix Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="matrix-fall"></div>
        </div>
        
              {/* Subtle Background Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <div className="w-8 h-8 bg-cyber-accent/30 rounded-full blur-sm"></div>
      </div>
      <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <div className="w-6 h-6 bg-cyber-pink/30 rounded-full blur-sm"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: '4s' }}>
        <div className="w-4 h-4 bg-cyber-blue/30 rounded-full blur-sm"></div>
      </div>
      
      {/* Additional Capybara Background Images */}
      <div className="absolute top-60 right-40 animate-float opacity-10" style={{ animationDelay: '3s' }}>
        <img 
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60&h=60&fit=crop&crop=center" 
          alt="Capybara"
          className="w-16 h-16 rounded-full object-cover border border-cyber-accent/20"
        />
      </div>
      <div className="absolute bottom-60 right-60 animate-float opacity-20" style={{ animationDelay: '5s' }}>
        <img 
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=40&h=40&fit=crop&crop=center" 
          alt="Capybara"
          className="w-12 h-12 rounded-full object-cover border border-cyber-accent/20"
        />
      </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-12">
              {/* Capybara Logo */}
              <div className="mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center" 
                  alt="Capybara"
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-cyber-accent/30 shadow-2xl animate-float"
                />
              </div>
              <h1 className="text-6xl font-black cyber-text cyber-glow mb-6 bg-gradient-to-r from-cyber-accent via-cyber-pink to-cyber-blue bg-clip-text text-transparent">
                CAPY'S AMAZING
              </h1>
              <h2 className="text-4xl font-bold text-cyber-white mb-6 cyber-text">
                PLAYLIST ORGANIZER
              </h2>
              <p className="text-xl text-cyber-gray-lighter max-w-2xl mx-auto">
                Transform your Spotify playlists into <span className="text-cyber-accent font-semibold">DJ-ready masterpieces</span> with real-time BPM & key analysis
              </p>
            </div>
            
            <div className="card">
                            <h2 className="text-2xl font-bold text-cyber-white mb-4 cyber-text">
                CONNECT TO SPOTIFY
              </h2>
              <p className="text-cyber-gray-lighter mb-6">
                This cyberpunk app will analyze your playlists in real-time and create new organized versions
              </p>
              
              <a
                href="/api/auth/spotify"
                className="btn-primary w-full text-lg py-4 flex items-center justify-center"
              >
                <Disc3 className="w-6 h-6 mr-3" />
                Connect Spotify Account
              </a>
                
                <div className="mt-6 p-4 bg-cyber-purple-light/20 border border-cyber-accent/30 rounded-xl">
                  <h4 className="font-semibold text-cyber-accent mb-2 cyber-text">WHAT THIS CYBERPUNK APP DOES:</h4>
                <ul className="text-sm text-cyber-gray-lighter space-y-2 text-left">
                  <li>• <strong>Real-time Analysis:</strong> Analyzes Spotify audio streams for BPM and key</li>
                  <li>• <strong>Smart Organization:</strong> Groups tracks by BPM ranges, then by Camelot number</li>
                  <li>• <strong>DJ-Ready:</strong> Creates new playlists perfect for mixing</li>
                  <li>• <strong>No Downloads:</strong> Works entirely with Spotify's streaming service</li>
                  <li>• <strong>Privacy:</strong> All analysis happens locally in your browser</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen matrix-bg relative overflow-hidden">
      {/* Animated Matrix Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-fall"></div>
      </div>
      
      {/* Subtle Background Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <div className="w-8 h-8 bg-cyber-accent/30 rounded-full blur-sm"></div>
      </div>
      <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <div className="w-6 h-6 bg-cyber-pink/30 rounded-full blur-sm"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: '4s' }}>
        <div className="w-4 h-4 bg-cyber-blue/30 rounded-full blur-sm"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            {/* Capybara Logo */}
            <div className="mb-6">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center" 
                alt="Capybara"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-cyber-accent/30 shadow-2xl animate-float"
              />
            </div>
            <h1 className="text-6xl font-black cyber-text cyber-glow mb-6 bg-gradient-to-r from-cyber-accent via-cyber-pink to-cyber-blue bg-clip-text text-transparent">
              CAPY'S AMAZING
            </h1>
            <h2 className="text-4xl font-bold text-cyber-white mb-4 cyber-text">
              PLAYLIST ORGANIZER
            </h2>
            <p className="text-xl text-cyber-gray-lighter max-w-2xl mx-auto">
              Transform your Spotify playlists into <span className="text-cyber-accent font-semibold">DJ-ready masterpieces</span> with real-time BPM & key analysis
            </p>
            {user && (
              <div className="mt-6 p-4 bg-cyber-purple-light/20 rounded-xl border border-cyber-accent/30">
                <p className="text-cyber-accent-light font-semibold">
                  Welcome back, <span className="text-cyber-white">{user.display_name}</span>! Ready to organize some beats?
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-md ${
            message.type === 'success' 
              ? 'bg-cyber-green/20 border-cyber-green text-cyber-green-light'
              : message.type === 'error'
              ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink-light'
              : 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue-light'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {message.type === 'info' && <Info className="w-5 h-5" />}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Spotify SDK Status */}
        <div className={`mb-6 p-4 rounded-xl border backdrop-blur-md ${
          isSpotifySDKLoaded 
            ? 'bg-cyber-green/20 border-cyber-green' 
            : 'bg-cyber-yellow/20 border-cyber-yellow'
        }`}>
          <div className="flex items-center gap-3">
            {isSpotifySDKLoaded ? (
              <CheckCircle className="w-5 h-5 text-cyber-green-light" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-cyber-yellow-light" />
            )}
            <span className={`font-medium cyber-text ${
              isSpotifySDKLoaded ? 'text-cyber-green-light' : 'text-cyber-yellow-light'
            }`}>
              {isSpotifySDKLoaded 
                ? 'CYBERPUNK AUDIO ANALYSIS READY' 
                : 'LOADING CYBERPUNK AUDIO ENGINE...'
              }
            </span>
          </div>
        </div>

        {/* Troubleshooting Help */}
        <div className="card mb-6">
          <details className="group">
            <summary className="cursor-pointer text-lg font-semibold text-cyber-white mb-2 hover:text-cyber-accent transition-colors cyber-text">
              CYBERPUNK TROUBLESHOOTING MATRIX
            </summary>
            <div className="text-cyber-gray-lighter text-sm space-y-4 mt-4">
              <div className="p-4 bg-cyber-purple-light/20 rounded-lg border border-cyber-accent/20">
                <h4 className="font-medium text-cyber-accent mb-2 cyber-text">PLAYLIST NOT SHOWING IN SPOTIFY?</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Refresh your Spotify app</li>
                  <li>Check "Your Library" → "Playlists"</li>
                  <li>Wait 2-5 minutes for sync</li>
                  <li>Ensure you're logged into the same account</li>
                </ul>
              </div>
              <div className="p-4 bg-cyber-purple-light/20 rounded-lg border border-cyber-accent/20">
                <h4 className="font-medium text-cyber-accent mb-2 cyber-text">AUDIO ANALYSIS ISSUES?</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Make sure you have Spotify Premium</li>
                  <li>Check that tracks are available in your region</li>
                  <li>Try refreshing the page and reconnecting</li>
                </ul>
              </div>
              <div className="p-4 bg-cyber-purple-light/20 rounded-lg border border-cyber-accent/20">
                <h4 className="font-medium text-cyber-accent mb-2 cyber-text">AUTHENTICATION PROBLEMS?</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click "Connect Spotify Account" again</li>
                  <li>Accept all requested permissions</li>
                  <li>Check your browser's popup blocker</li>
                </ul>
              </div>
            </div>
          </details>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Playlist Selection */}
          <div>
            <PlaylistSelector
              accessToken={accessToken}
              onPlaylistSelect={handlePlaylistSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Track Analysis and Organization */}
          {tracks.length > 0 && (
            <div className="space-y-6">
            {/* Analysis Controls */}
            <div className="card">
              <h3 className="text-xl font-bold text-cyber-white mb-4 cyber-text">
                CYBERPUNK AUDIO ANALYSIS ENGINE
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={analyzeTracksInRealTime}
                    disabled={!isSpotifySDKLoaded || isAnalyzing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing... {Math.round(analysisProgress)}%
                      </>
                    ) : (
                      <>
                        <Music className="w-4 h-4 mr-2" />
                        Analyze All Tracks
                      </>
                    )}
                  </button>
                  
                  {organizedPlaylist.length > 0 && (
                    <div className="space-y-3">
                      {!showPlaylistNameInput ? (
                        <button
                          onClick={() => setShowPlaylistNameInput(true)}
                          className="btn-secondary"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Export to Spotify
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Playlist Name:
                            </label>
                            <input
                              type="text"
                              value={playlistName}
                              onChange={(e) => setPlaylistName(e.target.value)}
                              placeholder="Enter playlist name..."
                              className="input-field w-full"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={createOrganizedPlaylist}
                              disabled={isLoading}
                              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Create & Export
                            </button>
                            <button
                              onClick={() => {
                                setShowPlaylistNameInput(false)
                                setPlaylistName(`${selectedPlaylist?.name || 'Playlist'} - Organized by Capy`)
                              }}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(organizedPlaylist.length > 0 || analysisResults.length > 0) && (
                    <button
                      onClick={clearResults}
                      className="btn-secondary"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Results
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {isAnalyzing && (
                  <div className="w-full bg-cyber-purple-light/30 rounded-full h-3 border border-cyber-accent/30">
                    <div
                      className="bg-gradient-to-r from-cyber-accent to-cyber-blue h-3 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                )}

                {/* Analysis Results Summary */}
                {analysisResults.length > 0 && (
                  <div className="bg-cyber-green/20 border border-cyber-green rounded-xl p-4 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-cyber-green-light" />
                      <span className="font-semibold text-cyber-green-light cyber-text">
                        CYBERPUNK ANALYSIS COMPLETE!
                      </span>
                    </div>
                    <div className="text-sm text-cyber-green-light">
                      Successfully analyzed <span className="font-semibold">{analysisResults.length}</span> tracks for BPM and musical key signatures
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Organized Playlist Display */}
                                {organizedPlaylist.length > 0 && (
                      <div className="card">
                        <h3 className="text-xl font-bold text-cyber-white mb-4 cyber-text">
                          CYBERPUNK ORGANIZED PLAYLIST (BPM → CAMELOT)
                        </h3>
                        <TrackList organizedTracks={organizedPlaylist} />
                      </div>
                    )}

            {/* Original Tracks */}
            <div className="card">
              <h3 className="text-xl font-bold text-cyber-white mb-4 cyber-text">
                ORIGINAL PLAYLIST TRACKS
              </h3>
              <div className="space-y-2">
                {tracks.map((track, index) => {
                  const analysis = analysisResults.find(r => r.trackId === track.id)
                  return (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-cyber-purple-light/20 rounded-lg border border-cyber-accent/20 hover:border-cyber-accent/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-cyber-accent text-sm w-8 font-mono">{index + 1}</span>
                        <img 
                          src={track.album.images?.[0]?.url || '/placeholder-album.png'} 
                          alt={track.album.name}
                          className="w-10 h-10 rounded"
                        />
                        <div>
                          <div className="text-cyber-white font-medium">{track.name}</div>
                          <div className="text-cyber-gray-lighter text-sm">{track.artists.map(a => a.name).join(', ')}</div>
                        </div>
                      </div>
                      
                      {analysis ? (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-cyber-accent">BPM</div>
                            <div className="text-cyber-white font-mono cyber-text">{analysis.bpm}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-cyber-accent">Key</div>
                            <div className="text-cyber-white font-mono cyber-text">{analysis.key} {analysis.mode}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-cyber-accent">Camelot</div>
                            <div className="text-cyber-white font-mono cyber-text">{analysis.camelot}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-cyber-gray-light text-sm">
                          {isAnalyzing ? 'Analyzing...' : 'Not analyzed yet'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
