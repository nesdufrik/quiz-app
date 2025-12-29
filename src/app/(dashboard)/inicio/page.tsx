'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { estudioService } from '@/services/estudio.service'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Flame, 
  Target, 
  Clock, 
  ArrowRight, 
  BookOpen,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InicioPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Lógica de Racha
  useEffect(() => {
    if (!user) return

    const actualizarRacha = async () => {
      const { data: rachaActual } = await supabase
        .from('rachas')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const hoy = new Date().toISOString().split('T')[0]
      
      if (!rachaActual) {
        await supabase.from('rachas').insert({
          user_id: user.id,
          racha_actual: 1,
          racha_maxima: 1,
          ultima_actividad: hoy
        })
      } else if (rachaActual.ultima_actividad !== hoy) {
        const ayer = new Date()
        ayer.setDate(ayer.getDate() - 1)
        const ayerStr = ayer.toISOString().split('T')[0]

        let nuevaRacha = 1
        if (rachaActual.ultima_actividad === ayerStr) {
          nuevaRacha = rachaActual.racha_actual + 1
        }

        await supabase.from('rachas').update({
          racha_actual: nuevaRacha,
          racha_maxima: Math.max(nuevaRacha, rachaActual.racha_maxima),
          ultima_actividad: hoy
        }).eq('user_id', user.id)
        
        queryClient.invalidateQueries({ queryKey: ['stats-generales'] })
      }
    }

    actualizarRacha()
  }, [user, queryClient])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats-generales', user?.id],
    queryFn: () => estudioService.getEstadisticasGenerales(user!.id),
    enabled: !!user
  })

  const nombreUsuario = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudiante'

  const statsDisplay = [
    { 
      label: 'Racha Actual', 
      value: isLoading ? '...' : `${stats?.racha || 0} días`, 
      icon: Flame, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
    { 
      label: 'Preguntas', 
      value: isLoading ? '...' : `${stats?.respondidas || 0}/${stats?.totalGlobal || 775}`, 
      icon: Target, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Progreso Total', 
      value: isLoading ? '...' : `${stats?.totalGlobal ? Math.round((stats.respondidas / stats.totalGlobal) * 100) : 0}%`, 
      icon: Trophy, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10' 
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            ¡Hola, {nombreUsuario}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Listo para continuar tu preparación para el examen 2026.
          </p>
        </div>
        <Link href="/estudio">
          <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
            Continuar Estudiando <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.label} className="border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className={cn("p-4 rounded-xl mr-4", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Acceso Rápido</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/estudio">
              <Card className="hover:border-primary/50 cursor-pointer transition-colors group h-full">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Modo Estudio</h4>
                  <p className="text-sm text-muted-foreground">Practica por temas y áreas específicas</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/evaluacion">
              <Card className="hover:border-primary/50 cursor-pointer transition-colors group h-full">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-accent rounded-full group-hover:bg-accent/80 transition-colors">
                    <Trophy className="h-6 w-6 text-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground">Simulacro</h4>
                  <p className="text-sm text-muted-foreground">Examen completo de 100 preguntas</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p>Aún no tienes actividad reciente.</p>
                <p className="text-sm mt-1">¡Completa tu primera lección hoy!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
