# 🏗️ Arquitectura Frontend Detallada

## Stack Tecnológico Recomendado

```
Frontend Framework: Next.js 14.2+ (App Router)
Lenguaje: TypeScript 5.3+
Estilos: Tailwind CSS 3.4+
Componentes UI: Shadcn/ui
Estado Global: Zustand
Estado Servidor: TanStack Query (React Query)
Formularios: React Hook Form + Zod
Autenticación: Supabase Auth
Iconos: Lucide React
Gráficos: Recharts
Animaciones: Framer Motion (opcional)
```

---

## Estructura de Carpetas

```
quiz-app/
├── src/
│   ├── app/                          # App Router (Next.js 14)
│   │   ├── (auth)/                   # Grupo de rutas autenticadas
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── registro/
│   │   │   │   └── page.tsx
│   │   │   └── recuperar-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              # Grupo con layout de dashboard
│   │   │   ├── layout.tsx            # Sidebar + Header
│   │   │   ├── inicio/               # Dashboard principal
│   │   │   │   └── page.tsx
│   │   │   ├── estudio/              # Modo estudio
│   │   │   │   ├── page.tsx          # Lista de áreas/temas
│   │   │   │   └── [temaId]/
│   │   │   │       ├── page.tsx      # Material de estudio
│   │   │   │       └── practica/
│   │   │   │           └── page.tsx  # Preguntas del tema
│   │   │   ├── evaluacion/           # Modo evaluación
│   │   │   │   ├── page.tsx          # Configurar simulacro
│   │   │   │   ├── [simulacroId]/
│   │   │   │   │   └── page.tsx      # Simulacro en curso
│   │   │   │   └── historial/
│   │   │   │       └── page.tsx      # Historial de simulacros
│   │   │   ├── progreso/             # Estadísticas y progreso
│   │   │   │   └── page.tsx
│   │   │   ├── ranking/              # Ranking de usuarios
│   │   │   │   └── page.tsx
│   │   │   └── perfil/               # Perfil de usuario
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/                  # Panel de administración
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── usuarios/
│   │   │   ├── preguntas/
│   │   │   ├── suscripciones/
│   │   │   └── configuracion/
│   │   │
│   │   ├── suscripcion/              # Proceso de suscripción
│   │   │   ├── page.tsx              # Información de planes
│   │   │   ├── pago/
│   │   │   │   └── page.tsx          # QR y subida de comprobante
│   │   │   └── confirmacion/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                      # API Routes (si necesario)
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/                   # Componentes reutilizables
│   │   ├── ui/                       # Componentes Shadcn
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Componentes de layout
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── estudio/                  # Componentes específicos de estudio
│   │   │   ├── PreguntaCard.tsx
│   │   │   ├── OpcionRespuesta.tsx
│   │   │   ├── RetroalimentacionModal.tsx
│   │   │   ├── ProgresoTema.tsx
│   │   │   └── MaterialEstudio.tsx
│   │   │
│   │   ├── evaluacion/               # Componentes de evaluación
│   │   │   ├── SimulacroTimer.tsx
│   │   │   ├── NavegadorPreguntas.tsx
│   │   │   ├── PausaModal.tsx
│   │   │   ├── ResultadosChart.tsx
│   │   │   └── ComparativaResultados.tsx
│   │   │
│   │   ├── dashboard/                # Componentes del dashboard
│   │   │   ├── EstadisticasCard.tsx
│   │   │   ├── ProgresoGeneral.tsx
│   │   │   ├── ActividadReciente.tsx
│   │   │   └── LogrosRecientes.tsx
│   │   │
│   │   ├── auth/                     # Componentes de autenticación
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegistroForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   └── shared/                   # Componentes compartidos
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── AccessDenied.tsx
│   │
│   ├── lib/                          # Utilidades y configuraciones
│   │   ├── supabase/
│   │   │   ├── client.ts             # Cliente de Supabase
│   │   │   ├── server.ts             # Server-side Supabase
│   │   │   └── middleware.ts
│   │   ├── utils.ts                  # Utilidades generales
│   │   ├── constants.ts              # Constantes
│   │   └── validations.ts            # Esquemas Zod
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useAcceso.ts              # Verificar acceso usuario
│   │   ├── useProgreso.ts
│   │   ├── useSimulacro.ts
│   │   ├── useTimer.ts
│   │   └── useDevTools.ts            # Bloquear DevTools
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── simulacroStore.ts
│   │   ├── estudioStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/                     # Servicios/API calls
│   │   ├── preguntas.service.ts
│   │   ├── simulacros.service.ts
│   │   ├── progreso.service.ts
│   │   ├── suscripciones.service.ts
│   │   └── estadisticas.service.ts
│   │
│   └── types/                        # TypeScript types
│       ├── database.types.ts         # Generado por Supabase CLI
│       ├── models.ts
│       └── api.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── qr-pago.png                   # QR para pagos
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json                    # Shadcn config
└── package.json
```

---

## Componentes Clave

### 1. **Layout Principal (Dashboard)**

