// scripts/test-db.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Probando conexión a Supabase...')
  const { data, error } = await supabase.from('versiones_examen').select('*')

  if (error) {
    console.error('❌ Error de conexión:', error)
  } else {
    console.log('✅ Conexión exitosa! Datos recibidos:', data)
  }
}

testConnection()
