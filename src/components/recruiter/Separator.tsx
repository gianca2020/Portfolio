/**
 * A visual "·" between inline facts. Screen readers hear a comma instead: an
 * aria-hidden dot with only a CSS margin would run the words together
 * ("Software EngineerNew York").
 */
export function Separator({ className = '' }: { className?: string }) {
  return (
    <>
      <span className="sr-only">, </span>
      <span aria-hidden="true" className={`mx-1.5 text-(--rv-ink-3) ${className}`.trim()}>
        ·
      </span>
    </>
  )
}
