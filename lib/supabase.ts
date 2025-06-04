import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://usrhkmgrlgmsxfcrnsmd.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcmhrbWdybGdtc3hmY3Juc21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjk3NDgsImV4cCI6MjA2NDY0NTc0OH0.YeXIg3zjJaIXUdtrJMAaHQLPdCpsdE4mIUJh9POaNEw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Entry {
  id?: string
  type: "gasto" | "ingreso"
  category: string
  amount: number
  date: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Funciones para manejar las entradas
export const entriesService = {
  // Obtener todas las entradas
  async getAll(): Promise<Entry[]> {
    try {
      const { data, error } = await supabase.from("entries").select("*").order("date", { ascending: false })

      if (error) {
        console.error("Error fetching entries:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getAll:", error)
      return []
    }
  },

  // Crear nueva entrada
  async create(entry: Omit<Entry, "id" | "created_at" | "updated_at">): Promise<Entry | null> {
    try {
      const { data, error } = await supabase.from("entries").insert([entry]).select().single()

      if (error) {
        console.error("Error creating entry:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in create:", error)
      return null
    }
  },

  // Eliminar entrada
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("entries").delete().eq("id", id)

      if (error) {
        console.error("Error deleting entry:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in delete:", error)
      return false
    }
  },

  // Suscribirse a cambios en tiempo real
  subscribeToChanges(callback: (entries: Entry[]) => void) {
    const subscription = supabase
      .channel("entries_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "entries",
        },
        async () => {
          // Cuando hay cambios, obtener todas las entradas actualizadas
          const entries = await this.getAll()
          callback(entries)
        },
      )
      .subscribe()

    return subscription
  },
}
