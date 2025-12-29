'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface NavegadorPreguntasProps {
  total: number
  currentIndex: number
  respuestas: Record<string, string> // ID pregunta -> respuesta
  preguntasIds: string[]
  onSelect: (index: number) => void
}

export function NavegadorPreguntas({ 
  total, 
  currentIndex, 
  respuestas, 
  preguntasIds,
  onSelect 
}: NavegadorPreguntasProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-2 p-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {Array.from({ length: total }).map((_, i) => {
        const isSelected = i === currentIndex
        const hasAnswer = !!respuestas[preguntasIds[i]]
        
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "h-10 w-full rounded-md text-sm font-medium transition-all flex items-center justify-center relative border",
              isSelected 
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-105 z-10" 
                : hasAnswer
                  ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/80"
            )}
          >
            {i + 1}
            {hasAnswer && !isSelected && (
              <Check className="h-2 w-2 absolute top-1 right-1 text-green-600 dark:text-green-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}