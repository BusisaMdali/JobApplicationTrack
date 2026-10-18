import type { Stage } from '../types'
import { STAGE_OPTIONS } from '../types'

const stageLabels: Record<Stage, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  offer: 'Offer',
  closed: 'Closed',
}

export function StageSummary({ counts }: { counts: Record<Stage, number> }) {
  return (
    <div className="stage-row" role="group" aria-label="Application counts by stage">
      {STAGE_OPTIONS.map((stage) => (
        <div key={stage} className="stage-stat" data-stage={stage}>
          <span>{stageLabels[stage]}</span>
          <strong>{counts[stage]}</strong>
        </div>
      ))}
    </div>
  )
}
