import type { ComponentType, Ref, SVGProps } from 'react'
import type { ContactInfo, ContactLink, Profile } from '../../data/types'
import { isUpcoming, shortUrl } from './format'
import { GitHubIcon, GradCapIcon, LinkedInIcon, MailIcon } from './icons'
import { Separator } from './Separator'
import { Time } from './Time'

interface ProfileHeaderProps {
  profile: Profile
  contact: ContactInfo
  /** Receives the h1 so the view can move focus to it on open. */
  headingRef?: Ref<HTMLHeadingElement>
}

interface ContactItem {
  link: ContactLink
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  external: boolean
}

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' } as const

export function ProfileHeader({ profile, contact, headingRef }: ProfileHeaderProps) {
  const { education } = profile
  const contacts: ContactItem[] = [
    { link: contact.email, Icon: MailIcon, external: false },
    { link: contact.github, Icon: GitHubIcon, external: true },
    { link: contact.linkedin, Icon: LinkedInIcon, external: true },
  ]

  return (
    <header className="flex items-start gap-5 pt-10 pb-10 sm:pt-14 print:pt-0 print:pb-6">
      {profile.photo && (
        <img src={profile.photo} alt="" className="size-18 shrink-0 rounded-full object-cover max-sm:hidden" />
      )}
      <div className="min-w-0">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className={
            'text-[1.875rem] leading-[1.15] font-semibold tracking-[-0.02em] text-(--rv-ink) outline-none ' +
            'sm:text-[2.25rem]'
          }
        >
          {profile.name}
        </h1>
        <p className="mt-1.5 text-lg leading-snug text-(--rv-ink-2)">
          {profile.title}
          <Separator />
          {profile.location}
        </p>
        <p className="mt-4 max-w-[38rem] text-[1.0625rem] leading-relaxed text-(--rv-ink)">{profile.headline}</p>
        {profile.availability && (
          <p className="mt-2 text-[0.9375rem] font-medium text-(--rv-ink-2)">{profile.availability}</p>
        )}

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
          {contacts.map(({ link, Icon, external }) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(external ? NEW_TAB : {})}
                className={
                  'inline-flex items-center gap-2 font-medium text-(--rv-accent) wrap-anywhere ' +
                  'underline-offset-[3px] hover:underline'
                }
              >
                <Icon className="size-4 shrink-0 text-(--rv-ink-2)" />
                <span className="sr-only">{link.label}: </span>
                <span className="print:hidden">{link.display}</span>
                {/* Paper can't be clicked: print the full address (the display text may be abbreviated). */}
                <span className="hidden print:inline">{shortUrl(link.href)}</span>
                {external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-start gap-2 text-sm leading-[1.375rem] text-(--rv-ink-2)">
          <GradCapIcon className="mt-[3px] size-4 shrink-0 text-(--rv-ink-3)" />
          <span className="sr-only">Education: </span>
          <span>
            {education.degree}
            <Separator />
            {education.school}
            <Separator />
            {isUpcoming(education.graduation) && 'Expected '}
            <Time value={education.graduation} />
          </span>
        </p>
      </div>
    </header>
  )
}
