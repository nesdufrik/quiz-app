import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export type Area = Database['public']['Tables']['areas']['Row']
export type Tema = Database['public']['Tables']['temas']['Row']
export type Pregunta = Database['public']['Tables']['preguntas']['Row']

export const estudioService = {
  // Obtener todas las áreas activas
  async getAreas() {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('orden')

    if (error) throw error
    return data
  },

  // Obtener temas de un área específica con conteo de preguntas
  async getTemasPorArea(areaId: string) {
    const { data, error } = await supabase
      .from('temas')
      .select(`
        *,
        preguntas:preguntas(count)
      `)
      .eq('area_id', areaId)
      .order('orden')

    if (error) throw error
    return data.map(tema => ({
      ...tema,
      total_preguntas: tema.preguntas?.[0]?.count || 0
    }))
  },

  // Obtener preguntas de un tema
  async getPreguntasPorTema(temaId: string) {
    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .eq('tema_id', temaId)
      .eq('estado', 'aprobada')
      .order('created_at') // Idealmente orden aleatorio o por dificultad

    if (error) throw error
    return data
  },

  // Registrar respuesta del usuario
  async registrarRespuesta(
    userId: string,
    temaId: string,
    preguntaId: string,
    respuesta: string,
    esCorrecta: boolean
  ) {
    // 1. Guardar el intento individual
    const { error: respuestaError } = await supabase
      .from('respuestas_estudio')
      .insert({
        user_id: userId,
        pregunta_id: preguntaId,
        respuesta_usuario: respuesta,
        es_correcta: esCorrecta,
        intentos: 1 // Por ahora simple, luego podríamos manejar reintentos
      })

    if (respuestaError) throw respuestaError

    // 2. Calcular nuevo progreso del tema
    // Primero obtenemos el conteo actual
    const { count: totalPreguntas } = await supabase
      .from('preguntas')
      .select('*', { count: 'exact', head: true })
      .eq('tema_id', temaId)
      .eq('estado', 'aprobada')

    // Contamos respuestas únicas correctas del usuario para este tema
    // (Esto es una query un poco compleja, simplificaremos asumiendo incremento local o recalculando)
    
    // Enfoque robusto: Obtener registro actual de progreso
    const { data: progresoActual } = await supabase
      .from('progreso_temas')
      .select('*')
      .eq('user_id', userId)
      .eq('tema_id', temaId)
      .single()

    const nuevosDatos = {
      user_id: userId,
      tema_id: temaId,
      preguntas_respondidas: (progresoActual?.preguntas_respondidas || 0) + 1,
      preguntas_correctas: (progresoActual?.preguntas_correctas || 0) + (esCorrecta ? 1 : 0),
      preguntas_incorrectas: (progresoActual?.preguntas_incorrectas || 0) + (esCorrecta ? 0 : 1),
      ultima_actividad: new Date().toISOString()
    }

    // Calcular porcentaje
    const porcentaje = totalPreguntas ? Math.round((nuevosDatos.preguntas_correctas / totalPreguntas) * 100) : 0

    // 3. Actualizar tabla de progreso
    const { error: progresoError } = await supabase
      .from('progreso_temas')
      .upsert({
        ...nuevosDatos,
        porcentaje_completado: porcentaje
      }, { onConflict: 'user_id,tema_id' })

    if (progresoError) throw progresoError
  },

  // Obtener progreso de los temas de un área para un usuario
  async getProgresoUsuario(userId: string, areaId: string) {
    // Primero obtenemos los temas del área
    const { data: temas } = await supabase
      .from('temas')
      .select('id')
      .eq('area_id', areaId)
    
    if (!temas || temas.length === 0) return []
    
    const temaIds = temas.map(t => t.id)

    const { data, error } = await supabase
      .from('progreso_temas')
      .select('*')
      .eq('user_id', userId)
      .in('tema_id', temaIds)

    if (error) throw error
    return data
  },

  // Obtener estadísticas generales para el dashboard de inicio
  async getEstadisticasGenerales(userId: string) {
    // 1. Total de preguntas respondidas (únicas)
    const { count: respondidas } = await supabase
      .from('respuestas_estudio')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 2. Racha actual
    const { data: racha } = await supabase
      .from('rachas')
      .select('racha_actual')
      .eq('user_id', userId)
      .maybeSingle()

    // 3. Total de preguntas en el sistema
    const { count: totalGlobal } = await supabase
      .from('preguntas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobada')

    return {
      respondidas: respondidas || 0,
      totalGlobal: totalGlobal || 775,
      racha: racha?.racha_actual || 0
    }
  }
}
