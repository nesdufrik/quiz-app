// scripts/seed-sample.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Usamos Anon Key

const supabase = createClient(supabaseUrl, supabaseKey)

// Datos procesados (Simulación de IA)
const PREGUNTAS_MUESTRA = [
  {
    tema_nombre: 'Deforestación y Cambio Climático en los Andes Bolivianos:Una Perspectiva Histórica y Evolutiva',
    pregunta_original: 'Según el artículo, ¿cuál fue la reducción porcentual de la superficie forestal entre 1900 y 1960 y cómo se compara con la pérdida de cobertura forestal entre 1990 y 2020?',
    pregunta_simplificada: '¿Cuál fue la reducción de superficie forestal entre 1900-1960 comparada con la de 1990-2020?',
    sustento: 'El párrafo sobre la colonización española indica que la superficie forestal pasó de 4,9 millones a 3,9 millones de hectáreas entre 1900 y 1960 (reducción del 20%). Entre 1990 y 2020 fue de aproximadamente el 15%.',
    opcion_a: '20% entre 1900-1960 y 15% entre 1990-2020.',
    opcion_b: '15% entre 1900-1960 y 20% entre 1990-2020.',
    opcion_c: '30% entre 1900-1960 y 10% entre 1990-2020.',
    opcion_d: '10% entre 1900-1960 y 25% entre 1990-2020.',
    respuesta_correcta: 'A',
    dificultad: 'medio'
  },
  {
    tema_nombre: 'Deforestación y Cambio Climático en los Andes Bolivianos:Una Perspectiva Histórica y Evolutiva',
    pregunta_original: 'Del análisis presentado se desprende que, ¿cuáles son los problemas identificados que el artículo señala como consecuencias de la deforestación en los Andes bolivianos?',
    pregunta_simplificada: '¿Qué consecuencias directas de la deforestación señala el artículo?',
    sustento: 'La sección de impactos indica: aumento de temperatura media de 0,6 °C, mayor variabilidad de precipitaciones con sequías más intensas, disminución de capacidad del suelo para retener agua.',
    opcion_a: 'Disminución de la temperatura y aumento de lluvias constantes.',
    opcion_b: 'Aumento de temperatura (0,6°C), sequías intensas y menor retención de agua.',
    opcion_c: 'Mejora en la calidad del suelo y reducción de emisiones de CO2.',
    opcion_d: 'Aumento del albedo y mayor flujo de energía latente.',
    respuesta_correcta: 'B',
    dificultad: 'facil'
  },
  {
    tema_nombre: 'Deforestación y Cambio Climático en los Andes Bolivianos:Una Perspectiva Histórica y Evolutiva',
    pregunta_original: 'Del análisis presentado se desprende que, en la cadena de procesos que relaciona la deforestación con el aumento de la temperatura en los Andes bolivianos, ¿cuál es el primer factor técnico mencionado?',
    pregunta_simplificada: '¿Cuál es el primer factor técnico mencionado que relaciona la deforestación con el aumento de temperatura?',
    sustento: 'El texto menciona primero la reducción del albedo (reflectancia de la superficie) como factor que desencadena la cadena de efectos.',
    opcion_a: 'Aumento de la transpiración vegetal.',
    opcion_b: 'Incremento del flujo de energía latente.',
    opcion_c: 'Reducción del albedo (reflectancia).',
    opcion_d: 'Aumento de la nubosidad local.',
    respuesta_correcta: 'C',
    dificultad: 'dificil'
  },
  {
    tema_nombre: 'Deforestación y Cambio Climático en los Andes Bolivianos:Una Perspectiva Histórica y Evolutiva',
    pregunta_original: 'La lectura del texto permite identificar que, entre 1990 y 2020, la pérdida de cobertura forestal en los Andes bolivianos fue aproximadamente del 15 % y el aumento de la temperatura media fue de 0,6 °C.',
    pregunta_simplificada: '¿Qué datos cuantitativos reporta el artículo para el periodo 1990-2020?',
    sustento: 'Los datos explícitos indican pérdida de cobertura forestal del 15% e incremento de temperatura media de 0,6 °C.',
    opcion_a: 'Pérdida forestal del 15% y aumento de temperatura de 0,6°C.',
    opcion_b: 'Pérdida forestal del 20% y aumento de temperatura de 1,2°C.',
    opcion_c: 'Pérdida forestal del 10% y descenso de temperatura de 0,6°C.',
    opcion_d: 'Ganancia forestal del 5% y temperatura estable.',
    respuesta_correcta: 'A',
    dificultad: 'facil'
  },
  {
    tema_nombre: 'Deforestación y Cambio Climático en los Andes Bolivianos:Una Perspectiva Histórica y Evolutiva',
    pregunta_original: 'A partir de lo expuesto en el artículo, ¿qué proceso técnico se ve incrementado directamente por la reducción del calor latente (LE) tras la pérdida de bosques, contribuyendo al aumento de la temperatura del aire?',
    pregunta_simplificada: '¿Qué proceso aumenta directamente al reducirse el calor latente (LE) según el texto?',
    sustento: 'La disminución del LE al perderse los bosques eleva el H (calor sensible) y, por ende, la temperatura del aire.',
    opcion_a: 'La humedad relativa.',
    opcion_b: 'La transpiración vegetal.',
    opcion_c: 'El albedo superficial.',
    opcion_d: 'El calor sensible (H).',
    respuesta_correcta: 'D',
    dificultad: 'medio'
  }
]

async function seedSample() {
  console.log('🌱 Iniciando siembra de datos de muestra...')

  // 1. Obtener ID del tema
  // Asumimos que el tema ya existe por el script anterior
  const temaNombre = PREGUNTAS_MUESTRA[0].tema_nombre
  const { data: temaData, error: temaError } = await supabase
    .from('temas')
    .select('id')
    .eq('nombre', temaNombre)
    .single()

  if (temaError || !temaData) {
    console.error(`❌ Error encontrando el tema "${temaNombre}":`, temaError)
    return
  }

  const temaId = temaData.id
  console.log(`✅ Tema encontrado ID: ${temaId}`)

  // 2. Preparar inserts
  const preguntasToInsert = PREGUNTAS_MUESTRA.map(p => ({
    tema_id: temaId,
    pregunta_original: p.pregunta_original,
    pregunta_simplificada: p.pregunta_simplificada,
    sustento: p.sustento,
    opcion_a: p.opcion_a,
    opcion_b: p.opcion_b,
    opcion_c: p.opcion_c,
    opcion_d: p.opcion_d,
    respuesta_correcta: p.respuesta_correcta,
    dificultad: p.dificultad,
    estado: 'aprobada' // Las marcamos como aprobadas directamente
  }))

  // 3. Insertar
  const { data, error } = await supabase
    .from('preguntas')
    .insert(preguntasToInsert)
    .select()

  if (error) {
    console.error('❌ Error insertando preguntas:', error)
  } else {
    console.log(`✨ Éxito! ${data.length} preguntas insertadas correctamente.`)
  }
}

seedSample()
