import { seedApplications } from '../data/seed'
import type { Application, NewApplication, Stage } from '../types'
import { STAGE_OPTIONS } from '../types'

const STORAGE_KEY = 'applied.applications.v1'
const LEGACY_STORAGE_KEY = 'applied.jobs.v1'
const API_DELAY_MS = 300

function isApplication(value: unknown): value is Application {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.company === 'string' &&
    typeof candidate.role === 'string' &&
    (candidate.link === undefined || typeof candidate.link === 'string') &&
    typeof candidate.dateSent === 'string' &&
    typeof candidate.stage === 'string' &&
    STAGE_OPTIONS.some((stage: Stage) => stage === candidate.stage) &&
    (candidate.notes === undefined || typeof candidate.notes === 'string') &&
    typeof candidate.createdAt === 'string'
  )
}

function parseApplications(value: unknown): Application[] {
  if (!Array.isArray(value)) {
    throw new Error('Saved applications have an invalid format.')
  }

  const migratedApplications = value.map((item) => {
    if (!item || typeof item !== 'object') return item
    const candidate = item as Record<string, unknown>
    if (candidate.stage === 'saved') return { ...candidate, stage: 'wishlist' }
    if (candidate.stage === 'interview') return { ...candidate, stage: 'applied' }
    return candidate
  })

  if (!migratedApplications.every(isApplication)) {
    throw new Error('Saved applications have an invalid format.')
  }
  return migratedApplications
}

function delay(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, API_DELAY_MS))
}

function readStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    throw new Error('Your browser could not read saved applications. Check that local storage is enabled.')
  }
}

function writeStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    throw new Error('Your browser could not save applications. Check available storage space.')
  }
}

function deserializeApplications(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    throw new Error('Saved application data could not be read. The stored data may be damaged.')
  }
}

function readApplications(): Application[] {
  const stored = readStorageItem(STORAGE_KEY)
  if (stored === null) {
    const legacyStored = readStorageItem(LEGACY_STORAGE_KEY)
    if (legacyStored !== null) {
      const legacyApplications = parseApplications(deserializeApplications(legacyStored))
      writeStorageItem(STORAGE_KEY, JSON.stringify(legacyApplications))
      return legacyApplications
    }

    const initialApplications = [...seedApplications]
    writeStorageItem(STORAGE_KEY, JSON.stringify(initialApplications))
    return initialApplications
  }

  const applications = parseApplications(deserializeApplications(stored))
  const serializedApplications = JSON.stringify(applications)
  if (serializedApplications !== stored) {
    writeStorageItem(STORAGE_KEY, serializedApplications)
  }
  return applications
}

function writeApplications(applications: Application[]): void {
  writeStorageItem(STORAGE_KEY, JSON.stringify(applications))
}

export async function fetchApplications(): Promise<Application[]> {
  await delay()
  return readApplications()
}

export async function createApplication(input: NewApplication): Promise<Application> {
  await delay()
  const application: Application = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  writeApplications([...readApplications(), application])
  return application
}

export async function updateApplication(
  id: string,
  changes: Partial<Application>,
): Promise<Application> {
  await delay()
  const applications = readApplications()
  const existing = applications.find((application) => application.id === id)
  if (!existing) {
    throw new Error('We could not find that application.')
  }

  const updated: Application = { ...existing, ...changes, id: existing.id }
  writeApplications(applications.map((application) => (application.id === id ? updated : application)))
  return updated
}

export async function deleteApplication(id: string): Promise<void> {
  await delay()
  const applications = readApplications()
  if (!applications.some((application) => application.id === id)) {
    throw new Error('We could not find that application.')
  }
  writeApplications(applications.filter((application) => application.id !== id))
}
