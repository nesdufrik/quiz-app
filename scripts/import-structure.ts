// scripts/import-structure.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseKey) {
  console.error('❌ Error: Falta SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const AREAS_COLORS: Record<string, string> = {
  'Matemáticas': '#8b5cf6',
  'Ciencias Naturales': '#06b6d4',
  'Lenguaje': '#f97316', // Mapeando a Lenguaje
  'Comprensión Lectora': '#f97316', // Asumimos que va a lenguaje o es un área
  'Ciencias Sociales': '#14b8a6',
}

async function importStructure() {
  console.log('🚀 Iniciando importación de estructura...')

  // 1. Leer CSV
  const csvPath = path.resolve(process.cwd(), 'data/preguntas_raw.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  })

  console.log(`📊 Leídas ${records.length} filas del CSV`)

  // 2. Extraer Áreas únicas
  const areasMap = new Map<string, any>()
  records.forEach((row: any) => {
    if (!areasMap.has(row.area_nombre)) {
      areasMap.set(row.area_nombre, {
        nombre: row.area_nombre,
        color: AREAS_COLORS[row.area_nombre] || '#6b7280'
      })
    }
  })

  // 3. Obtener versión del examen
  const { data: versionData, error: versionError } = await supabase
    .from('versiones_examen')
    .select('id')
    .eq('año', 2026)
    .single()

  if (versionError || !versionData) {
    console.error('❌ Error obteniendo versión del examen:', versionError)
    return
  }
  const versionId = versionData.id

  // 4. Insertar Áreas
  console.log(`📦 Insertando ${areasMap.size} áreas...`)
  const areasToInsert = Array.from(areasMap.values()).map((area, index) => ({
    version_id: versionId,
    nombre: area.nombre,
    orden: index + 1,
    color: area.color
  }))

  // Usamos upsert para no duplicar si se corre de nuevo
  const { data: areasInsertados, error: areasError } = await supabase
    .from('areas')
    .upsert(areasToInsert, { onConflict: 'version_id,nombre' })
    .select()

  if (areasError) {
    console.error('❌ Error insertando áreas:', areasError)
    return
  }

  // Crear mapa de Area Nombre -> ID
  const areaIdMap = new Map<string, string>()
  areasInsertados.forEach((a: any) => areaIdMap.set(a.nombre, a.id))

  // 5. Extraer y Insertar Temas
  const temasMap = new Map<string, any>()
  records.forEach((row: any) => {
    const key = `${row.area_nombre}-${row.tema_nombre}`
    if (!temasMap.has(key)) {
      temasMap.set(key, {
        area_id: areaIdMap.get(row.area_nombre),
        nombre: row.tema_nombre
      })
    }
  })

  console.log(`📦 Insertando ${temasMap.size} temas...`)
  const temasToInsert = Array.from(temasMap.values()).map((tema, index) => ({
    area_id: tema.area_id,
    nombre: tema.nombre,
    orden: index + 1
  }))

  const { error: temasError } = await supabase
    .from('temas')
    .upsert(temasToInsert, { onConflict: 'area_id,nombre' })

  if (temasError) {
    console.error('❌ Error insertando temas:', temasError)
    return
  }

  console.log('✅ Estructura (Áreas y Temas) importada correctamente!')
}

importStructure()
