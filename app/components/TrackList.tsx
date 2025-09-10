'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Music, Clock, Zap } from 'lucide-react'
import { OrganizedPlaylist } from '../types'
import { getBpmRangeDisplay } from '../utils/playlistOrganizer'

interface TrackListProps {
  organizedTracks: OrganizedPlaylist[]
}

export default function TrackList({ organizedTracks }: TrackListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getCamelotColor = (camelot: string) => {
    const colors: { [key: string]: string } = {
      '1A': 'bg-red-500',
      '2A': 'bg-orange-500',
      '3A': 'bg-yellow-500',
      '4A': 'bg-green-500',
      '5A': 'bg-blue-500',
      '6A': 'bg-indigo-500',
      '7A': 'bg-purple-500',
      '8A': 'bg-pink-500',
      '9A': 'bg-red-600',
      '10A': 'bg-orange-600',
      '11A': 'bg-yellow-600',
      '12A': 'bg-green-600',
      '1B': 'bg-red-400',
      '2B': 'bg-orange-400',
      '3B': 'bg-yellow-400',
      '4B': 'bg-green-400',
      '5B': 'bg-blue-400',
      '6B': 'bg-indigo-400',
      '7B': 'bg-purple-400',
      '8B': 'bg-pink-400',
      '9B': 'bg-red-500',
      '10B': 'bg-orange-500',
      '11B': 'bg-yellow-500',
      '12B': 'bg-green-500',
    }
    return colors[camelot] || 'bg-gray-500'
  }

  // Group tracks by BPM range
  const bpmGroups = organizedTracks.reduce((groups, track) => {
    const bpmRange = getBpmRangeDisplay(track.bpm)
    if (!groups[bpmRange]) {
      groups[bpmRange] = []
    }
    groups[bpmRange].push(track)
    return groups
  }, {} as { [key: string]: OrganizedPlaylist[] })

  return (
    <div className="space-y-6">
      {Object.entries(bpmGroups).map(([bpmRange, tracksInRange]) => (
        <div key={bpmRange} className="neumorphic-card neumorphic-card-hover">
          <div className="mb-4">
            <h3 className="text-xl font-bold neumorphic-title mb-2">{bpmRange}</h3>
            <p className="neumorphic-subtitle">
              {tracksInRange.length} track groups • {tracksInRange.reduce((total, group) => total + group.tracks.length, 0)} total tracks
            </p>
          </div>

          <div className="space-y-3">
            {tracksInRange.map((group) => {
              const groupId = `${group.bpm}-${group.camelot}`
              const isExpanded = expandedGroups.has(groupId)
              const totalDuration = group.tracks.reduce((sum, track) => sum + track.duration_ms, 0)

              return (
                <div key={groupId} className="neumorphic-card-inset rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div
                    className="p-4 cursor-pointer hover:neumorphic-shadow transition-all"
                    onClick={() => toggleGroup(groupId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${getCamelotColor(group.camelot)} flex items-center justify-center text-white text-sm font-bold neumorphic-shadow-sm`}>
                          {group.camelot}
                        </div>
                        <div>
                          <h4 className="font-semibold neumorphic-title">
                            Camelot {group.camelot}
                          </h4>
                          <p className="text-sm neumorphic-subtitle">
                            {group.tracks.length} tracks • {formatDuration(totalDuration)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm neumorphic-subtitle">
                          ~{Math.round(group.bpm)} BPM
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 neumorphic-subtitle" />
                        ) : (
                          <ChevronRight className="w-5 h-5 neumorphic-subtitle" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Track List */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {group.tracks.map((track, index) => (
                        <div key={track.id} className="flex items-center gap-4 p-3 neumorphic-card-inset rounded-lg hover:neumorphic-shadow transition-all">
                          {/* Track Number */}
                          <div className="w-8 h-8 neumorphic-card-inset rounded-full flex items-center justify-center text-sm font-medium neumorphic-subtitle">
                            {index + 1}
                          </div>

                          {/* Album Art */}
                          <div className="w-12 h-12 flex-shrink-0">
                            {track.album.images && track.album.images.length > 0 ? (
                              <img
                                src={track.album.images[0].url}
                                alt={track.album.name}
                                className="w-full h-full object-cover rounded neumorphic-shadow-sm"
                              />
                            ) : (
                              <div className="w-full h-full neumorphic-card-inset rounded flex items-center justify-center">
                                <Music className="w-6 h-6 neumorphic-subtitle" />
                              </div>
                            )}
                          </div>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium neumorphic-title truncate">
                              {track.name}
                            </h5>
                            <p className="text-sm neumorphic-subtitle truncate">
                              {track.artists.map(artist => artist.name).join(', ')}
                            </p>
                            <p className="text-xs neumorphic-subtitle truncate">
                              {track.album.name}
                            </p>
                          </div>

                          {/* BPM and Duration */}
                          <div className="flex items-center gap-4 text-sm neumorphic-subtitle">
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              <span>{Math.round(track.tempo || 0)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(track.duration_ms)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
