'use client'

import { useEffect, useState } from 'react'

export function useDevTools() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false)

  useEffect(() => {
    // Solo ejecutar en producción o cuando se quiera forzar
    // if (process.env.NODE_ENV === 'development') return

    const checkDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true)
      } else {
        setIsDevToolsOpen(false)
      }
    }

    // Deshabilitar menú contextual (click derecho)
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Deshabilitar atajos de teclado comunes (F12, Ctrl+Shift+I, etc)
    const disableShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
      }
    }

    window.addEventListener('resize', checkDevTools)
    document.addEventListener('contextmenu', disableContextMenu)
    document.addEventListener('keydown', disableShortcuts)
    
    // Check inicial
    checkDevTools()
    const interval = setInterval(checkDevTools, 1000)

    return () => {
      window.removeEventListener('resize', checkDevTools)
      document.removeEventListener('contextmenu', disableContextMenu)
      document.removeEventListener('keydown', disableShortcuts)
      clearInterval(interval)
    }
  }, [])

  return isDevToolsOpen
}
