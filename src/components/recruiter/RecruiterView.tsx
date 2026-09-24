import { useEffect, useRef } from 'react'
import { portfolio } from '../../data/portfolio'
import type { Portfolio } from '../../data/types'
import { useDocumentTitle, useThemeColor } from './documentHooks'
import { Entry } from './Entry'
import { ExperienceEntry } from './ExperienceEntry'
import { isUpcoming } from './format'
import { ProfileHeader } from './ProfileHeader'
import { ProjectEntry } from './ProjectEntry'
import './recruiter.css'
import { Section } from './Section'
import { SkillList } from './SkillList'
import { pageColumn, textLink } from './styles'
import { Time } from './Time'
import { TopBar } from './TopBar'

interface RecruiterViewProps {
  /** Content to render. Defaults to the site's portfolio; overridable for tests. */
  data?: Portfolio
}

/** Clean, conventional one-page résumé — the escape hatch from the iPod. */
export function RecruiterView({ data = portfolio }: RecruiterViewProps) {
  const { profile, contact, resume, skills } = data
  const { education } = profile
  const work = data.experience.filter((item) => item.kind === 'work')
  const leadership = data.experience.filter((item) => item.kind === 'leadership')
  const projects = data.projects.filter((project) => !project.placeholder)
  // Everything the iPod's About Me screen says, so this page stays a complete alternative to the device.
  const about = [
    { name: 'Focus', items: profile.focus },
    { name: 'Interests', items: profile.interests },
  ].filter((group) => group.items.length > 0)

  const rootRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useDocumentTitle(`${profile.name} — Résumé`)
  useThemeColor(rootRef)
  // Land keyboard and screen-reader users at the top of the résumé rather than on <body>.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div ref={rootRef} className="rv flex min-h-dvh flex-col bg-(--rv-bg) font-sans text-base text-(--rv-ink)">
      <TopBar name={profile.name} resume={resume} />

      <main className={`${pageColumn} flex-1 pb-12`}>
        <ProfileHeader profile={profile} contact={contact} headingRef={headingRef} />

        {work.length > 0 && (
          <Section id="experience" title="Experience">
            <div className="space-y-8">
              {work.map((item) => (
                <ExperienceEntry key={item.id} item={item} />
              ))}
            </div>
          </Section>
        )}

        {projects.length > 0 && (
          <Section id="projects" title="Projects">
            <div className="space-y-9">
              {projects.map((project) => (
                <ProjectEntry key={project.id} project={project} />
              ))}
            </div>
          </Section>
        )}

        <Section id="skills" title="Skills">
          <SkillList groups={skills} />
        </Section>

        <Section id="education" title="Education">
          <Entry
            title={education.degree}
            subtitle={education.school}
            when={
              <>
                {isUpcoming(education.graduation) && 'Expected '}
                <Time value={education.graduation} />
              </>
            }
            where={education.location}
          />
        </Section>

        {leadership.length > 0 && (
          <Section id="leadership" title="Leadership">
            <div className="space-y-8">
              {leadership.map((item) => (
                <ExperienceEntry key={item.id} item={item} />
              ))}
            </div>
          </Section>
        )}

        {(profile.bio.length > 0 || about.length > 0) && (
          <Section id="about" title="About">
            {profile.bio.length > 0 && (
              <div className="mb-5 max-w-[38rem] space-y-3 text-[0.9375rem] leading-relaxed text-(--rv-ink) last:mb-0">
                {profile.bio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
            {about.length > 0 && <SkillList groups={about} />}
          </Section>
        )}
      </main>

      <footer className="rv-footer border-t border-(--rv-rule)">
        <div
          className={
            `${pageColumn} flex flex-col gap-1.5 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] ` +
            'text-sm text-(--rv-ink-3) sm:flex-row sm:items-baseline sm:justify-between'
          }
        >
          <p>
            Prefer the interactive version?{' '}
            <a href="#/" className={textLink}>
              Back to the iPod
            </a>
          </p>
          <p>
            Résumé PDF updated <Time value={resume.updated} />
          </p>
        </div>
      </footer>
    </div>
  )
}
