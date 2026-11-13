import type { ReactNode } from 'react'
import { asset, hasText, paragraphs, texts, type CaseStudy as CaseStudyData } from '../../content/work'
import { useLightbox, type OpenLightbox } from './hooks'
import { CaseImage, MediaFigure } from './Media'

/*
 * Skip rules: a field that is empty or 'TODO', an empty list, or media whose
 * file isn't published renders nothing, and a section whose content all
 * skipped renders no heading either. So every section below first works out
 * what it has, then returns null when that's nothing.
 */

function Prose({ text }: { text: string }) {
  return paragraphs(text).map((p, i) => <p key={i}>{p}</p>)
}

function Section({ id, title, wide = false, children }: { id: string; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={`work-section${wide ? ' work-section--wide' : ''}`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="work-section__title">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Renders `section` only when there's something to show. */
const when = (show: boolean, section: () => ReactNode) => (show ? section() : null)

function Snapshot({ study }: { study: CaseStudyData }) {
  const { role, team, timeline, tools, platforms, metrics } = study.snapshot
  const facts = [
    ['Role', role],
    ['Team', team],
    ['Timeline', timeline],
    ['Tools', texts(tools).join(', ')],
    ['Platforms', texts(platforms).join(', ')],
  ].filter(([, value]) => hasText(value))
  const tiles = metrics.filter((m) => hasText(m.value) && hasText(m.label))

  return when(facts.length + tiles.length > 0, () => (
    <Section id="snapshot" title="Snapshot">
      {facts.length > 0 && (
        <dl className="work-facts">
          {facts.map(([term, value]) => (
            <div key={term} className="work-facts__item">
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {tiles.length > 0 && (
        <ul className="work-metrics" aria-label="By the numbers">
          {tiles.map((m) => (
            <li key={m.label} className="work-metric">
              <span className="work-metric__value">{m.value}</span>
              <span className="work-metric__label">{m.label}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  ))
}

function Users({ study }: { study: CaseStudyData }) {
  const users = study.users.filter((u) => hasText(u.name) && hasText(u.description))
  return when(users.length > 0, () => (
    <Section id="users" title="Who it’s for">
      <ul className="work-cards">
        {users.map((u) => (
          <li key={u.name} className="work-card">
            <h3 className="work-card__title">{u.name}</h3>
            <p>{u.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  ))
}

function Decisions({ study, onOpen }: { study: CaseStudyData; onOpen: OpenLightbox }) {
  const decisions = study.decisions.filter(
    (d) => hasText(d.title) && (hasText(d.why) || (d.media !== undefined && asset(study.slug, d.media.src))),
  )
  return when(decisions.length > 0, () => (
    <Section id="decisions" title="Key decisions" wide>
      <ol className="work-decisions">
        {decisions.map((d, i) => {
          const media = d.media && (
            <MediaFigure folder={study.slug} media={d.media} caption={d.caption} onOpen={onOpen} className="work-decision__media" />
          )
          return (
            <li key={d.title} className={`work-decision${media ? '' : ' work-decision--text'}`}>
              <div className="work-decision__text">
                <h3 className="work-decision__title">
                  <span className="work-decision__number" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {d.title}
                </h3>
                {hasText(d.why) && <Prose text={d.why} />}
              </div>
              {media}
            </li>
          )
        })}
      </ol>
    </Section>
  ))
}

function Process({ study, onOpen }: { study: CaseStudyData; onOpen: OpenLightbox }) {
  const steps = study.process.filter((s) => hasText(s.label) && asset(study.slug, s.src))
  return when(steps.length > 0, () => (
    <Section id="process" title="Process" wide>
      <ol className="work-process">
        {steps.map((s) => (
          <li key={s.src}>
            <figure className="work-figure">
              <CaseImage folder={study.slug} image={s} caption={s.label} onOpen={onOpen} />
              <figcaption>{s.label}</figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </Section>
  ))
}

function FinalDesign({ study, onOpen }: { study: CaseStudyData; onOpen: OpenLightbox }) {
  const { text, media } = study.finalDesign
  const shown = media.filter((m) => asset(study.slug, m.src))
  return when(hasText(text) || shown.length > 0, () => (
    <Section id="final" title="Final design" wide>
      {hasText(text) && (
        <div className="work-prose">
          <Prose text={text} />
        </div>
      )}
      {shown.map((m) => (
        <MediaFigure key={m.src} folder={study.slug} media={m} onOpen={onOpen} className="work-final__media" />
      ))}
    </Section>
  ))
}

function Links({ study }: { study: CaseStudyData }) {
  const links = study.links.filter((l) => hasText(l.label) && hasText(l.href))
  return when(links.length > 0, () => (
    <Section id="links" title="Links">
      <ul className="work-links">
        {links.map((l) => (
          <li key={l.href}>
            <a className="work-button" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
              <span className="sr-only"> (opens in a new tab)</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  ))
}

function TextSection({ id, title, text }: { id: string; title: string; text: string }) {
  return when(hasText(text), () => (
    <Section id={id} title={title}>
      <Prose text={text} />
    </Section>
  ))
}

/** A full case study page body, in the order the content model lists it. */
export function CaseStudy({ study }: { study: CaseStudyData }) {
  const lightbox = useLightbox()
  const { open } = lightbox
  return (
    <article className="work-case">
      <header className="work-hero">
        <div className="work-hero__text">
          <p className="work-eyebrow">Case study</p>
          <h1 className="work-hero__title" tabIndex={-1}>
            {study.title}
          </h1>
          {hasText(study.summary) && <p className="work-lead">{study.summary}</p>}
        </div>
        {study.cover && (
          <div className="work-hero__cover">
            <CaseImage folder={study.slug} image={study.cover} onOpen={open} priority />
          </div>
        )}
      </header>

      <Snapshot study={study} />
      <TextSection id="problem" title="The problem" text={study.problem} />
      <Users study={study} />
      <Decisions study={study} onOpen={open} />
      <Process study={study} onOpen={open} />
      <FinalDesign study={study} onOpen={open} />
      <Links study={study} />
      <TextSection id="outcome" title="Outcome" text={study.outcome} />
      <TextSection id="reflection" title="Reflection" text={study.reflection} />

      {lightbox.element}
    </article>
  )
}