```typescript
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 2. **Hook de Verificación de Acceso**

```typescript
// src/hooks/useAcceso.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useAcceso() {
  return useQuery({
    queryKey: ['acceso-usuario'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .rpc('verificar_acceso_usuario', { p_user_id: user.id })
        .single()

      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
```

### 3. **Store de Simulacro (Zustand)**

```typescript
// src/stores/simulacroStore.ts
import { create } from 'zustand'

interface SimulacroState {
  simulacroId: string | null
  preguntaActual: number
  respuestas: Record<string, string>
  tiempoInicio: number
  tiempoTranscurrido: number
  pausas: number
  isPausado: boolean
  
  setRespuesta: (preguntaId: string, respuesta: string) => void
  siguientePregunta: () => void
  pausarSimulacro: () => void
  reanudarSimulacro: () => void
  finalizarSimulacro: () => Promise<void>
}

export const useSimulacroStore = create<SimulacroState>((set, get) => ({
  // ... implementación
}))
```

### 4. **Componente de Pregunta (Estudio)**

```typescript
// src/components/estudio/PreguntaCard.tsx
interface PreguntaCardProps {
  pregunta: Pregunta
  onResponder: (respuesta: string) => void
  mostrarSustento?: boolean
}

export function PreguntaCard({ pregunta, onResponder, mostrarSustento }: PreguntaCardProps) {
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null)
  const [mostrarRetroalimentacion, setMostrarRetroalimentacion] = useState(false)

  const handleSubmit = () => {
    if (!respuestaSeleccionada) return
    onResponder(respuestaSeleccionada)
    setMostrarRetroalimentacion(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{pregunta.pregunta_simplificada}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={respuestaSeleccionada} onValueChange={setRespuestaSeleccionada}>
          {['A', 'B', 'C', 'D'].map((opcion) => (
            <OpcionRespuesta
              key={opcion}
              letra={opcion}
              texto={pregunta[`opcion_${opcion.toLowerCase()}`]}
              seleccionada={respuestaSeleccionada === opcion}
              esCorrecta={mostrarRetroalimentacion ? opcion === pregunta.respuesta_correcta : undefined}
            />
          ))}
        </RadioGroup>
        
        <Button onClick={handleSubmit} disabled={!respuestaSeleccionada}>
          Verificar Respuesta
        </Button>

        {mostrarRetroalimentacion && (
          <RetroalimentacionModal
            esCorrecta={respuestaSeleccionada === pregunta.respuesta_correcta}
            sustento={pregunta.sustento}
          />
        )}
      </CardContent>
    </Card>
  )
}
```

### 5. **Timer de Simulacro**

```typescript
// src/components/evaluacion/SimulacroTimer.tsx
export function SimulacroTimer({ simulacroId }: { simulacroId: string }) {
  const [tiempoRestante, setTiempoRestante] = useState(7200) // 120 min
  const { isPausado } = useSimulacroStore()

  useEffect(() => {
    if (isPausado) return

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 0) {
          // Auto-finalizar simulacro
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPausado])

  const minutos = Math.floor(tiempoRestante / 60)
  const segundos = tiempoRestante % 60

  return (
    <div className={cn(
      "text-2xl font-mono font-bold",
      tiempoRestante < 300 && "text-red-600 animate-pulse"
    )}>
      {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
    </div>
  )
}
```

---

## Flujo de Datos

```
┌─────────────────┐
│  Next.js App    │
│  (Client Side)  │
└────────┬────────┘
         │
         ├─ React Query (cache + sync)
         │
         ├─ Zustand (estado local)
         │
         ↓
┌─────────────────┐
│ Supabase Client │
└────────┬────────┘
         │
         ├─ Auth
         ├─ Database (PostgreSQL)
         ├─ Storage (comprobantes)
         └─ Edge Functions (validaciones)
```

---

## Middleware para Protección de Rutas

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas protegidas
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Rutas de admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (perfil?.rol !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

---

## Bloqueo de DevTools

```typescript
// src/hooks/useDevTools.ts
'use client'

import { useEffect } from 'react'

export function useDevTools() {
  useEffect(() => {
    // Detectar apertura de DevTools
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold

      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = `
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 24px;">
            <p>⚠️ Por favor, cierra las herramientas de desarrollo para continuar.</p>
          </div>
        `
      }
    }

    // Deshabilitar clic derecho
    const disableContextMenu = (e: MouseEvent) => e.preventDefault()

    // Deshabilitar atajos de teclado
    const disableShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
      }
    }

    const interval = setInterval(detectDevTools, 1000)
    document.addEventListener('contextmenu', disableContextMenu)
    document.addEventListener('keydown', disableShortcuts)

    return () => {
      clearInterval(interval)
      document.removeEventListener('contextmenu', disableContextMenu)
      document.removeEventListener('keydown', disableShortcuts)
    }
  }, [])
}
```

---

## Performance y Optimizaciones

### 1. **React Query Configuration**
```typescript
// src/app/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      cacheTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

### 2. **Lazy Loading de Componentes**
```typescript
const SimulacroResultados = dynamic(() => import('@/components/evaluacion/ResultadosChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})
```

### 3. **Optimización de Imágenes**
```typescript
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

---

## PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // ... otras configuraciones
})
```

```json
// public/manifest.json
{
  "name": "Sistema de Evaluación",
  "short_name": "Quiz App",
  "description": "Preparación para examen de admisión",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```