import { Fragment } from 'react'
import type { SkillGroup } from '../../data/types'

/** Named lists as a two-column term / items grid (skill groups, focus areas, interests). */
export function SkillList({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className="grid gap-x-6 text-[0.9375rem] leading-relaxed sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-y-2.5">
      {groups.map((group) => (
        <Fragment key={group.name}>
          <dt className="font-semibold text-(--rv-ink)">{group.name}</dt>
          <dd className="mb-3 text-(--rv-ink-2) last:mb-0 sm:mb-0">{group.items.join(', ')}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
