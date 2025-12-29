'use client'

import { useDevTools } from '@/hooks/useDevTools'
import { AlertTriangle } from 'lucide-react'

export function DevToolsGuard({ children }: { children: React.ReactNode }) {
  const isDevToolsOpen = useDevTools()

  // En desarrollo permitimos todo para no molestarte a ti
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>
  }

  if (isDevToolsOpen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center text-center p-8">
        <div className="bg-red-100 p-6 rounded-full mb-6 animate-pulse">
          <AlertTriangle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Acción No Permitida</h1>
        <p className="text-xl text-gray-600 max-w-lg">
          Por razones de seguridad académica, no está permitido abrir las herramientas de desarrollador durante el uso de esta plataforma.
        </p>
        <p className="mt-8 text-gray-500 font-medium">
          Cierra la consola (F12) para continuar.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
