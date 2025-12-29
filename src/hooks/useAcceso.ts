import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export function useAcceso() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['acceso-usuario', user?.id],
    queryFn: async () => {
      if (!user) return { tiene_acceso: false, tipo_acceso: 'sin_login', dias_restantes: 0 }

      const { data, error } = await supabase
        .rpc('verificar_acceso_usuario', { p_user_id: user.id })
        .maybeSingle() // Usamos maybeSingle por si la función devuelve múltiples filas (no debería)

      if (error) {
        console.error('Error verificando acceso:', error)
        // En caso de error, denegamos acceso por seguridad
        return { tiene_acceso: false, tipo_acceso: 'error', dias_restantes: 0 }
      }

      return data || { tiene_acceso: false, tipo_acceso: 'sin_datos', dias_restantes: 0 }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cachear resultado por 5 minutos
  })
}
