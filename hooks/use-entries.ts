"use client"

import { useState, useEffect, useCallback } from "react"
import { entriesService, type Entry } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar entradas iniciales
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await entriesService.getAll()
      setEntries(data)
    } catch (err) {
      setError("Error al cargar las entradas")
      console.error("Error loading entries:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Agregar nueva entrada
  const addEntry = useCallback(async (entryData: Omit<Entry, "id" | "created_at" | "updated_at">) => {
    try {
      setError(null)
      const newEntry = await entriesService.create(entryData)
      if (newEntry) {
        // No necesitamos actualizar el estado aquí porque el subscription se encargará
        return newEntry
      } else {
        setError("Error al crear la entrada")
        return null
      }
    } catch (err) {
      setError("Error al agregar la entrada")
      console.error("Error adding entry:", err)
      return null
    }
  }, [])

  // Eliminar entrada
  const deleteEntry = useCallback(async (id: string) => {
    try {
      setError(null)
      const success = await entriesService.delete(id)
      if (!success) {
        setError("Error al eliminar la entrada")
      }
      return success
    } catch (err) {
      setError("Error al eliminar la entrada")
      console.error("Error deleting entry:", err)
      return false
    }
  }, [])

  // Configurar suscripción en tiempo real
  useEffect(() => {
    let subscription: RealtimeChannel | null = null

    const setupRealtimeSubscription = () => {
      subscription = entriesService.subscribeToChanges((updatedEntries) => {
        setEntries(updatedEntries)
      })
    }

    // Cargar datos iniciales
    loadEntries().then(() => {
      // Configurar suscripción después de cargar datos iniciales
      setupRealtimeSubscription()
    })

    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [loadEntries])

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    refetch: loadEntries,
  }
}
