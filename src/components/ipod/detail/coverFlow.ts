import type { Project } from '../../../data/types'

/**
 * Cover Flow geometry on the 320 × 220 screen. The centre cover faces forward;
 * side covers turn ±70° toward the centre and stack at a tight pitch, pushed
 * back so the centre cover (and those nearest it) draw on top.
 */
export const COVER_SIZE = 108
/** Centre → first side cover, centre to centre (px). Leaves a small gap after perspective. */
export const COVER_FIRST_OFFSET = 90
/** Distance between consecutive side covers (px). */
export const COVER_PITCH = 34
export const COVER_ANGLE = 70
/** How far side covers sit behind the centre cover (px, translateZ). */
export const COVER_DEPTH = 60
/** Covers further than this from the centre are off-screen and not rendered. */
export const COVER_WINDOW = 5
/** Perspective of the Cover Flow stage (px). */
export const COVER_PERSPECTIVE = 500

export interface CoverPose {
  x: number
  z: number
  rotateY: number
  zIndex: number
}

/** Pose of the cover `offset` places from the centre (negative = left). */
export function coverPose(offset: number): CoverPose {
  if (offset === 0) return { x: 0, z: 0, rotateY: 0, zIndex: 100 }
  const side = Math.sign(offset)
  const steps = Math.abs(offset)
  return {
    x: side * (COVER_FIRST_OFFSET + (steps - 1) * COVER_PITCH),
    z: -COVER_DEPTH,
    // CSS rotateY(+θ) pushes the right edge back: left covers turn right, toward the centre.
    rotateY: -side * COVER_ANGLE,
    zIndex: 100 - steps,
  }
}

/** Caption under the centre cover: date and the first two stack items. */
export const coverCaption = (project: Project) => [project.date, ...project.stack.slice(0, 2)].join(' · ')

/** Spoken words for the centre cover: "UP! Investments, Oct 2025, 2 of 3". */
export const describeCover = (project: Project, index: number, total: number) =>
  `${project.name}, ${project.date}, ${index + 1} of ${total}`
