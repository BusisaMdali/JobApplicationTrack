import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ApplicationList } from './components/ApplicationList'
import { FilterBar } from './components/FilterBar'
import { StageBadge } from './components/StageBadge'
import { StageSummary } from './components/StageSummary'
import { countByStage, filterApplications, needsNudge } from './lib/applications'
import { validateApplicationForm, type ApplicationFormValues } from './lib/validation'
import { useApplications } from './hooks/useApplications'
import type { Application, NewApplication, Stage } from './types'
import { isStage, STAGE_OPTIONS } from './types'
import { useTheme } from './context/useTheme'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import './App.css'

const stageLabels: Record<Stage, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  offer: 'Offer',
  closed: 'Closed',
}

function App() {
  const data = useApplications()
  const today = useToday()

  return (
    <Routes>
      <Route element={<AppLayout writing={data.writing} />}>
        <Route
          index
          element={
            <ApplicationsPage
              applications={data.applications}
              loading={data.loading}
              error={data.error}
              reload={data.reload}
              today={today}
            />
          }
        />
        <Route
          path="new"
          element={
            <AddApplicationPage
              add={data.add}
              writing={data.writing}
              error={data.error}
              today={today}
            />
          }
        />
        <Route
          path="applications/:id"
          element={
            <ApplicationPage
              applications={data.applications}
              loading={data.loading}
              error={data.error}
              writing={data.writing}
              today={today}
              update={data.update}
              remove={data.remove}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

function AppLayout({ writing }: { writing: boolean }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <header className="topbar site-header">
        <NavLink className="brand" to="/">
          Job Application Tracker
        </NavLink>
        <nav className="topbar-actions" aria-label="Main navigation">
          <Button
            type="button"
            variant="toggle"
            disabled={writing}
            aria-pressed={theme === 'dark'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <NavLink className="primary-button" to="/new">
            Add application
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </>
  )
}

function useToday(): Date {
  const [today, setToday] = useState(() => new Date())

  useEffect(() => {
    const nextDay = new Date(today)
    nextDay.setHours(24, 0, 0, 50)
    const timer = window.setTimeout(() => setToday(new Date()), nextDay.getTime() - Date.now())
    return () => window.clearTimeout(timer)
  }, [today])

  return today
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function ApplicationsPage({
  applications,
  loading,
  error,
  reload,
  today,
}: {
  applications: Application[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  today: Date
}) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState<Stage | 'all'>('all')
  const counts = countByStage(applications)
  const visibleApplications = filterApplications(applications, query, stage)

  return (
    <main className="page-shell">
      <StageSummary counts={counts} />
      <FilterBar query={query} setQuery={setQuery} stage={stage} setStage={setStage} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <MessagePanel type="error" message={error} onRetry={() => void reload()} />
      ) : applications.length === 0 ? (
        <div className="empty-panel">
          <p>There is nothing here yet.</p>
          <Link className="primary-button" to="/new">
            Add the first one
          </Link>
        </div>
      ) : visibleApplications.length === 0 ? (
        <div className="empty-panel">
          <p>No jobs match.</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQuery('')
              setStage('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <ApplicationList applications={visibleApplications} today={today} />
      )}
    </main>
  )
}

function AddApplicationPage({
  add,
  writing,
  error,
  today,
}: {
  add: (input: NewApplication) => Promise<Application | null>
  writing: boolean
  error: string | null
  today: Date
}) {
  const navigate = useNavigate()
  const companyInput = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    mode: 'onChange',
    defaultValues: {
      company: '',
      role: '',
      link: '',
      dateSent: toDateInputValue(today),
      stage: 'wishlist',
      notes: '',
    },
  })

  useEffect(() => {
    companyInput.current?.focus()
  }, [])

  const saveApplication = async (form: ApplicationFormValues) => {
    if (writing) return
    const created = await add({
      company: form.company.trim(),
      role: form.role.trim(),
      link: form.link.trim() || undefined,
      dateSent: form.dateSent,
      stage: form.stage,
      notes: form.notes.trim() || undefined,
    })
    if (created) navigate('/')
  }

  const companyRegistration = register('company', {
    validate: (value) =>
      validateApplicationForm({ ...getValues(), company: value }, today).company ?? true,
  })

  return (
    <main className="page-shell detail-shell">
      <div className="topbar compact">
        <Link className="back-link" to="/">← Back to all applications</Link>
      </div>
      <form className="detail-card form-card" onSubmit={handleSubmit(saveApplication)} noValidate>
        <h1>Add an application</h1>
        {error && <MessagePanel type="error" message={error} />}
        <div className="field-grid">
          <FormField label="Company" name="company" error={errors.company?.message}>
            <Input
              {...companyRegistration}
              ref={(element) => {
                companyRegistration.ref(element)
                companyInput.current = element
              }}
              required
              aria-invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? 'company-error' : undefined}
            />
          </FormField>
          <FormField label="Job title" name="role" error={errors.role?.message}>
            <Input
              {...register('role', {
                validate: (value) =>
                  validateApplicationForm({ ...getValues(), role: value }, today).role ?? true,
              })}
              required
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? 'role-error' : undefined}
            />
          </FormField>
          <FormField label="Link to the advert (optional)" name="link" error={errors.link?.message}>
            <Input
              {...register('link', {
                validate: (value) =>
                  validateApplicationForm({ ...getValues(), link: value }, today).link ?? true,
              })}
              type="url"
              aria-invalid={Boolean(errors.link)}
              aria-describedby={errors.link ? 'link-error' : undefined}
            />
          </FormField>
          <FormField label="Date sent" name="dateSent" error={errors.dateSent?.message}>
            <Input
              {...register('dateSent', {
                validate: (value) =>
                  validateApplicationForm({ ...getValues(), dateSent: value }, today).dateSent ??
                  true,
              })}
              type="date"
              required
              aria-invalid={Boolean(errors.dateSent)}
              aria-describedby={errors.dateSent ? 'dateSent-error' : undefined}
            />
          </FormField>
          <Label className="field">
            <span>Stage</span>
            <select
              {...register('stage', {
                validate: (value) =>
                  isStage(value) || 'Choose a valid stage',
              })}
              required
              aria-invalid={Boolean(errors.stage)}
              aria-describedby={errors.stage ? 'stage-error' : undefined}
            >
              {STAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {stageLabels[option]}
                </option>
              ))}
            </select>
            {errors.stage && (
              <small className="error-text" id="stage-error">
                {errors.stage.message}
              </small>
            )}
          </Label>
          <Label className="field field-full">
            <span>Notes (optional)</span>
            <textarea
              {...register('notes')}
              rows={4}
            />
          </Label>
        </div>
        <div className="detail-actions form-actions">
          <Button type="submit" disabled={writing || isSubmitting}>
            {writing || isSubmitting ? 'Saving…' : 'Save application'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={writing || isSubmitting}
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}

