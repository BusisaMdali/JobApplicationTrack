import { BrowserRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { ThemeProvider } from './context/ThemeProvider'

function renderApp() {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>,
  )
}

describe('application tracker', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('applied.theme.v1', 'light')
  })

  it('combines search and stage filters and distinguishes no matches', async () => {
    const user = userEvent.setup()
    renderApp()
    expect(await screen.findByRole('link', { name: /Takealot/ })).toBeTruthy()

    await user.type(screen.getByRole('searchbox'), 'takealot')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by stage' }), 'applied')
    expect(screen.getAllByRole('link', { name: /Takealot/ })).toHaveLength(1)
    expect(screen.queryByRole('link', { name: /Vodacom/ })).toBeNull()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by stage' }), 'wishlist')
    expect(await screen.findByText('No jobs match.')).toBeTruthy()
    expect(screen.queryByText('There is nothing here yet.')).toBeNull()
  })

  it('associates required form errors with their controls', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('link', { name: 'Add application' }))
    await user.click(await screen.findByRole('button', { name: 'Save application' }))

    const companyInput = screen.getByRole('textbox', { name: /Company/ })
    await waitFor(() => expect(companyInput.getAttribute('aria-invalid')).toBe('true'))
    expect(companyInput.getAttribute('aria-describedby')).toBe('company-error')
    expect(screen.getByText('Company is required')).toBeTruthy()
    expect(screen.getByText('Job title is required')).toBeTruthy()
  })
})
