"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Verificar conexión a internet
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Verificar conexión a Supabase
    const checkSupabaseConnection = async () => {
      try {
        const { error } = await supabase.from("entries").select("count").limit(1)
        setIsConnected(!error)
      } catch {
        setIsConnected(false)
      }
    }

    checkSupabaseConnection()
    const interval = setInterval(checkSupabaseConnection, 30000) // Verificar cada 30 segundos

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: "Sin conexión",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      }
    }

    if (!isConnected) {
      return {
        icon: RefreshCw,
        text: "Reconectando...",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      }
    }

    return {
      icon: Wifi,
      text: "Conectado",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    }
  }

  const status = getStatusInfo()
  const Icon = status.icon

  return (
    <Badge variant={status.variant} className={`${status.className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status.text}
    </Badge>
  )
}