function FormField({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string
  children: ReactNode
}) {
  return (
    <Label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="error-text" id={`${name}-error`}>{error}</small>}
    </Label>
  )
}

function ApplicationPage({
  applications,
  loading,
  error,
  writing,
  today,
  update,
  remove,
}: {
  applications: Application[]
  loading: boolean
  error: string | null
  writing: boolean
  today: Date
  update: (id: string, changes: Partial<Application>) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  if (loading) return <main className="page-shell"><LoadingState /></main>
  if (error && applications.length === 0) {
    return <main className="page-shell"><MessagePanel type="error" message={error} /></main>
  }

  const application = applications.find((item) => item.id === id)
  if (!application) return <NotFoundRecordPage />

  return (
    <ApplicationDetail
      key={application.id}
      application={application}
      error={error}
      writing={writing}
      today={today}
      update={update}
      remove={remove}
      onDelete={() => navigate('/')}
    />
  )
}

function ApplicationDetail({
  application,
  error,
  writing,
  today,
  update,
  remove,
  onDelete,
}: {
  application: Application
  error: string | null
  writing: boolean
  today: Date
  update: (id: string, changes: Partial<Application>) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
  onDelete: () => void
}) {
  const [notes, setNotes] = useState(application.notes ?? '')

  const saveNotes = async () => {
    if (writing) return
    await update(application.id, { notes: notes.trim() || undefined })
  }

  const changeStage = (value: string) => {
    if (isStage(value)) void update(application.id, { stage: value })
  }

  const deleteApplication = async () => {
    if (writing || !window.confirm('Delete this application?')) return
    if (await remove(application.id)) onDelete()
  }

  return (
    <main className="page-shell detail-shell">
      <div className="topbar compact">
        <Link className="back-link" to="/">← Back to all applications</Link>
      </div>
      <Card className="detail-card">
        {error && <MessagePanel type="error" message={error} />}
        <div className="detail-header">
          <div>
            <h1>{application.company}</h1>
            <p className="job-title-detail">{application.role}</p>
            <StageBadge stage={application.stage} />
          </div>
          <div className="detail-meta">
            <span>{formatSentDate(application.dateSent, today)}</span>
            {needsNudge(application, today) && <span className="nudge-tag">Needs a nudge</span>}
          </div>
        </div>
        {application.link && (
          <a className="advert-link" href={application.link} target="_blank" rel="noreferrer">
            View the advert ↗
          </a>
        )}
        <Label className="field">
          <span>Stage</span>
          <select
            value={application.stage}
            disabled={writing}
            onChange={(event) => changeStage(event.target.value)}
          >
            {STAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{stageLabels[option]}</option>
            ))}
          </select>
        </Label>
        <Label className="field notes-field">
          <span>Notes</span>
          <textarea
            rows={5}
            value={notes}
            disabled={writing}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add a note about this application"
          />
        </Label>
        <div className="detail-actions">
          <Button type="button" disabled={writing} onClick={() => void saveNotes()}>
            {writing ? 'Saving…' : 'Save notes'}
          </Button>
          <Button type="button" variant="destructive" disabled={writing} onClick={() => void deleteApplication()}>
            Delete this application
          </Button>
        </div>
      </Card>
    </main>
  )
}

