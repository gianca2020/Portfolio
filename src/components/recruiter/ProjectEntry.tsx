import type { Project } from '../../data/types'
import { projectLinkList } from '../ipod/detail/links'
import { Bullets, Entry, Metrics } from './Entry'
import { shortUrl } from './format'
import { ExternalIcon } from './icons'
import { outlineButton } from './styles'
import { Time } from './Time'

export function ProjectEntry({ project }: { project: Project }) {
  const links = projectLinkList(project.links)

  return (
    <Entry title={project.name} when={<Time value={project.date} />}>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-(--rv-ink)">{project.description}</p>
      {project.role && (
        <p className="mt-1.5 text-sm leading-normal text-(--rv-ink-3)">
          <span className="font-semibold text-(--rv-ink-2)">Role:</span> {project.role}
        </p>
      )}
      <p className="mt-1.5 text-sm leading-normal text-(--rv-ink-3)">
        <span className="font-semibold text-(--rv-ink-2)">Stack:</span> {project.stack.join(', ')}
      </p>
      {project.metrics?.length ? <Metrics items={project.metrics} /> : null}
      <Bullets items={project.highlights.slice(0, 4)} />
      {links.length > 0 && (
        <ul className="mt-3.5 flex flex-wrap gap-2 print:mt-2 print:gap-x-5 print:gap-y-0.5">
          {links.map(({ key, label, href }) => (
            <li key={key}>
              <a href={href} target="_blank" rel="noopener noreferrer" className={outlineButton}>
                {label}
                <span className="sr-only">
                  : {project.name} (opens in a new tab)
                </span>
                <ExternalIcon className="size-3.5 shrink-0 opacity-75 print:hidden" />
                {/* On paper the button becomes "GitHub: github.com/…". */}
                <span className="hidden font-normal print:inline">: {shortUrl(href)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Entry>
  )
}
