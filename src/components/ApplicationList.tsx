import { ApplicationCard } from './ApplicationCard'
import type { Application } from '../types'

export function ApplicationList({
  applications,
  today,
}: {
  applications: Application[]
  today: Date
}) {
  return (
    <div className="job-list" aria-live="polite">
      {applications.map((application) => (
        <ApplicationCard key={application.id} application={application} today={today} />
      ))}
    </div>
  )
}
