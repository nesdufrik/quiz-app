import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export type ReporteSoporte = Database['public']['Tables']['reportes_soporte']['Row']
export type ReporteSoporteInsert = Database['public']['Tables']['reportes_soporte']['Insert']

export const soporteService = {
  // Enviar un nuevo reporte (Usuario)
  async enviarReporte(reporte: ReporteSoporteInsert) {
    const { data, error } = await supabase
      .from('reportes_soporte')
      .insert(reporte)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Listar todos los reportes (Admin)
  async getTodosLosReportes() {
    const { data, error } = await supabase
      .from('reportes_soporte')
      .select(`
        *,
        perfil:perfiles(nombre_completo, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Actualizar estado de un reporte (Admin)
  async actualizarEstado(id: string, estado: ReporteSoporte['estado']) {
    const { error } = await supabase
      .from('reportes_soporte')
      .update({ estado })
      .eq('id', id)

    if (error) throw error
  }
}
