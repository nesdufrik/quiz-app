'use client'

import { useQuery } from '@tanstack/react-query'
import { simulacrosService } from '@/services/simulacros.service'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, ArrowLeft, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ResultadosPage() {
  const params = useParams()
  const simulacroId = params.simulacroId as string
  const router = useRouter()

  const { data: simulacro, isLoading: loadingSim } = useQuery({
    queryKey: ['simulacro', simulacroId],
    queryFn: () => simulacrosService.getSimulacro(simulacroId),
  })

  const { data: resultados, isLoading: loadingRes } = useQuery({
    queryKey: ['resultados-simulacro', simulacroId],
    queryFn: () => simulacrosService.getResultadosSimulacro(simulacroId),
  })

  if (loadingSim || loadingRes)
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )

  if (!simulacro || !resultados) return <div>No se encontraron resultados.</div>

  const chartConfig = {
    porcentaje: {
      label: 'Porcentaje',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Resultados del Simulacro
          </h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de tu desempeño.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link href="/inicio" className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" /> Inicio
            </Button>
          </Link>
          <Link href="/evaluacion" className="flex-1 md:flex-none">
            <Button className="w-full shadow-md">
              <RotateCcw className="w-4 h-4 mr-2" /> Nuevo Intento
            </Button>
          </Link>
        </div>
      </div>

      {/* Puntaje General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-primary text-primary-foreground border-0 shadow-xl flex flex-col justify-center items-center p-8">
          <Trophy className="w-16 h-16 mb-4 text-primary-foreground/80" />
          <h2 className="text-xl font-medium opacity-90">Tu Puntaje Final</h2>
          <div className="text-6xl font-bold mt-2">
            {simulacro.puntaje_total}
          </div>
          <p className="mt-2 text-primary-foreground/70 italic">de 100 puntos posibles</p>
        </Card>

        <Card className="md:col-span-2 shadow-lg border-border">
          <CardHeader>
            <CardTitle>Estadísticas de Respuesta</CardTitle>
            <CardDescription>
              Resumen cuantitativo de tu examen.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Correctas</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {simulacro.preguntas_correctas}
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Incorrectas</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {simulacro.preguntas_incorrectas}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <p className="text-sm font-medium text-muted-foreground">Omitidas</p>
              <p className="text-3xl font-bold text-foreground">
                {simulacro.preguntas_omitidas}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico por Áreas */}
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle>Desempeño por Área de Conocimiento</CardTitle>
          <CardDescription>
            Identifica tus fortalezas y debilidades por materia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resultados} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="nombre"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    className="text-xs font-medium fill-muted-foreground"
                  />
                  <YAxis 
                    hide={false} 
                    domain={[0, 100]} 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs font-medium fill-muted-foreground"
                  />
                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="porcentaje" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {resultados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || 'var(--primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Detalle por Áreas */}
      <Card className="shadow-lg border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-lg">Desglose Detallado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {resultados.map((res) => (
              <div
                key={res.nombre}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: res.color }}
                  />
                  <span className="font-medium text-foreground line-clamp-1">
                    {res.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                  <div className="text-right hidden sm:block">
                    <span className="text-sm text-muted-foreground">Correctas</span>
                    <p className="font-bold text-foreground">
                      {res.correctas} / {res.total}
                    </p>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm text-muted-foreground">Efectividad</span>
                    <p
                      className={cn(
                        'font-bold',
                        res.porcentaje >= 70
                          ? 'text-green-600 dark:text-green-400'
                          : res.porcentaje >= 40
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {res.porcentaje}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}