import { useEffect, useRef, type ReactNode } from 'react'
import { findExperience, findProject, portfolio } from '../../data/portfolio'
import { ExperienceEntry } from '../recruiter/ExperienceEntry'
import { ProfileHeader } from '../recruiter/ProfileHeader'
import { ProjectEntry } from '../recruiter/ProjectEntry'
import '../recruiter/recruiter.css'
import { ResumeSections } from '../recruiter/RecruiterView'
import { SkillList } from '../recruiter/SkillList'
import type { ScreenSpec } from './types'
import './expand.css'

const { profile, contact } = portfolio

/** What the reader shows for a screen, or null when the screen has nothing to read (Cover Flow, Now Playing…). */
function expandedContent(spec: ScreenSpec): { title: string; body: ReactNode } | null {
  switch (spec.type) {
    case 'project': {
      const project = findProject(spec.projectId)
      return project ? { title: project.name, body: <ProjectEntry project={project} /> } : null
    }
    case 'experience': {
      const item = findExperience(spec.experienceId)
      return item ? { title: item.role, body: <ExperienceEntry item={item} /> } : null
    }
    case 'about': {
      const groups = [
        { name: 'Focus', items: profile.focus },
        { name: 'Interests', items: profile.interests },
      ].filter((group) => group.items.length > 0)
      return {
        title: 'About Me',
        body: (
          <>
            <ProfileHeader profile={profile} contact={contact} />
            <div className="mb-6 max-w-[38rem] space-y-3 text-[0.9375rem] leading-relaxed">
              {profile.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <SkillList groups={groups} />
          </>
        ),
      }
    }
    case 'resume':
      return {
        title: 'Resume',
        body: (
          <>
            <ProfileHeader profile={profile} contact={contact} />
            <ResumeSections />
          </>
        ),
      }
    default:
      return null
  }
}

interface ExpandedReaderProps {
  spec: ScreenSpec
  onClose: () => void
}

/**
 * The current iPod screen as a plain, full-size page in a modal dialog, so the
 * work can be read without the click wheel. Esc, the close button or a click on
 * the backdrop close it; the iPod underneath keeps its place.
 */
export function ExpandedReader({ spec, onClose }: ExpandedReaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const content = expandedContent(spec)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // Nothing to show (an unknown project, say): close at once rather than leave the iPod paused.
  const empty = !content
  useEffect(() => {
    if (empty) onClose()
  }, [empty, onClose])

  if (!content) return null

  // A click on the backdrop closes it; keyboard users have Esc and the Close button.
  // Closing hands focus back to the Expand button natively.
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-label={content.title}
      className="expand-reader rv"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <div className="expand-reader__sheet font-sans text-base text-(--rv-ink)">
        <div className="expand-reader__bar">
          <p className="text-sm font-semibold text-(--rv-ink-2)">{content.title}</p>
          <button type="button" className="expand-reader__close" onClick={() => dialogRef.current?.close()} autoFocus>
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="expand-reader__body">{content.body}</div>
      </div>
    </dialog>
  )
}
