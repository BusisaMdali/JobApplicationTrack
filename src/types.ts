export const STAGE_OPTIONS = ['wishlist', 'applied', 'offer', 'closed'] as const

export type Stage = (typeof STAGE_OPTIONS)[number]

export function isStage(value: string): value is Stage {
  return STAGE_OPTIONS.some((stage) => stage === value)
}

export interface Application {
  id: string
  company: string
  role: string
  link?: string
  dateSent: string
  stage: Stage
  notes?: string
  createdAt: string
}

export type NewApplication = Omit<Application, 'id' | 'createdAt'>
