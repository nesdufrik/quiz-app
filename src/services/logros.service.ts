import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export const logrosService = {
  // Otorgar un logro por su código
  async otorgarLogro(userId: string, codigoLogro: string) {
    try {
      // 1. Obtener ID del logro
      const { data: logro } = await supabase
        .from('logros')
        .select('*')
        .eq('codigo', codigoLogro)
        .single()

      if (!logro) return

      // 2. Intentar insertar de forma segura (idempotente)
      const { data: nuevoLogro, error } = await supabase
        .from('usuario_logros')
        .upsert({
          user_id: userId,
          logro_id: logro.id
        }, { 
          onConflict: 'user_id,logro_id', 
          ignoreDuplicates: true 
        })
        .select()

      if (error) throw error

      // Si upsert devolvió datos, significa que fue una inserción nueva
      if (nuevoLogro && nuevoLogro.length > 0) {
        toast.success(`🏆 ¡Logro Desbloqueado: ${logro.nombre}!`, {
          description: logro.descripcion,
          duration: 5000,
        })
      }
    } catch (err) {
      console.error('Error al procesar logro:', err)
    }
  },

  // Verificar si el usuario terminó un tema al 100%
  async verificarProgresoTema(userId: string, temaId: string) {
    const { data } = await supabase
      .from('progreso_temas')
      .select('porcentaje_completado')
      .eq('user_id', userId)
      .eq('tema_id', temaId)
      .single()

    if (data?.porcentaje_completado === 100) {
      await this.otorgarLogro(userId, 'tema_completo')
    }
  }
}
