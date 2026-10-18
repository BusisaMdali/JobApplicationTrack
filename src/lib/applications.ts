import type { Application, Stage } from '../types'
import { STAGE_OPTIONS } from '../types'

export function countByStage(applications: Application[]): Record<Stage, number> {
  return STAGE_OPTIONS.reduce(
    (counts, stage) => {
      counts[stage] = applications.filter((application) => application.stage === stage).length
      return counts
    },
    {} as Record<Stage, number>,
  )
}

export function filterApplications(
  applications: Application[],
  query: string,
  stage: Stage | 'all',
): Application[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  return applications
    .filter((application) => {
      const matchesSearch =
        !normalizedQuery ||
        `${application.company} ${application.role}`.toLocaleLowerCase().includes(normalizedQuery)
      const matchesStage = stage === 'all' || application.stage === stage
      return matchesSearch && matchesStage
    })
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
}

export function needsNudge(application: Application, today: Date): boolean {
  if (application.stage !== 'applied') return false

  const [year, month, day] = application.dateSent.split('-').map(Number)
  const [todayYear, todayMonth, todayDay] = [
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  ]
  const sentUtc = Date.UTC(year, month - 1, day)
  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay)
  const daysSinceSent = Math.floor((todayUtc - sentUtc) / (1000 * 60 * 60 * 24))

  return daysSinceSent > 14
}
