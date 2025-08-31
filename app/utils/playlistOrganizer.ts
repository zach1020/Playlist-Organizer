import { SpotifyTrack, OrganizedPlaylist } from '../types'

// Camelot wheel mapping
const camelotWheel: { [key: string]: string } = {
  'C': '8B', 'G': '8B',
  'D': '10B', 'A': '10B',
  'E': '12B', 'B': '12B',
  'F#': '2B', 'C#': '2B',
  'G#': '4B', 'D#': '4B',
  'A#': '6B', 'F': '6B',
  'Am': '8A', 'Em': '8A',
  'Bm': '10A', 'F#m': '10A',
  'C#m': '12A', 'G#m': '12A',
  'D#m': '2A', 'A#m': '2A',
  'Fm': '4A', 'Cm': '4A',
  'Gm': '6A', 'Dm': '6A'
}

// Convert musical key and mode to Camelot notation
function getCamelotNotation(key: number, mode: number): string {
  const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const keyName = keyNames[key]
  const modeName = mode === 1 ? keyName : `${keyName}m`
  
  return camelotWheel[modeName] || 'Unknown'
}

// Group tracks by BPM ranges and then by Camelot
export function organizePlaylist(tracks: SpotifyTrack[]): OrganizedPlaylist[] {
  // Filter tracks that have tempo and key information
  const validTracks = tracks.filter(track => 
    track.tempo !== undefined && 
    track.key !== undefined && 
    track.mode !== undefined
  )

  if (validTracks.length === 0) {
    return []
  }

  // Group tracks by BPM ranges
  const bpmGroups: { [key: string]: SpotifyTrack[] } = {}
  
  validTracks.forEach(track => {
    const bpm = Math.round(track.tempo!)
    const bpmRange = getBpmRange(bpm)
    
    if (!bpmGroups[bpmRange]) {
      bpmGroups[bpmRange] = []
    }
    bpmGroups[bpmRange].push(track)
  })

  // Organize each BPM group by Camelot
  const organized: OrganizedPlaylist[] = []
  
  Object.entries(bpmGroups).forEach(([bpmRange, tracksInRange]) => {
    const camelotGroups: { [key: string]: SpotifyTrack[] } = {}
    
    tracksInRange.forEach(track => {
      const camelot = getCamelotNotation(track.key!, track.mode!)
      
      if (!camelotGroups[camelot]) {
        camelotGroups[camelot] = []
      }
      camelotGroups[camelot].push(track)
    })

    // Sort tracks within each Camelot group by BPM (ascending)
    Object.entries(camelotGroups).forEach(([camelot, tracksInCamelot]) => {
      const sortedTracks = tracksInCamelot.sort((a, b) => (a.tempo || 0) - (b.tempo || 0))
      
      organized.push({
        bpm: parseInt(bpmRange.split('-')[0]),
        camelot,
        tracks: sortedTracks
      })
    })
  })

  // Sort by BPM (ascending) and then by Camelot
  return organized.sort((a, b) => {
    if (a.bpm !== b.bpm) {
      return a.bpm - b.bpm
    }
    return a.camelot.localeCompare(b.camelot)
  })
}

// Get BPM range for grouping
function getBpmRange(bpm: number): string {
  if (bpm < 80) return '60-79'
  if (bpm < 100) return '80-99'
  if (bpm < 120) return '100-119'
  if (bpm < 140) return '120-139'
  if (bpm < 160) return '140-159'
  if (bpm < 180) return '160-179'
  return '180+'
}

// Get BPM range display name
export function getBpmRangeDisplay(bpm: number): string {
  if (bpm < 80) return 'Downtempo (60-79 BPM)'
  if (bpm < 100) return 'Hip-Hop (80-99 BPM)'
  if (bpm < 120) return 'House (100-119 BPM)'
  if (bpm < 140) return 'Techno (120-139 BPM)'
  if (bpm < 160) return 'Drum & Bass (140-159 BPM)'
  if (bpm < 180) return 'Hardcore (160-179 BPM)'
  return 'Extreme (180+ BPM)'
}
