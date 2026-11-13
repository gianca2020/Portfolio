import { ResumeIcon } from './icons'
import './recruiter-button.css'
import { STAGE_BUTTON_CLASS } from './styles'

/**
 * Persistent escape hatch to Recruiter View, fixed to the top-right corner
 * outside the chassis. The stage renders it first, so it doubles as a skip link.
 * Below 300px it shrinks to a 34px icon key so it clears the stage name tag.
 */
export function RecruiterButton() {
  return (
    <a href="#/recruiter" aria-label="Recruiter View — simple one-page résumé" className={STAGE_BUTTON_CLASS}>
      <ResumeIcon className="size-[16px] shrink-0" />
      <span className="recruiter-button__label">Recruiter View</span>
    </a>
  )
}
