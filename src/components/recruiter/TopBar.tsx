import type { ResumeFile } from '../../data/types'
import { DownloadIcon, IPodIcon } from './icons'
import { pageColumn, primaryButton, quietButton } from './styles'

/** Slim sticky bar: name on the left, the way back and the PDF on the right. */
export function TopBar({ name, resume }: { name: string; resume: ResumeFile }) {
  return (
    <header
      className={
        'rv-topbar sticky top-0 z-10 border-b border-(--rv-rule) bg-(--rv-bg) pt-[env(safe-area-inset-top)]'
      }
    >
      <div className={`${pageColumn} flex h-14 items-center justify-between gap-2 sm:gap-3`}>
        <p className="min-w-0 truncate text-sm font-semibold tracking-[-0.01em] text-(--rv-ink) sm:text-[0.9375rem]">
          {name}
        </p>
        <nav aria-label="Recruiter View" className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Narrow screens show short labels; the accessible names stay the full ones. */}
          <a href="#/" className={quietButton}>
            <IPodIcon className="size-4 shrink-0" />
            <span aria-hidden="true" className="sm:hidden">
              iPod
            </span>
            <span className="max-sm:sr-only">Back to iPod</span>
          </a>
          <a href={resume.href} download={resume.fileName} type="application/pdf" className={primaryButton}>
            <DownloadIcon className="size-4 shrink-0" />
            <span aria-hidden="true" className="sm:hidden">
              Résumé
            </span>
            <span className="max-sm:sr-only">Download résumé</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
