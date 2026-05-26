// src/components/player/VideoPlayer.jsx
import { useRef, useState, useEffect, useCallback } from 'react'
import ReactPlayer from 'react-player'
import { useAuth } from '../../context/AuthContext'
import { saveContinueWatching } from '../../services/firestore'
import { getVideoUrl } from '../../services/cloudinary'
import {
  MdPlayArrow, MdPause, MdVolumeUp, MdVolumeMute,
  MdFullscreen, MdFullscreenExit, MdForward10, MdReplay10,
  MdArrowBack
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

export default function VideoPlayer({ content, episodeId }) {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const playerRef  = useRef(null)
  const wrapperRef = useRef(null)
  const hideTimer  = useRef(null)

  const [playing,    setPlaying]    = useState(false)
  const [ready,      setReady]      = useState(false)
  const [volume,     setVolume]     = useState(0.8)
  const [muted,      setMuted]      = useState(false)
  const [played,     setPlayed]     = useState(0)
  const [duration,   setDuration]   = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showCtrl,   setShowCtrl]   = useState(true)
  const [seeking,    setSeeking]    = useState(false)

  // Video URL: YouTube or Cloudinary
  const videoUrl = content.youtubeUrl
    ? content.youtubeUrl
    : content.videoCloudinaryId
      ? getVideoUrl(content.videoCloudinaryId)
      : null

  // ── Auto-hide controls ──────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    setShowCtrl(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      setShowCtrl(false)
    }, 3000)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', resetHideTimer)
    window.addEventListener('touchstart', resetHideTimer)
    return () => {
      window.removeEventListener('mousemove', resetHideTimer)
      window.removeEventListener('touchstart', resetHideTimer)
      clearTimeout(hideTimer.current)
    }
  }, [resetHideTimer])

  // Always show controls when paused
  useEffect(() => {
    if (!playing) {
      setShowCtrl(true)
      clearTimeout(hideTimer.current)
    }
  }, [playing])

  // Fullscreen change listener
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Save progress every 10s
  useEffect(() => {
    if (!user || !playing) return
    const interval = setInterval(() => {
      const secs = played * duration
      saveContinueWatching(user.uid, content.id, Math.floor(secs))
    }, 10000)
    return () => clearInterval(interval)
  }, [user, playing, played, duration, content.id])

  // ── Helpers ─────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const skip = (seconds) => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(current + seconds)
  }

  const togglePlay = () => setPlaying(p => !p)

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '00:00'
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── No video ────────────────────────────────────────────────────
  if (!videoUrl) return (
    <div className="w-full aspect-video bg-dark-800 flex items-center justify-center rounded-xl">
      <p className="text-dark-300">No video available</p>
    </div>
  )

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
    >
      {/* ── ReactPlayer ── */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing && ready}
        volume={volume}
        muted={muted}
        onReady={() => setReady(true)}
        onProgress={({ played }) => !seeking && setPlayed(played)}
        onDuration={setDuration}
        onEnded={() => setPlaying(false)}
        width="100%"
        height="100%"
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              origin: window.location.origin
            }
          }
        }}
      />

      {/* ── Transparent click interceptor over iframe ──
           YouTube iframe swallows all pointer events.
           This invisible div sits on top and forwards
           clicks to togglePlay while letting z-index
           elements (top bar, bottom bar) still work.   */}
      <div
        className="absolute inset-0 z-10"
        onClick={togglePlay}
        onMouseMove={resetHideTimer}
      />

      {/* ── Gradient overlay (cosmetic, no pointer events) ── */}
      <div
        className={`absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300 pointer-events-none ${
          showCtrl ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ── TOP BAR — z-30 so it's above the interceptor ── */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center gap-3 p-4 transition-opacity duration-300 ${
          showCtrl ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Back button — highest priority, no stopPropagation needed */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-brand-600 text-white transition-all shrink-0"
        >
          <MdArrowBack size={22} />
        </button>
        <div className="min-w-0">
          <p className="font-display text-lg tracking-wider truncate drop-shadow-lg">
            {content.title.toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── CENTER CONTROLS — z-30 ── */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center gap-10 transition-opacity duration-300 pointer-events-none ${
          showCtrl ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => skip(-10)}
          className="pointer-events-auto text-white/80 hover:text-white hover:scale-110 transition-all drop-shadow-lg"
        >
          <MdReplay10 size={42} />
        </button>

        <button
          onClick={togglePlay}
          className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 hover:scale-105 transition-all drop-shadow-lg"
        >
          {playing ? <MdPause size={32} /> : <MdPlayArrow size={32} />}
        </button>

        <button
          onClick={() => skip(10)}
          className="pointer-events-auto text-white/80 hover:text-white hover:scale-110 transition-all drop-shadow-lg"
        >
          <MdForward10 size={42} />
        </button>
      </div>

      {/* ── BOTTOM BAR — z-30 ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 p-4 transition-opacity duration-300 ${
          showCtrl ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <input
          type="range"
          min={0} max={1} step={0.001}
          value={played}
          onChange={e => {
            setSeeking(true)
            setPlayed(parseFloat(e.target.value))
          }}
          onMouseUp={e => {
            setSeeking(false)
            playerRef.current?.seekTo(parseFloat(e.target.value))
          }}
          onTouchEnd={e => {
            setSeeking(false)
            playerRef.current?.seekTo(parseFloat(e.target.value))
          }}
          className="w-full h-1 accent-brand-500 cursor-pointer mb-3 block"
        />

        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-brand-400 transition-colors"
            >
              {playing ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(p => !p)}
                className="text-white hover:text-brand-400 transition-colors"
              >
                {muted || volume === 0
                  ? <MdVolumeMute size={22} />
                  : <MdVolumeUp size={22} />
                }
              </button>
              <input
                type="range" min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={e => {
                  setVolume(parseFloat(e.target.value))
                  setMuted(false)
                }}
                className="w-20 h-1 accent-brand-500 cursor-pointer"
              />
            </div>

            <span className="text-xs font-mono text-white/70 drop-shadow">
              {formatTime(played * duration)} / {formatTime(duration)}
            </span>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-brand-400 transition-colors"
          >
            {fullscreen ? <MdFullscreenExit size={22} /> : <MdFullscreen size={22} />}
          </button>
        </div>
      </div>

      {/* ── Loading spinner ── */}
      {!ready && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}