import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchApplications } from './applications'

describe('application storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('migrates stages from the previous application format', async () => {
    localStorage.setItem(
      'applied.applications.v1',
      JSON.stringify([
        {
          id: 'legacy-saved',
          company: 'Acme',
          role: 'Engineer',
          dateSent: '2026-10-01',
          stage: 'saved',
          createdAt: '2026-10-01T10:00:00.000Z',
        },
        {
          id: 'legacy-interview',
          company: 'Globex',
          role: 'Designer',
          dateSent: '2026-10-01',
          stage: 'interview',
          createdAt: '2026-10-01T11:00:00.000Z',
        },
      ]),
    )

    const pendingApplications = fetchApplications()
    await vi.advanceTimersByTimeAsync(300)
    const applications = await pendingApplications

    expect(applications.map(({ stage }) => stage)).toEqual(['wishlist', 'applied'])
    expect(JSON.parse(localStorage.getItem('applied.applications.v1') ?? '[]')).toMatchObject([
      { stage: 'wishlist' },
      { stage: 'applied' },
    ])
  })
})
