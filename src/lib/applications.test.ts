import { describe, expect, it } from 'vitest'
import { countByStage, filterApplications, needsNudge } from './applications'
import type { Application } from '../types'

const applications: Application[] = [
  {
    id: 'applied-role',
    company: 'Acme',
    role: 'Frontend Engineer',
    dateSent: '2026-10-01',
    stage: 'applied',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'offer-role',
    company: 'Globex',
    role: 'Product Designer',
    dateSent: '2026-10-01',
    stage: 'offer',
    createdAt: '2026-10-01T11:00:00.000Z',
  },
]

describe('application helpers', () => {
  it('combines a stage filter with a case-insensitive search', () => {
    expect(filterApplications(applications, 'ACME', 'applied').map(({ id }) => id)).toEqual([
      'applied-role',
    ])
    expect(filterApplications(applications, 'ACME', 'wishlist')).toEqual([])
  })

  it('derives a count for every stage from the application records', () => {
    expect(countByStage(applications)).toEqual({
      wishlist: 0,
      applied: 1,
      offer: 1,
      closed: 0,
    })
  })

  it('shows a nudge only after 14 full days in the applied stage', () => {
    const today = new Date(2026, 9, 15)
    expect(needsNudge({ ...applications[0], dateSent: '2026-10-01' }, today)).toBe(false)
    expect(needsNudge({ ...applications[0], dateSent: '2026-09-30' }, today)).toBe(true)
    expect(needsNudge({ ...applications[1], dateSent: '2026-09-01' }, today)).toBe(false)
  })
})
