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
      console.log('🔐 Iniciando verificación de sesión...')
      
      try {
        // Promesa con timeout de 5 segundos para no bloquear la UI eternamente
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout verificando sesión')), 5000)
        )

        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any

        if (data?.session) {
          console.log('✅ Sesión recuperada:', data.session.user.email)
          setUser(data.session.user)
          // Buscar perfil en la BD
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle()
          
          if (perfil) setProfile(perfil)
        } else {
          console.log('Bn No hay sesión activa inicial.')
        }
      } catch (error) {
        console.error('⚠️ Error o Timeout inicializando auth:', error)
        // En caso de error crítico, asumimos logout para no bloquear
        setUser(null)
      } finally {
        console.log('🔓 Fin de carga inicial.')
        setLoading(false)
      }
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

  // 3. Monitor de Foco y Visibilidad (Fix para "Cargando infinito" tras inactividad)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Recuperando foco: Verificando sesión y refrescando datos...')
        
        try {
          // Promise race: Supabase vs Timeout de 3s
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth recovery timeout')), 3000)
          )

          const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any
          
          if (!data?.session) {
            console.warn('⚠️ Sesión inválida o expirada al volver.')
            // Dejar que el usuario siga, eventualmente fallará una query y lo sacará
          } else {
            console.log('✅ Sesión válida. Sincronizando usuario...')
            setUser(data.session.user)
            await queryClient.invalidateQueries()
          }
        } catch (error) {
          console.error('🔥 Error crítico recuperando sesión (Timeout). Recargando página para sanear estado...')
          // Si Supabase no responde en 3s, el estado interno está corrupto.
          // La única forma segura de revivir la app es recargar.
          window.location.reload()
        }
      }
    }

    window.addEventListener('focus', handleVisibilityChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleVisibilityChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [setUser])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}