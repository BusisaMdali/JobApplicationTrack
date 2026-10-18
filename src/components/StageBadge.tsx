import type { Stage } from '../types'
import { Badge } from './ui/badge'

const stageLabels: Record<Stage, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  offer: 'Offer',
  closed: 'Closed',
}

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Badge className="job-phase" data-stage={stage}>
      {stageLabels[stage]}
    </Badge>
  )
}
