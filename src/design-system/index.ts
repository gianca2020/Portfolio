/**
 * Design System bundle entry.
 *
 * Builds (via `vite.ds.config.ts`) a single classic IIFE that reads React 18
 * from `window.React` / `window.ReactDOM` and assigns the portfolio's public
 * components to `window.GFIpod`, alongside `bundle.css`. Consumers (a preview
 * host, a docs page) provide React globally, add the stylesheet, then render
 * e.g. `window.GFIpod.IPodPage`.
 *
 * NOTE: reconstructed during the repo port — the original entry file was not
 * copied over, so this re-exports the natural public surface. `IPodPage` is the
 * self-contained experience (it wires up its own Settings/Playback providers).
 */
import '../index.css'

/** The whole iPod experience — self-contained; just render it. */
export { IPodPage } from '../components/ipod/IPodPage'
/** The bare device (chassis + LCD + wheel). Must be wrapped in the providers below. */
export { IPod } from '../components/ipod/IPod'
/** The one-page, click-wheel-free résumé view. */
export { RecruiterView } from '../components/recruiter/RecruiterView'
/** Context providers, for embedding <IPod> on its own. */
export { SettingsProvider } from '../components/ipod/state/SettingsProvider'
export { PlaybackProvider } from '../components/ipod/state/PlaybackProvider'
