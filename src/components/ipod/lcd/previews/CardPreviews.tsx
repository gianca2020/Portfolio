import { useState, type ReactNode } from 'react'
import { portfolio } from '../../../../data/portfolio'
import type { ArtworkSpec, Experience, Project } from '../../../../data/types'
import { Artwork } from '../../Artwork'
import { SPLIT_PANEL_WIDTH } from '../../constants'
import { CARD_TEXT_WIDTH, experienceCardLayout } from '../cardLayout'
import { useLcdReducedMotion } from '../hooks'
import { kenBurnsVars } from '../motion'
import { fitFontSize, fitJoined } from '../textMetrics'

const FIGURE = SPLIT_PANEL_WIDTH

/**
 * Square figure filling the top 160 × 160 of the panel, a short text block on
 * white below. The text starts 12px in: the list panel's shadow falls across
 * the first few pixels of the preview.
 */
function Card({ figure, children }: { figure: ReactNode; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-lcd text-lcd-ink">
      <div aria-hidden="true" className="relative shrink-0 overflow-hidden" style={{ width: FIGURE, height: FIGURE }}>
        {figure}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden pt-[6px] pr-[8px] pl-[12px]">{children}</div>
    </div>
  )
}

/** Cover with a gentle drift (text sits right beneath it, so it moves less than full-bleed art). */
function CardCover({ artwork }: { artwork: ArtworkSpec }) {
  const still = useLcdReducedMotion()
  return (
    <div className="absolute inset-0" style={kenBurnsVars(2, 'subtle')}>
      <Artwork spec={artwork} kenBurns={!still} className="h-full w-full" />
    </div>
  )
}

const NAME = 'truncate text-[13px] leading-[16px] font-bold'

/** Clamp classes by line count, written out so Tailwind finds them. */
const CLAMP: Record<number, string> = { 1: 'line-clamp-1', 2: 'line-clamp-2' }

/** Project: cover, then name · tagline · primary stack (whole technologies only). */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card figure={<CardCover artwork={project.artwork} />}>
      <p className={NAME}>{project.name}</p>
      <p className="mt-[1px] line-clamp-2 text-[11px] leading-[13px] text-lcd-ink-3">{project.tagline}</p>
      <p className="mt-[4px] truncate text-[10.5px] leading-[13px] font-bold text-lcd-ink-2">
        {fitJoined(project.stack.slice(0, 3), CARD_TEXT_WIDTH, 10.5)}
      </p>
    </Card>
  )
}

/** Role: cover, then organisation · role · dates · summary, fitted by experienceCardLayout. */
export function ExperienceCard({ experience }: { experience: Experience }) {
  const { organization, org, roleLines, summaryLines } = experienceCardLayout(experience)
  return (
    <Card figure={<CardCover artwork={experience.artwork} />}>
      <p
        className={`font-bold ${CLAMP[org.lines]}`}
        style={{ fontSize: org.size, lineHeight: `${org.leading}px` }}
      >
        {organization}
      </p>
      <p className={`text-[11px] leading-[13px] ${CLAMP[roleLines]}`}>{experience.role}</p>
      <p className="truncate text-[10.5px] leading-[13px] font-bold text-lcd-ink-2">
        {experience.start} – {experience.end}
      </p>
      {summaryLines > 0 && (
        <p className={`mt-[2px] text-[11px] leading-[13px] text-lcd-ink-3 ${CLAMP[summaryLines]}`}>
          {experience.summary}
        </p>
      )}
    </Card>
  )
}

/** Initials engraved on a neutral grey tile, for when there is no photo. */
function Monogram({ initials }: { initials: string }) {
  const size = fitFontSize(initials, FIGURE - 48, { max: 68, min: 32, tracking: -0.02 })
  return (
    <div
      className="lcd-monogram absolute inset-0 flex items-center justify-center leading-none font-bold"
      style={{ fontSize: size }}
    >
      {initials}
    </div>
  )
}

function Portrait({ src, initials }: { src?: string; initials: string }) {
  const [failed, setFailed] = useState<string>()
  if (!src || failed === src) return <Monogram initials={initials} />
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(src)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

/** About Me: portrait (or monogram), then name · title · location. */
export function ProfileCard() {
  const { profile } = portfolio
  return (
    <Card figure={<Portrait src={profile.photo} initials={profile.initials} />}>
      <div className="pt-[2px]">
        <p className={NAME}>{profile.name}</p>
        <p className="mt-[1px] truncate text-[11px] leading-[14px]">{profile.title}</p>
        <p className="truncate text-[11px] leading-[14px] text-lcd-ink-3">{profile.location}</p>
      </div>
    </Card>
  )
}
