import { Link } from 'react-router-dom'
import { needsNudge } from '../lib/applications'
import type { Application } from '../types'
import { StageBadge } from './StageBadge'

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSentDate(dateSent: string, today: Date): string {
  const [year, month, day] = dateSent.split('-').map(Number)
  const elapsedDays = Math.max(0, Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(year, month - 1, day)) /
      86_400_000,
  ))
  const monthLabel = monthLabels[month - 1]

  return `Sent ${String(day).padStart(2, '0')} ${monthLabel} ${year} · ${elapsedDays} days ago`
}

export function ApplicationCard({
  application,
  today,
}: {
  application: Application
  today: Date
}) {
  return (
    <Link className="job-card" to={`/applications/${application.id}`}>
      <div className="job-card-main">
        <div className="job-heading">
          <div>
            <h2>{application.company}</h2>
            <span className="job-title">{application.role}</span>
          </div>
          {needsNudge(application, today) && <span className="nudge-tag">Needs a nudge</span>}
        </div>
        <div className="job-meta-row">
          <StageBadge stage={application.stage} />
          <span>{formatSentDate(application.dateSent, today)}</span>
        </div>
      </div>
    </Link>
  )
}
