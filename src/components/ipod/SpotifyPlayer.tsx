import { useEffect, useRef, useState } from 'react'
import { usePlayback } from './state/playbackContext'
import './spotify.css'

/* Spotify's iFrame API (https://developer.spotify.com/documentation/embeds/references/iframe-api). */
interface PlaybackUpdate {
  /** Times in milliseconds. */
  data: { isPaused: boolean; isBuffering: boolean; position: number; duration: number }
}
interface EmbedController {
  loadUri: (uri: string) => void
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
  addListener: (event: 'playback_update', listener: (e: PlaybackUpdate) => void) => void
  destroy: () => void
}
interface IFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: EmbedController) => void,
  ) => void
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void
  }
}

const API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'
const EMBED_HEIGHT = 80
/** After loading a song, the embed may still report the previous one for a moment; ignore it this long (ms). */
const SETTLE_MS = 1000

let apiPromise: Promise<IFrameAPI> | null = null
/** Loads the iFrame API script once and resolves with it. */
function loadApi(): Promise<IFrameAPI> {
  apiPromise ??= new Promise((resolve) => {
    window.onSpotifyIframeApiReady = resolve
    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    document.body.appendChild(script)
  })
  return apiPromise
}

const trackUri = (spotifyId: string) => `spotify:track:${spotifyId}`

/**
 * The sound behind Now Playing: Spotify's embed in a small corner panel, shown
 * once Play is first pressed. The click wheel drives it (play, pause, skip,
 * scrub), and it reports its real position and length back, so the iPod's clock
 * matches what is heard (a 30-second preview for visitors who aren't signed in
 * to Spotify) and moves on when the song ends.
 */
export function SpotifyPlayer() {
  const { started, status, track, trackIndex, seekRequest, reportEmbed } = usePlayback()
  const hostRef = useRef<HTMLElement>(null)
  const [controller, setController] = useState<EmbedController | null>(null)
  const uri = track ? trackUri(track.spotifyId) : null
  /** What the embed was last told to load, and when (performance.now()). */
  const loaded = useRef<{ uri: string; trackIndex: number; at: number } | null>(null)
  const current = useRef({ uri, trackIndex })
  useEffect(() => {
    current.current = { uri, trackIndex }
  }, [uri, trackIndex])

  // Create the embed the first time Play is pressed.
  useEffect(() => {
    if (!started || !hostRef.current || !current.current.uri) return
    let live = true
    let created: EmbedController | null = null
    const host = document.createElement('div')
    hostRef.current.appendChild(host)
    const initial = { ...current.current, uri: current.current.uri, at: performance.now() }
    loadApi().then((api) => {
      if (!live) return
      api.createController(host, { uri: initial.uri, width: '100%', height: EMBED_HEIGHT }, (c) => {
        if (!live) return c.destroy()
        created = c
        loaded.current = initial
        setController(c)
      })
    })
    return () => {
      live = false
      created?.destroy()
      setController(null)
    }
  }, [started])

  // Keep the embed on the iPod's track, playing or paused with it.
  useEffect(() => {
    if (!controller || !uri) return
    if (loaded.current?.uri !== uri) {
      loaded.current = { uri, trackIndex, at: performance.now() }
      controller.loadUri(uri)
    }
    if (status === 'playing') controller.play()
    else controller.pause()
  }, [controller, uri, trackIndex, status])

  // Scrubs on the wheel move the embed too.
  useEffect(() => {
    if (controller && seekRequest) controller.seek(seekRequest.seconds)
  }, [controller, seekRequest])

  // Report the embed's position and length, tagged with the track it has loaded.
  const reportRef = useRef(reportEmbed)
  useEffect(() => {
    reportRef.current = reportEmbed
  }, [reportEmbed])
  useEffect(() => {
    if (!controller) return
    controller.addListener('playback_update', ({ data }) => {
      const song = loaded.current
      if (!song || data.isPaused || data.isBuffering || performance.now() - song.at < SETTLE_MS) return
      reportRef.current(song.trackIndex, data.position / 1000, data.duration / 1000)
    })
  }, [controller])

  return <section ref={hostRef} className="spotify-player" hidden={!started} aria-label="Spotify player" />
}
