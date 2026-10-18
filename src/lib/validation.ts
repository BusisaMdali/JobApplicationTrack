import { isStage, type Stage } from '../types'

export interface ApplicationFormValues {
  company: string
  role: string
  link: string
  dateSent: string
  stage: Stage
  notes: string
}

export type ApplicationFormErrors = Partial<Record<keyof ApplicationFormValues, string>>

function isValidDate(value: string, today: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsedDate = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) {
    return false
  }

  const todayValue = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  return value <= todayValue
}

export function validateApplicationForm(
  form: ApplicationFormValues,
  today: Date,
): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {}

  if (form.company.trim().length < 2) errors.company = 'Company is required'
  if (form.role.trim().length < 2) errors.role = 'Job title is required'

  if (form.link.trim()) {
    try {
      const parsedUrl = new URL(form.link)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        errors.link = 'That does not look like a link'
      }
    } catch {
      errors.link = 'That does not look like a link'
    }
  }

  if (!isValidDate(form.dateSent, today)) {
    errors.dateSent = 'You cannot have sent it tomorrow'
  }
  if (!isStage(form.stage)) errors.stage = 'Choose a valid stage'

  return errors
}
