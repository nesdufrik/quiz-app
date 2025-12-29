'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  const { setUser, setProfile, setLoading } = useAuthStore()

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
      if (session) {
        setUser(session.user)
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()
        setProfile(perfil)
      } else {
        setUser(null)
        setProfile(null)
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