'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // OBTENER Y ELIMINAR TODOS LOS SERVICE WORKERS ACTIVOS
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          console.warn('🗑️ Eliminando Service Worker Zombie:', registration.scope)
          registration.unregister()
        }
        if (registrations.length > 0) {
          console.log('✅ Service Workers eliminados. Recargando página para limpiar caché...')
          window.location.reload() // Forzar recarga para limpiar el control del SW
        }
      })
    }
  }, [])

  return null
}