import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

/** 16 × 16 line icon; decorative, so hidden from assistive technology. */
function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const MailIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
    <path d="m2.5 4.5 5.5 4.25 5.5-4.25" />
  </Icon>
)

/** GitHub mark (Octicons, MIT). */
export const GitHubIcon = (props: IconProps) => (
  <Icon fill="currentColor" stroke="none" {...props}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </Icon>
)

export const LinkedInIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="2" />
    <path d="M5.25 7.25v3.75M5.25 5v.05M7.75 11V7.25m0 1.9c0-1.15.8-1.9 1.8-1.9s1.7.7 1.7 1.85V11" />
  </Icon>
)

export const GradCapIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M1.25 6 8 3l6.75 3L8 9 1.25 6z" />
    <path d="M4.25 7.4v3.1c0 .85 1.7 1.75 3.75 1.75s3.75-.9 3.75-1.75V7.4M14.75 6v3.25" />
  </Icon>
)

export const DownloadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 2.25v8M4.75 7.25 8 10.5l3.25-3.25M2.75 13.5h10.5" />
  </Icon>
)

/** Arrow out of the page — marks links that open in a new tab. */
export const ExternalIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 11 11 5M6 5h5v5" />
  </Icon>
)

/** A tiny iPod classic: screen over click wheel. */
export const IPodIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.75" y="1.25" width="8.5" height="13.5" rx="1.75" />
    <rect x="5.25" y="2.75" width="5.5" height="4" rx=".5" />
    <circle cx="8" cy="10.6" r="2.1" />
  </Icon>
)

/** A résumé page with a person on it. */
export const ResumeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.75 1.75h5.5l3 3v9.5h-8.5z" />
    <path d="M9.25 1.75v3h3" />
    <circle cx="8" cy="7.35" r="1.35" />
    <path d="M5.85 11.6c.35-1.1 1.15-1.7 2.15-1.7s1.8.6 2.15 1.7" />
  </Icon>
)
