import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: Falta OPENAI_API_KEY en .env.local')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Usamos anon key (con RLS ajustado) o service role si disponible
const supabase = createClient(supabaseUrl, supabaseKey)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuración
const BATCH_SIZE = 5 // Procesar 5 preguntas en paralelo
const MODEL = 'gpt-4o-mini' // Modelo rápido y económico

async function getTemaId(nombreTema: string) {
  const { data } = await supabase.from('temas').select('id').eq('nombre', nombreTema).single()
  return data?.id
}

async function procesarPreguntaIA(row: any) {
  const prompt = `
  Analiza la siguiente pregunta de examen y su sustento.
  
  Pregunta Original: "${row.pregunta}"
  Sustento Correcto: "${row.sustento}"

  Tu tarea es:
  1. Generar 3 opciones incorrectas (distractores) plausibles pero claramente falsas basándote en el sustento.
  2. Identificar la opción correcta (basada en el sustento) y refrasearla si es necesario para que sea clara.
  3. Simplificar el enunciado de la pregunta si es muy largo o confuso.
  4. Asignar una dificultad (facil, medio, dificil).

  Responde EXCLUSIVAMENTE en formato JSON válido con esta estructura:
  {
    "pregunta_simplificada": "texto de la pregunta",
    "opcion_a": "texto opción A",
    "opcion_b": "texto opción B",
    "opcion_c": "texto opción C",
    "opcion_d": "texto opción D",
    "respuesta_correcta": "A" (o B, C, D),
    "dificultad": "medio"
  }
  `

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      response_format: { type: "json_object" },
    })

    const contenido = completion.choices[0].message.content
    if (!contenido) throw new Error("Respuesta vacía de OpenAI")
    
    return JSON.parse(contenido)
  } catch (error) {
    console.error(`Error procesando pregunta con IA: ${error}`)
    return null
  }
}

async function main() {
  console.log('🚀 Iniciando importación inteligente con OpenAI...')

  // 1. Leer CSV
  const csvPath = path.resolve(process.cwd(), 'data/preguntas_raw.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(fileContent, { columns: true, skip_empty_lines: true })

  console.log(`📊 Total preguntas en CSV: ${records.length}`)

  // 2. Procesar en lotes
  let procesadas = 0
  let errores = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const lote = records.slice(i, i + BATCH_SIZE)
    console.log(`
🔄 Procesando lote ${i + 1} a ${Math.min(i + BATCH_SIZE, records.length)}...
`)

    const promesas = lote.map(async (row: any) => {
      // Verificar si ya existe (para poder reanudar el script si falla)
      // Nota: Esto es una verificación simple por texto original
      const { data: existente } = await supabase
        .from('preguntas')
        .select('id')
        .eq('pregunta_original', row.pregunta)
        .maybeSingle()

      if (existente) {
        console.log(`  ⏩ Saltando pregunta existente: ${row.pregunta.substring(0, 30)}...
`)
        return
      }

      // Obtener ID del tema
      const temaId = await getTemaId(row.tema_nombre)
      if (!temaId) {
        console.warn(`  ⚠️ Tema no encontrado: ${row.tema_nombre}`)
        return
      }

      // Llamar a IA
      console.log(`  🤖 Consultando IA para: ${row.pregunta.substring(0, 30)}...
`)
      const iaData = await procesarPreguntaIA(row)

      if (!iaData) {
        errores++
        return
      }

      // Insertar en BD
      const { error } = await supabase.from('preguntas').insert({
        tema_id: temaId,
        pregunta_original: row.pregunta,
        pregunta_simplificada: iaData.pregunta_simplificada,
        sustento: row.sustento,
        opcion_a: iaData.opcion_a,
        opcion_b: iaData.opcion_b,
        opcion_c: iaData.opcion_c,
        opcion_d: iaData.opcion_d,
        respuesta_correcta: iaData.respuesta_correcta,
        dificultad: iaData.dificultad,
        estado: 'aprobada',
        metadata: { modelo: MODEL }
      })

      if (error) {
        console.error(`  ❌ Error insertando en Supabase: ${error.message}`)
        errores++
      } else {
        console.log(`  ✅ Importada: ${iaData.pregunta_simplificada.substring(0, 40)}...
`)
        procesadas++
      }
    })

    await Promise.all(promesas)
  }

  console.log(`
✨ Proceso finalizado!
`)
  console.log(`   ✅ Procesadas: ${procesadas}`)
  console.log(`   ❌ Errores: ${errores}`)
}

main()
