/** Small white title + caption at the foot of full-bleed art, over a soft dark scrim. */
export function Caption({ title, caption }: { title?: string; caption?: string }) {
  if (!title && !caption) return null
  return (
    <div className="lcd-scrim absolute inset-x-0 bottom-0 pt-[28px] pr-[8px] pb-[8px] pl-[12px] text-white">
      {title && <p className="truncate text-[14px] leading-[17px] font-bold">{title}</p>}
      {caption && <p className="truncate text-[11px] leading-[14px]">{caption}</p>}
    </div>
  )
}
