import type { Metric } from '../../../data/types'
import { Hero } from './Hero'
import type { ContentBlock as Block } from './types'

/** Items up to this length never break inside; longer ones may wrap. */
const NOWRAP_MAX = 28

/** Dot-separated inline list — the iPod way to show a stack, not chips. */
function Tags({ items, label }: { items: string[]; label?: string }) {
  return (
    <div className="px-[8px] py-[3px]">
      {label && <h4 className="text-[11px] leading-[14px] font-bold">{label}</h4>}
      <ul className="text-[11.5px] leading-[15px] text-lcd-ink-2">
        {items.map((item, i) => (
          <li key={i} className="inline">
            <span className={item.length <= NOWRAP_MAX ? 'whitespace-nowrap' : undefined}>
              {item}
              {i < items.length - 1 && <span aria-hidden="true">{' ·'}</span>}
            </span>{' '}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-[3px] px-[8px] py-[3px] text-[12px] leading-[16px]">
      {items.map((item, i) => (
        <li key={i} className="relative pl-[10px]">
          <span aria-hidden="true" className="absolute left-0">
            •
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Settings › About rows: key left, value right, hairline under each. */
function KeyValues({ rows }: { rows: { key: string; value: string }[] }) {
  return (
    <dl className="detail-bleed">
      {rows.map(({ key, value }) => (
        <div
          key={key}
          className="flex h-[20px] items-center gap-[12px] border-b border-lcd-rule px-[8px] text-[12px] leading-[19px]"
        >
          <dt className="shrink-0 text-lcd-ink-2">{key}</dt>
          <dd className="min-w-0 flex-1 truncate text-right font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Metrics({ items }: { items: Metric[] }) {
  return (
    <dl
      className="grid px-[8px] py-[5px]"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((metric, i) => (
        // Value is drawn above its label; the DOM keeps term-before-definition order.
        <div
          key={metric.label}
          className={`flex flex-col-reverse justify-end pr-[6px] ${i > 0 ? 'border-l border-lcd-rule pl-[8px]' : ''}`}
        >
          <dt className="text-[10.5px] leading-[13px] text-lcd-ink-3">{metric.label}</dt>
          <dd className="truncate text-[17px] leading-[20px] font-bold">{metric.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Renders one non-action detail block on the 320-wide grid. */
export function ContentBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return <Hero block={block} />
    case 'heading':
      return (
        <h3 className="detail-bleed lcd-band mt-[5px] mb-[3px] h-[16px] truncate px-[8px] text-[11px] leading-[16px] font-bold">
          {block.text}
        </h3>
      )
    case 'text':
      return block.tone === 'caption' ? (
        <p className="px-[8px] py-[3px] text-[11px] leading-[14px] text-lcd-ink-3">{block.text}</p>
      ) : (
        <p className="px-[8px] py-[3px] text-[12px] leading-[16px]">{block.text}</p>
      )
    case 'tags':
      return <Tags items={block.items} label={block.label} />
    case 'bullets':
      return <Bullets items={block.items} />
    case 'kv':
      return <KeyValues rows={block.rows} />
    case 'metrics':
      return <Metrics items={block.items} />
    case 'entry':
      return (
        <div className="px-[8px] py-[3px]">
          <h4 className="text-[12px] leading-[15px] font-bold">{block.title}</h4>
          {block.meta && <p className="text-[11px] leading-[14px] text-lcd-ink-3">{block.meta}</p>}
          {block.text && <p className="text-[12px] leading-[16px]">{block.text}</p>}
        </div>
      )
  }
}
