import { m } from 'framer-motion'
import type { MouseEvent } from 'react'
import { portfolio } from '../../data/portfolio'
import { Artwork } from './Artwork'
import { projectNodeId } from './data'
import {
  COVER_PERSPECTIVE,
  COVER_SIZE,
  COVER_WINDOW,
  coverCaption,
  coverPose,
  describeCover,
} from './detail/coverFlow'
import { clampIndex } from './navigation'
import { useSettings } from './state/settingsContext'
import type { ScreenNode, ScreenProps } from './types'
import { useScreenController } from './useScreenController'
import './screens.css'

const COVER_TOP = 14
const REFLECTION = 42

// Covers are wheel-driven; a pointer press must not leave focus on one.
const keepFocus = (event: MouseEvent) => event.preventDefault()

/** View All Projects: the 6G Cover Flow browser on black. */
export function CoverFlow({ node, index, active, api }: ScreenProps<ScreenNode>) {
  const { projects } = portfolio
  const { reducedMotion } = useSettings()
  // The engine clamps against the last registered count, which can briefly be another screen's.
  const centre = clampIndex(index, projects.length)
  const current = projects[centre]

  useScreenController(api, active, {
    count: projects.length,
    onSelect: (i) => projects[i] && api.open(projectNodeId(projects[i].id)),
    describe: (i) => (projects[i] ? describeCover(projects[i], i, projects.length) : undefined),
  })

  // An outgoing (sliding-out) Cover Flow must not drive the incoming screen.
  const onCoverClick = (event: MouseEvent, i: number) => {
    if (!active) return
    if (i !== centre) api.setIndex(i)
    // A multi-click's later clicks never open: they can land on the centre cover right
    // after the first click opened Cover Flow. Side covers take every click, so fast
    // clicking still browses.
    else if (event.detail <= 1) api.open(projectNodeId(projects[i].id))
  }

  const transition = reducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' as const }

  return (
    <section aria-label={node.title} className="cover-flow absolute inset-0 overflow-hidden font-ipod">
      <ul
        aria-label="Projects"
        className="absolute inset-0"
        style={{ perspective: COVER_PERSPECTIVE, perspectiveOrigin: `50% ${COVER_TOP + COVER_SIZE / 2}px` }}
      >
        {projects.map((project, i) => {
          const offset = i - centre
          if (Math.abs(offset) > COVER_WINDOW) return null
          const pose = coverPose(offset)
          const centred = offset === 0
          return (
            <m.li
              key={project.id}
              initial={false}
              animate={{ x: pose.x, z: pose.z, rotateY: pose.rotateY }}
              transition={transition}
              aria-current={centred ? 'true' : undefined}
              className="absolute"
              style={{
                top: COVER_TOP,
                left: `calc(50% - ${COVER_SIZE / 2}px)`,
                width: COVER_SIZE,
                zIndex: pose.zIndex,
              }}
            >
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={keepFocus}
                onClick={(event) => onCoverClick(event, i)}
                aria-label={centred ? `${project.name}, open project` : project.name}
                className="block cursor-pointer"
                style={{ width: COVER_SIZE, height: COVER_SIZE }}
              >
                <Artwork spec={project.artwork} className="h-full w-full" />
              </button>
              <div
                aria-hidden="true"
                className="lcd-reflection mt-[1px]"
                style={{ width: COVER_SIZE, height: REFLECTION }}
              >
                <div style={{ width: COVER_SIZE, height: COVER_SIZE }}>
                  <Artwork spec={project.artwork} className="h-full w-full" />
                </div>
              </div>
            </m.li>
          )
        })}
      </ul>

      {current ? (
        <div className="absolute right-[12px] bottom-[10px] left-[12px] text-center">
          <p className="truncate text-[13px] leading-[17px] font-bold text-(color:--flow-ink)">{current.name}</p>
          <p className="truncate text-[11px] leading-[14px] text-(color:--flow-ink-2)">{coverCaption(current)}</p>
        </div>
      ) : (
        <p className="absolute inset-x-0 top-[96px] text-center text-[13px] font-bold text-(color:--flow-ink)">
          No Projects
        </p>
      )}
    </section>
  )
}
