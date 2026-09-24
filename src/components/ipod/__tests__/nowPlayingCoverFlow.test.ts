import { describe, expect, it } from 'vitest'
import { portfolio } from '../../../data/portfolio'
import {
  COVER_ANGLE,
  COVER_FIRST_OFFSET,
  COVER_PERSPECTIVE,
  COVER_PITCH,
  COVER_SIZE,
  coverCaption,
  coverPose,
  describeCover,
} from '../detail/coverFlow'
import {
  ART_QUAD,
  describeTrack,
  formatClock,
  formatRemaining,
  nextVolume,
  type Point,
  progressOf,
  quadMatrix,
  type Quad,
  volumeSteps,
} from '../detail/nowPlaying'

/** Where matrix3d(m) (transform-origin 0 0) puts local point (x, y). */
function project(m: number[], [x, y]: Point): Point {
  const w = m[3] * x + m[7] * y + m[15]
  return [(m[0] * x + m[4] * y + m[12]) / w, (m[1] * x + m[5] * y + m[13]) / w]
}

describe('Now Playing clock', () => {
  it('formats m:ss', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(65.9)).toBe('1:05')
    expect(formatClock(-3)).toBe('0:00')
  })

  it('shows remaining time that sums with elapsed to the duration', () => {
    expect(formatRemaining(0, 204)).toBe('-3:24')
    expect(formatRemaining(1.4, 204)).toBe('-3:23')
    expect(formatRemaining(500, 204)).toBe('-0:00')
  })

  it('clamps progress to 0–1', () => {
    expect(progressOf(51, 204)).toBeCloseTo(0.25)
    expect(progressOf(999, 204)).toBe(1)
    expect(progressOf(10, 0)).toBe(0)
  })
})

describe('nextVolume', () => {
  it('steps by 5% and clamps without float drift', () => {
    expect(nextVolume(0.6, 1)).toBe(0.65)
    expect(nextVolume(0.6, -3)).toBe(0.45)
    expect(nextVolume(0.98, 1)).toBe(1)
    expect(nextVolume(0.02, -1)).toBe(0)
  })

  it('is louder clockwise on the wheel, but up (↑, →, AT increment) on keys', () => {
    expect(volumeSteps(1, 'wheel')).toBe(1)
    expect(volumeSteps(-1, 'wheel')).toBe(-1)
    // Keys arrive in list direction: ↑ / increment is -1 (up the list), and must turn the volume up.
    expect(volumeSteps(-1, 'key')).toBe(1)
    expect(volumeSteps(9, 'key')).toBe(-9)
  })
})

describe('Now Playing speech', () => {
  it('names the track, its artist and the volume', () => {
    const [track] = portfolio.nowBuilding
    expect(describeTrack(track, 0.6)).toBe(`${track.title} by ${track.artist}, volume 60%`)
    expect(describeTrack(track, 0.05 * 3)).toBe(`${track.title} by ${track.artist}, volume 15%`)
  })
})

describe('Now Playing artwork keystone', () => {
  const ART = 120
  const corners = (size: number): Quad => [
    [0, 0],
    [size, 0],
    [size, size],
    [0, size],
  ]

  it('maps the cover onto the firmware quad exactly', () => {
    const m = quadMatrix(ART, ART_QUAD)
    corners(ART).forEach((corner, i) => {
      const [x, y] = project(m, corner)
      expect(x).toBeCloseTo(ART_QUAD[i][0], 6)
      expect(y).toBeCloseTo(ART_QUAD[i][1], 6)
    })
  })

  it('recedes on the right: the right edge is shorter than the left', () => {
    const [tl, tr, br, bl] = ART_QUAD
    expect(br[1] - tr[1]).toBeLessThan(bl[1] - tl[1])
  })

  it('keeps the reflection clear of the progress bar', () => {
    const m = quadMatrix(ART, ART_QUAD)
    const reflectionBottom = ART + 1 + 28
    const meterTop = 220 - 9 - 26
    for (const x of [0, ART / 2, ART]) expect(project(m, [x, reflectionBottom])[1]).toBeLessThan(meterTop)
  })

  it('degrades to a plain affine transform for a parallelogram', () => {
    // `+ 0` turns -0 into 0.
    const m = quadMatrix(10, corners(20)).map((n) => n + 0)
    expect(m).toEqual([2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
  })
})

describe('Cover Flow caption', () => {
  const up = portfolio.projects[1]

  it('shows the date and the first two stack items', () => {
    expect(coverCaption(up)).toBe(`${up.date} · ${up.stack[0]} · ${up.stack[1]}`)
  })

  it('speaks the name, date and position', () => {
    expect(describeCover(up, 1, 3)).toBe(`${up.name}, ${up.date}, 2 of 3`)
  })
})

describe('coverPose', () => {
  it('faces the centre cover forward, on top', () => {
    expect(coverPose(0)).toEqual({ x: 0, z: 0, rotateY: 0, zIndex: 100 })
  })

  it('turns side covers toward the centre and stacks them at a fixed pitch', () => {
    expect(coverPose(-1)).toMatchObject({ x: -COVER_FIRST_OFFSET, rotateY: COVER_ANGLE })
    expect(coverPose(2)).toMatchObject({ x: COVER_FIRST_OFFSET + COVER_PITCH, rotateY: -COVER_ANGLE })
    expect(coverPose(1).zIndex).toBeGreaterThan(coverPose(2).zIndex)
  })

  it('leaves a gap between the centre cover and the first side cover after perspective', () => {
    // Inner (far) edge of the first right-hand cover, projected onto the screen plane.
    const { x, z, rotateY } = coverPose(1)
    const half = COVER_SIZE / 2
    const rad = (rotateY * Math.PI) / 180
    const innerX = x - half * Math.cos(rad)
    const innerZ = z + half * Math.sin(rad)
    const projected = (innerX * COVER_PERSPECTIVE) / (COVER_PERSPECTIVE - innerZ)
    expect(projected).toBeGreaterThan(half)
  })
})
