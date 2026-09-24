import { ResumeIcon } from './icons'
import './recruiter-button.css'

/** Geometry here; the skin (stage-token colours and states) lives in recruiter-button.css. */
const CLASS_NAME = [
  'recruiter-button fixed z-50',
  'top-[max(12px,env(safe-area-inset-top))] right-[max(12px,env(safe-area-inset-right))]',
  'inline-flex h-[34px] items-center gap-[7px] rounded-[7px] pr-[12px] pl-[10px]',
  'font-sans text-[13px] leading-none font-medium whitespace-nowrap select-none',
].join(' ')

/**
 * Persistent escape hatch to Recruiter View, fixed to the top-right corner
 * outside the chassis. The stage renders it first, so it doubles as a skip link.
 * Below 300px it shrinks to a 34px icon key so it clears the stage name tag.
 */
export function RecruiterButton() {
  return (
    <a href="#/recruiter" aria-label="Recruiter View — simple one-page résumé" className={CLASS_NAME}>
      <ResumeIcon className="size-[16px] shrink-0" />
      <span className="recruiter-button__label">Recruiter View</span>
    </a>
  )
}
