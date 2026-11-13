import { useEffect, useRef, useState } from 'react'
import { usePlayback } from './state/playbackContext'
import './spotify.css'

/* Spotify's iFrame API (https://developer.spotify.com/documentation/embeds/references/iframe-api). */
interface PlaybackUpdate {
  /** Times in milliseconds. */
  data: { playingURI: string; isPaused: boolean; isBuffering: boolean; position: number; duration: number }
}
interface EmbedController {
  loadUri: (uri: string) => void
  play: () => void
  resume: () => void
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
/**
 * How long (ms) the embed has to start playing after being asked. Past that it was
 * refused (browsers can block audio that doesn't start from a tap), so the iPod pauses
 * too rather than run a silent clock; pressing play in the embed then resumes both.
 */
const START_TIMEOUT_MS = 4000

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
 * to Spotify) and moves on when the song ends. Playing or pausing from the
 * embed's own controls carries over to the iPod.
 */
export function SpotifyPlayer() {
  const { started, status, track, trackIndex, seekRequest, reportEmbed, followEmbed } = usePlayback()
  const hostRef = useRef<HTMLElement>(null)
  const [controller, setController] = useState<EmbedController | null>(null)
  const uri = track ? trackUri(track.spotifyId) : null
  /** What the embed was last told to load, and whether it has started playing it yet. */
  const loaded = useRef<{ uri: string; trackIndex: number; begun: boolean } | null>(null)
  /**
   * The state last asked of the embed, and whether it has confirmed it. Until it
   * does, reports showing the other state are the old one still in flight.
   */
  const command = useRef({ playing: false, confirmed: true })
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
    const initial = { ...current.current, uri: current.current.uri, begun: false }
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
      loaded.current = { uri, trackIndex, begun: false }
      controller.loadUri(uri)
    }
    const playing = status === 'playing'
    command.current = { playing, confirmed: false }
    if (!playing) {
      controller.pause()
      return
    }
    // play() starts a freshly loaded song; resume() carries on from where it was paused.
    if (loaded.current.begun) controller.resume()
    else {
      loaded.current.begun = true
      controller.play()
    }
    const timer = window.setTimeout(() => {
      if (command.current.playing && !command.current.confirmed) {
        command.current = { playing: false, confirmed: true }
        followEmbed(false)
      }
    }, START_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [controller, uri, trackIndex, status, followEmbed])

  // Scrubs on the wheel move the embed too.
  useEffect(() => {
    if (controller && seekRequest) controller.seek(Math.round(seekRequest.seconds))
  }, [controller, seekRequest])

  // Report the embed's position and length, tagged with the track it has loaded.
  // Updates for any other song (the previous one, still in flight) are ignored.
  const handlers = useRef({ reportEmbed, followEmbed })
  useEffect(() => {
    handlers.current = { reportEmbed, followEmbed }
  }, [reportEmbed, followEmbed])
  useEffect(() => {
    if (!controller) return
    controller.addListener('playback_update', ({ data }) => {
      const song = loaded.current
      if (!song || data.playingURI !== song.uri || data.isBuffering) return
      const playing = !data.isPaused
      if (!command.current.confirmed) {
        if (playing !== command.current.playing) return
        command.current.confirmed = true
      } else if (playing !== command.current.playing) {
        // Played or paused from the embed's own controls.
        command.current = { playing, confirmed: true }
        handlers.current.followEmbed(playing)
      }
      if (playing) handlers.current.reportEmbed(song.trackIndex, data.position / 1000, data.duration / 1000)
    })
  }, [controller])

  return <section ref={hostRef} className="spotify-player" hidden={!started} aria-label="Spotify player" />
}
