import { useCallback, useEffect, useState } from 'react'
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from '../api/applications'
import type { Application, NewApplication } from '../types'

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setApplications(await fetchApplications())
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitialApplications = async () => {
      try {
        const loadedApplications = await fetchApplications()
        if (active) setApplications(loadedApplications)
      } catch (caughtError) {
        if (active) setError(getErrorMessage(caughtError))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialApplications()
    return () => {
      active = false
    }
  }, [])

  const add = useCallback(
    async (input: NewApplication): Promise<Application | null> => {
      setWriting(true)
      setError(null)
      try {
        const created = await createApplication(input)
        await reload()
        return created
      } catch (caughtError) {
        setError(getErrorMessage(caughtError))
        return null
      } finally {
        setWriting(false)
      }
    },
    [reload],
  )

  const update = useCallback(
    async (id: string, changes: Partial<Application>): Promise<boolean> => {
      setWriting(true)
      setError(null)
      try {
        await updateApplication(id, changes)
        await reload()
        return true
      } catch (caughtError) {
        setError(getErrorMessage(caughtError))
        return false
      } finally {
        setWriting(false)
      }
    },
    [reload],
  )

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setWriting(true)
      setError(null)
      try {
        await deleteApplication(id)
        await reload()
        return true
      } catch (caughtError) {
        setError(getErrorMessage(caughtError))
        return false
      } finally {
        setWriting(false)
      }
    },
    [reload],
  )

  return { applications, loading, error, add, update, remove, reload, writing }
}
