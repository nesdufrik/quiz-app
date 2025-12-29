import { supabase } from '@/lib/supabase/client'

export const adminService = {
  // Obtener resumen para dashboard
  async getDashboardStats() {
    const { count: usuarios } = await supabase.from('perfiles').select('*', { count: 'exact', head: true })
    const { count: pendientes } = await supabase.from('suscripciones').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')
    const { count: activas } = await supabase.from('suscripciones').select('*', { count: 'exact', head: true }).eq('estado', 'activa')
    
    // Calcular ingresos (suma simple)
    const { data: ingresosData } = await supabase.from('suscripciones').select('monto_pagado').eq('estado', 'activa')
    const totalIngresos = ingresosData?.reduce((sum, item) => sum + (item.monto_pagado || 0), 0) || 0

    return { usuarios, pendientes, activas, totalIngresos }
  },

  // Listar suscripciones pendientes
  async getSuscripcionesPendientes() {
    // Intento simplificado para depuración
    const { data, error } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Si obtenemos datos, intentamos enriquecerlos manualmente o asumimos que funcionó
    // Para no romper la UI que espera perfil, mapeamos un dummy si falta
    // Pero lo ideal es ver si esto devuelve ALGO
    
    // Volvamos a intentar con el join pero con left join explicito si fuera SQL, 
    // en supabase js el join es left por defecto.
    
    // Recuperemos el perfil por separado para evitar bloqueo total
    if (data) {
      const enriched = await Promise.all(data.map(async (s) => {
        if (!s.user_id) return { ...s, perfil: null }
        const { data: p } = await supabase.from('perfiles').select('nombre_completo, email').eq('id', s.user_id).single()
        return { ...s, perfil: p }
      }))
      return enriched
    }

    return []
  },

  // Aprobar suscripción
  async aprobarSuscripcion(suscripcionId: string, adminId: string) {
    const fechaInicio = new Date()
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + 365) // 1 año de acceso

    const { error } = await supabase
      .from('suscripciones')
      .update({
        estado: 'activa',
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        verificado_por: adminId,
        verificado_at: new Date().toISOString()
      })
      .eq('id', suscripcionId)

    if (error) throw error
  },

  // Rechazar suscripción
  async rechazarSuscripcion(suscripcionId: string, adminId: string, motivo: string) {
    const { error } = await supabase
      .from('suscripciones')
      .update({
        estado: 'cancelada', // O rechazada si cambiamos el enum, por ahora cancelada
        notas_verificacion: motivo,
        verificado_por: adminId,
        verificado_at: new Date().toISOString()
      })
      .eq('id', suscripcionId)

    if (error) throw error
  },

  // --- GESTIÓN DE USUARIOS ---

  // Listar todos los usuarios con su última suscripción
  async getUsuarios() {
    const { data, error } = await supabase
      .from('perfiles')
      .select(`
        *,
        suscripciones!suscripciones_user_id_fkey (
          id,
          estado,
          fecha_fin,
          plan_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Bloquear usuario
  async bloquearUsuario(userId: string) {
    const { error } = await supabase
      .from('perfiles')
      .update({ bloqueado: true })
      .eq('id', userId)

    if (error) throw error
  },

  // Desbloquear usuario
  async desbloquearUsuario(userId: string) {
    const { error } = await supabase
      .from('perfiles')
      .update({ bloqueado: false })
      .eq('id', userId)

    if (error) throw error
  },

  // Cambiar rol de usuario
  async cambiarRol(userId: string, nuevoRol: 'estudiante' | 'admin') {
    const { error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol })
      .eq('id', userId)

    if (error) throw error
  },

  // Asignar suscripción manual (Cortesía o VIP)
  async asignarSuscripcionManual(userId: string, dias: number, adminId: string) {
    const fechaInicio = new Date()
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + dias)

    const { error } = await supabase
      .from('suscripciones')
      .insert({
        user_id: userId,
        estado: 'activa',
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        monto_pagado: 0,
        notas_verificacion: 'Asignada manualmente por administrador',
        verificado_por: adminId,
        verificado_at: new Date().toISOString()
      })

    if (error) throw error
  },

  // Cancelar suscripciones activas
  async cancelarSuscripcionesActivas(userId: string) {
    const { error } = await supabase
      .from('suscripciones')
      .update({ estado: 'cancelada' })
      .eq('user_id', userId)
      .eq('estado', 'activa')

    if (error) throw error
  }
}
