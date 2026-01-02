'use client'

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, signOut } = useAuthStore()
  const router = useRouter()

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true, // Importante para refrescar al volver
      },
    },
    // Captura global de errores
    queryCache: new QueryCache({
      onError: (error: any) => {
        // Si detectamos error de autenticación (401 o 403)
        if (error?.status === 401 || error?.status === 403 || error?.code === 'PGRST301') {
          console.warn('Sesión expirada o inválida. Cerrando sesión...')
          signOut()
          router.push('/login')
          toast.error('Tu sesión ha expirado. Por favor ingresa nuevamente.')
        }
      },
    }),
  }))

  useEffect(() => {
    // 1. Verificar sesión inicial
    const initializeAuth = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        // Buscar perfil en la BD
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
        
        setProfile(perfil)
      }
      setLoading(false)
    }

    initializeAuth()

    // 2. Escuchar cambios (Login, Logout, OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth Event: ${event}`)
      
      if (event === 'SIGNED_OUT') {
        signOut()
        setLoading(false)
        router.refresh() // Limpiar caché de servidor de Next.js
        return
      }

      if (session) {
        setUser(session.user)
        // Solo recargar perfil si no lo tenemos o si es un login nuevo
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
          setProfile(perfil)
        }
      } else {
        // Caso de borde: No hay sesión pero el evento no fue SIGNED_OUT
        signOut()
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}