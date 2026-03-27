import { describe, it, expect } from 'vitest'
import {
  haversineDistance,
  calcDistanceScore,
  calcTimeScore,
  calcTotalScore,
  calculateScore,
} from '../../src/engine/huntEngine'

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    const p = { lat: 40.7128, lng: -74.006 }
    expect(haversineDistance(p, p)).toBe(0)
  })

  it('calculates NYC to London correctly (~5570 km)', () => {
    const nyc = { lat: 40.7128, lng: -74.006 }
    const london = { lat: 51.5074, lng: -0.1278 }
    const dist = haversineDistance(nyc, london)
    expect(dist).toBeGreaterThan(5500)
    expect(dist).toBeLessThan(5700)
  })

  it('calculates short distance correctly', () => {
    const a = { lat: 0, lng: 0 }
    const b = { lat: 0, lng: 1 }
    const dist = haversineDistance(a, b)
    // ~111 km per degree at equator
    expect(dist).toBeGreaterThan(110)
    expect(dist).toBeLessThan(112)
  })
})

describe('calcDistanceScore', () => {
  it('returns 1000 for exact match', () => {
    expect(calcDistanceScore(0)).toBe(1000)
  })

  it('returns 0 at 500km or more', () => {
    expect(calcDistanceScore(500)).toBe(0)
    expect(calcDistanceScore(1000)).toBe(0)
  })

  it('returns 500 at 250km', () => {
    expect(calcDistanceScore(250)).toBe(500)
  })
})

describe('calcTimeScore', () => {
  it('returns 500 for exact year', () => {
    expect(calcTimeScore(0)).toBe(500)
  })

  it('returns 0 at 100+ years off', () => {
    expect(calcTimeScore(100)).toBe(0)
    expect(calcTimeScore(-150)).toBe(0)
  })

  it('returns 250 at 50 years off', () => {
    expect(calcTimeScore(50)).toBe(250)
  })
})

describe('calcTotalScore', () => {
  it('sums distance + time with no hints', () => {
    expect(calcTotalScore(1000, 500, 0)).toBe(1500)
  })

  it('applies hint penalty', () => {
    expect(calcTotalScore(1000, 500, 2)).toBe(1300)
  })

  it('never goes below 0', () => {
    expect(calcTotalScore(100, 50, 3)).toBe(0)
  })
})

describe('calculateScore', () => {
  it('calculates full score for exact match', () => {
    const result = calculateScore(
      { lat: 52.5163, lng: 13.3777 },
      1989,
      { lat: 52.5163, lng: 13.3777 },
      1989,
      0,
    )
    expect(result.distanceKm).toBe(0)
    expect(result.yearDiff).toBe(0)
    expect(result.totalScore).toBe(1500)
  })

  it('penalizes for hints', () => {
    const result = calculateScore(
      { lat: 52.5163, lng: 13.3777 },
      1989,
      { lat: 52.5163, lng: 13.3777 },
      1989,
      3,
    )
    expect(result.totalScore).toBe(1200)
  })
})