function formatSentDate(dateSent: string, today: Date): string {
  const [year, month, day] = dateSent.split('-').map(Number)
  const elapsedDays = Math.max(
    0,
    Math.floor(
      (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
        Date.UTC(year, month - 1, day)) /
        86_400_000,
    ),
  )
  const monthLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]
  return `Sent ${String(day).padStart(2, '0')} ${monthLabel} ${year} · ${elapsedDays} days ago`
}

function LoadingState() {
  return (
    <div className="loading-shell" role="status" aria-live="polite">
      <span className="sr-only">Loading applications</span>
      <div className="loading-card" aria-hidden="true" />
      <div className="loading-card" aria-hidden="true" />
      <div className="loading-card" aria-hidden="true" />
    </div>
  )
}

function MessagePanel({
  children,
  message,
  type = 'info',
  onRetry,
}: {
  children?: ReactNode
  message?: string
  type?: 'info' | 'error'
  onRetry?: () => void
}) {
  return (
    <div className={`message-panel ${type}`} role={type === 'error' ? 'alert' : undefined}>
      {children ?? message}
      {onRetry && (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

function NotFoundRecordPage() {
  return (
    <main className="page-shell narrow-shell">
      <div className="empty-panel">
        <h1>We could not find that application.</h1>
        <Link className="primary-button" to="/">Back to all applications</Link>
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="page-shell narrow-shell">
      <div className="empty-panel">
        <h1>That page does not exist</h1>
        <p>You may have followed an old link, or mistyped the address.</p>
        <Link className="primary-button" to="/">Back to all applications</Link>
      </div>
    </main>
  )
}

export default App
