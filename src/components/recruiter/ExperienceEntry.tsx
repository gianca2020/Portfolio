import type { Experience } from '../../data/types'
import { Bullets, Entry, Metrics } from './Entry'
import { DateRange } from './Time'

export function ExperienceEntry({ item }: { item: Experience }) {
  return (
    <Entry
      title={item.role}
      subtitle={item.organization}
      when={<DateRange start={item.start} end={item.end} />}
      where={item.location}
    >
      {item.metrics?.length ? <Metrics items={item.metrics} /> : null}
      <Bullets items={item.highlights} />
    </Entry>
  )
}
