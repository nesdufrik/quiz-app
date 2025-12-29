import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import { logrosService } from './logros.service'

export type Simulacro = Database['public']['Tables']['simulacros']['Row']
export type SimulacroPregunta = Database['public']['Tables']['simulacro_preguntas']['Row'] & {
  pregunta: Database['public']['Tables']['preguntas']['Row']
}

export const simulacrosService = {
  // Generar un nuevo simulacro (Selección Estratificada)
  async crearSimulacro(userId: string, versionId?: string) {
    let targetVersionId = versionId

    if (!targetVersionId) {
      const { data: version, error: versionError } = await supabase
        .from('versiones_examen')
        .select('id')
        .eq('activa', true)
        .single()
      
      if (versionError || !version) throw new Error('No hay una versión de examen activa')
      targetVersionId = version.id
    }

    // 1. Crear el registro del simulacro
    const { data: simulacro, error: simulacroError } = await supabase
      .from('simulacros')
      .insert({
        user_id: userId,
        version_examen_id: targetVersionId,
        estado: 'en_progreso',
        tiempo_limite_minutos: 120,
        fecha_inicio: new Date().toISOString()
      })
      .select()
      .single()

    if (simulacroError) throw simulacroError

    // 2. Obtener TODAS las preguntas aprobadas con su Área
    // Necesitamos el area_id para estratificar
    const { data: preguntas, error: preguntasError } = await supabase
      .from('preguntas')
      .select(`
        id,
        tema:temas (
          area_id
        )
      `)
      .eq('estado', 'aprobada')
      
    if (preguntasError) throw preguntasError

    // 3. Estratificación: Garantizar preguntas de todas las áreas
    const preguntasPorArea: Record<string, string[]> = {}
    const poolGeneral: string[] = []
    const seleccionados: string[] = []

    // Agrupar IDs por área
    preguntas.forEach((p: any) => {
      const areaId = p.tema?.area_id
      if (areaId) {
        if (!preguntasPorArea[areaId]) preguntasPorArea[areaId] = []
        preguntasPorArea[areaId].push(p.id)
      }
    })

    // Paso A: Seleccionar 2 obligatorias de cada área (si hay)
    Object.keys(preguntasPorArea).forEach(areaId => {
      const disponibles = preguntasPorArea[areaId]
      // Barajar las de esta área
      disponibles.sort(() => 0.5 - Math.random())
      
      // Tomar hasta 2
      const cuota = disponibles.splice(0, 2)
      seleccionados.push(...cuota)
      
      // El resto va al pool general
      poolGeneral.push(...disponibles)
    })

    // Paso B: Rellenar hasta 100 con el pool general
    poolGeneral.sort(() => 0.5 - Math.random()) // Barajar pool
    
    const faltantes = 100 - seleccionados.length
    if (faltantes > 0) {
      seleccionados.push(...poolGeneral.slice(0, faltantes))
    }

    // Paso C: Barajar la selección final para mezclar las áreas
    const seleccionFinal = seleccionados.sort(() => 0.5 - Math.random())

    // 4. Insertar preguntas en simulacro_preguntas
    const items = seleccionFinal.map((preguntaId, index) => ({
      simulacro_id: simulacro.id,
      pregunta_id: preguntaId,
      orden: index + 1
    }))

    const { error: insertError } = await supabase
      .from('simulacro_preguntas')
      .insert(items)

    if (insertError) throw insertError

    return simulacro
  },

  // Obtener un simulacro activo o su historial
  async getSimulacro(simulacroId: string) {
    const { data, error } = await supabase
      .from('simulacros')
      .select('*')
      .eq('id', simulacroId)
      .single()

    if (error) throw error
    return data
  },

  // Obtener preguntas de un simulacro con sus respuestas
  async getPreguntasSimulacro(simulacroId: string) {
    const { data, error } = await supabase
      .from('simulacro_preguntas')
      .select(`
        *,
        pregunta:preguntas(*)
      `)
      .eq('simulacro_id', simulacroId)
      .order('orden')

    if (error) throw error
    return data
  },

  // Registrar respuesta en simulacro
  async responderPregunta(simulacroPreguntaId: string, respuesta: string) {
    const { error } = await supabase
      .from('simulacro_preguntas')
      .update({ respuesta_usuario: respuesta })
      .eq('id', simulacroPreguntaId)

    if (error) throw error
  },

  // Finalizar simulacro
  async finalizarSimulacro(simulacroId: string) {
    // 1. Calcular puntaje (esto podría ser una RPC function para seguridad)
    // Lo haremos en dos pasos cliente-side por ahora
    const preguntas = await this.getPreguntasSimulacro(simulacroId)
    
    let correctas = 0
    let incorrectas = 0
    let omitidas = 0

    const updates = preguntas.map(p => {
      const esCorrecta = p.pregunta ? p.respuesta_usuario === p.pregunta.respuesta_correcta : false
      if (!p.respuesta_usuario) omitidas++
      else if (esCorrecta) correctas++
      else incorrectas++

      return {
        id: p.id,
        es_correcta: esCorrecta
      }
    })

    // Actualizar estados individuales (es_correcta)
    // Supabase no soporta update masivo con valores diferentes facilmente,
    // así que lo hacemos iterativo o con un RPC. Iterativo por simplicidad MVP.
    // OJO: Para producción usar RPC.
    await Promise.all(updates.map(u => 
      supabase.from('simulacro_preguntas').update({ es_correcta: u.es_correcta }).eq('id', u.id)
    ))

    // 2. Actualizar simulacro global
    const puntaje = correctas // 1 punto por correcta simple
    
    const { error } = await supabase
      .from('simulacros')
      .update({
        estado: 'completado',
        fecha_fin: new Date().toISOString(),
        puntaje_total: puntaje,
        preguntas_correctas: correctas,
        preguntas_incorrectas: incorrectas,
        preguntas_omitidas: omitidas
      })
      .eq('id', simulacroId)

    if (error) throw error
      
          // Gamificación: Verificar si el puntaje fue perfecto (100)
          if (puntaje === 100) {
            // Necesitamos el userId, podemos obtenerlo del simulacro actual
            const { data: sim } = await supabase.from('simulacros').select('user_id').eq('id', simulacroId).single()
            if (sim && sim.user_id) {
              await logrosService.otorgarLogro(sim.user_id, 'simulacro_perfecto')
            }
          }
        },
  // Obtener resultados detallados con desglose por área
  async getResultadosSimulacro(simulacroId: string) {
    const { data, error } = await supabase
      .from('simulacro_preguntas')
      .select(`
        id,
        es_correcta,
        pregunta:preguntas (
          tema:temas (
            area:areas (
              nombre,
              color
            )
          )
        )
      `)
      .eq('simulacro_id', simulacroId)

    if (error) throw error

    // Procesar datos para Recharts
    const areasStats: Record<string, { nombre: string, correctas: number, total: number, color: string }> = {}

    data.forEach((item: any) => {
      const area = item.pregunta.tema.area
      if (!areasStats[area.nombre]) {
        areasStats[area.nombre] = {
          nombre: area.nombre,
          correctas: 0,
          total: 0,
          color: area.color || '#3b82f6'
        }
      }
      areasStats[area.nombre].total++
      if (item.es_correcta) {
        areasStats[area.nombre].correctas++
      }
    })

    return Object.values(areasStats).map(stat => ({
      ...stat,
      porcentaje: Math.round((stat.correctas / stat.total) * 100)
    }))
  },

  // Obtener historial de simulacros
  async getHistorial(userId: string) {
    const { data, error } = await supabase
      .from('simulacros')
      .select('*')
      .eq('user_id', userId)
      .order('fecha_inicio', { ascending: false })

    if (error) throw error
    return data
  }
}
