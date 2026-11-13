import { STAGE_BUTTON_CLASS } from '../recruiter/styles'
import '../recruiter/recruiter-button.css'

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Opens the current screen in the full-size reader. Sits in the stage's
 * top-right slot (Recruiter View's old spot) and only shows on screens worth reading.
 */
export function ExpandButton({ onPress }: { onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} aria-label="Expand — read this screen full size" className={STAGE_BUTTON_CLASS}>
      <ExpandIcon className="size-[15px] shrink-0" />
      <span className="recruiter-button__label">Expand</span>
    </button>
  )
}
