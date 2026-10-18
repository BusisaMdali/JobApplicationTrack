import type { Dispatch, SetStateAction } from 'react'
import { isStage, STAGE_OPTIONS, type Stage } from '../types'
import { Input } from './ui/input'

const stageLabels: Record<Stage, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  offer: 'Offer',
  closed: 'Closed',
}

interface FilterBarProps {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  stage: Stage | 'all'
  setStage: Dispatch<SetStateAction<Stage | 'all'>>
}

export function FilterBar({ query, setQuery, stage, setStage }: FilterBarProps) {
  return (
    <div className="filters">
      <label className="search-box">
        <span className="sr-only">Search company or job title</span>
        <Input
          className="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search company or job title…"
        />
      </label>

      <label className="select-box">
        <span className="sr-only">Filter by stage</span>
        <select
          value={stage}
          onChange={(event) => {
            const value = event.target.value
            setStage(value === 'all' || isStage(value) ? value : 'all')
          }}
        >
          <option value="all">All stages</option>
          {STAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {stageLabels[option]}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
