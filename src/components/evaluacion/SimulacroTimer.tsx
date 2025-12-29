'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimulacroTimerProps {
  initialMinutes: number
  onTimeUp: () => void
}

export function SimulacroTimer({ initialMinutes, onTimeUp }: SimulacroTimerProps) {
  const [seconds, setSeconds] = useState(initialMinutes * 60)

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp()
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, onTimeUp])

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isLowTime = seconds < 300 // Menos de 5 minutos

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xl font-bold border-2 transition-all",
      isLowTime 
        ? "bg-destructive/10 border-destructive text-destructive animate-pulse" 
        : "bg-muted border-border text-primary shadow-sm"
    )}>
      <Clock className={cn("h-5 w-5", isLowTime && "text-destructive")} />
      {formatTime(seconds)}
    </div>
  )
}