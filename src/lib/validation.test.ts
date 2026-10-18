import { describe, expect, it } from 'vitest'
import { validateApplicationForm, type ApplicationFormValues } from './validation'

const validForm: ApplicationFormValues = {
  company: 'Acme',
  role: 'Engineer',
  link: 'https://example.com/jobs/engineer',
  dateSent: '2026-10-18',
  stage: 'wishlist',
  notes: '',
}

describe('validateApplicationForm', () => {
  it('reports every required and invalid field', () => {
    expect(
      validateApplicationForm(
        {
          ...validForm,
          company: ' ',
          role: 'X',
          link: 'javascript:alert(1)',
          dateSent: '2026-10-19',
        },
        new Date(2026, 9, 18),
      ),
    ).toEqual({
      company: 'Company is required',
      role: 'Job title is required',
      link: 'That does not look like a link',
      dateSent: 'You cannot have sent it tomorrow',
    })
  })

  it('accepts a valid record with an optional link and notes omitted', () => {
    expect(
      validateApplicationForm(
        { ...validForm, link: '', notes: '' },
        new Date(2026, 9, 18),
      ),
    ).toEqual({})
  })
})
