/* A pointing hand for the wheel tutorial, index finger up, drawn in a 50 × 64 box.
 * The outline is every shape stroked thick underneath, then filled white on top,
 * so it rings the silhouette only. */

/** Where the fingertip touches (18, 5), as a share of the box, pinned to the hand's position. */
const PIN = { translate: `${(-18 / 50) * 100}% ${(-5 / 64) * 100}%`, transformOrigin: `${(18 / 50) * 100}% ${(5 / 64) * 100}%` }

const SILHOUETTE = (
  <>
    {/* Index finger, then the curled middle, ring and little fingers. */}
    <rect x="13" y="2" width="10" height="36" rx="5" />
    <rect x="22" y="20" width="9.5" height="21" rx="4.75" />
    <rect x="30.5" y="23" width="9" height="19" rx="4.5" />
    <rect x="39" y="27" width="8" height="16" rx="4" />
    {/* Palm, with the thumb folded out on the left. */}
    <path d="M13 31H47V45C47 54 41 59 31 59H24C17 59 12 56 9.5 51L3.2 39C2 36.6 3.4 33.6 6.4 33.8C8.4 34 9.8 35.4 10.8 37.2L13 41Z" />
    {/* Cuff. */}
    <rect x="15" y="56" width="29" height="8" rx="2.5" />
  </>
)

export function CoachHand({ className }: { className?: string }) {
  return (
    <svg className={className} style={PIN} viewBox="0 0 50 64" aria-hidden="true" focusable="false">
      {/* Drawn in the SVG, not as a CSS drop-shadow: a filtered layer smears a trail while the hand glides. */}
      <g className="coach-hand__shadow" transform="translate(1.5 3)">
        {SILHOUETTE}
      </g>
      <g className="coach-hand__outline">{SILHOUETTE}</g>
      <g className="coach-hand__fill">{SILHOUETTE}</g>
      {/* Creases between the curled fingers, the thumb and the cuff seam. */}
      <path
        className="coach-hand__crease"
        d="M22.5 31.5V37M31 34V39.5M39.5 36V41M11.6 40.5C12.6 43 14.5 44.5 17 45M15.5 56.5H43.5"
      />
    </svg>
  )
}
