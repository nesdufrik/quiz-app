'use client'

import { useQuery } from '@tanstack/react-query'
import { estudioService } from '@/services/estudio.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, Calculator, FlaskConical, Languages, Globe } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { AccessGuard } from '@/components/shared/AccessGuard'
import { cn } from '@/lib/utils'

// Mapeo de iconos por área
const ICONS: Record<string, any> = {
  'Matemáticas': Calculator,
  'Ciencias Naturales': FlaskConical,
  'Lenguaje': Languages,
  'Comprensión Lectora': Languages,
  'Ciencias Sociales': Globe,
}

export default function EstudioPage() {
  const { data: areas, isLoading, error } = useQuery({
    queryKey: ['areas'],
    queryFn: estudioService.getAreas
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-destructive text-lg font-semibold">Error al cargar las áreas</h2>
        <p className="text-muted-foreground">Por favor intenta recargar la página</p>
      </div>
    )
  }

  return (
    <AccessGuard>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Modo Estudio</h2>
          <p className="text-muted-foreground">Selecciona un área de conocimiento para comenzar a practicar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas?.map((area) => {
            const Icon = ICONS[area.nombre] || BookOpen
            
            return (
              <Card key={area.id} className="hover:shadow-lg transition-shadow border-l-4 overflow-hidden" style={{ borderLeftColor: area.color || 'var(--primary)' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-6 w-6" style={{ color: area.color || 'var(--primary)' }} />
                    </div>
                  </div>
                  <CardTitle className="mt-4">{area.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {area.descripcion || 'Explora los temas y preguntas de esta área.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/estudio/${area.id}`} className="w-full">
                    <Button className="w-full justify-between group" variant="outline">
                      Ver Temas
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AccessGuard>
  )
}