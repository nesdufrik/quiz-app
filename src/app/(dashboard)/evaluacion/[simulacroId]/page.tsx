'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { simulacrosService, type SimulacroPregunta } from '@/services/simulacros.service'
import { useSimulacroStore } from '@/stores/simulacroStore'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SimulacroTimer } from '@/components/evaluacion/SimulacroTimer'
import { NavegadorPreguntas } from '@/components/evaluacion/NavegadorPreguntas'
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  HelpCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export default function ExamenPage() {
  const params = useParams()
  const simulacroId = params.simulacroId as string
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const { currentQuestionIndex, setQuestionIndex, nextQuestion, prevQuestion } = useSimulacroStore()
  const [respuestasLocales, setRespuestasLocales] = useState<Record<string, string>>({})

  const { data: preguntas, isLoading } = useQuery({
    queryKey: ['simulacro-preguntas', simulacroId],
    queryFn: () => simulacrosService.getPreguntasSimulacro(simulacroId),
    enabled: !!simulacroId
  })

  useEffect(() => {
    if (preguntas) {
      const initial: Record<string, string> = {}
      preguntas.forEach(p => {
        if (p.respuesta_usuario && p.pregunta_id) {
          initial[p.pregunta_id] = p.respuesta_usuario
        }
      })
      setRespuestasLocales(initial)
    }
  }, [preguntas])

  const responderMut = useMutation({
    mutationFn: ({ pId, r }: { pId: string, r: string }) => {
      const item = preguntas?.find(p => p.pregunta_id === pId)
      return simulacrosService.responderPregunta(item!.id, r)
    }
  })

  const finalizarMut = useMutation({
    mutationFn: () => simulacrosService.finalizarSimulacro(simulacroId),
    onSuccess: () => {
      toast.success('¡Examen finalizado con éxito!')
      router.push(`/evaluacion/${simulacroId}/resultados`)
    }
  })

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-96 w-full" /></div>

  const preguntaActualItem = preguntas?.[currentQuestionIndex]
  const preguntaActual = preguntaActualItem?.pregunta
  
  if (!preguntaActual) return <div>Error cargando pregunta</div>

  const handleResponder = (letra: string) => {
    setRespuestasLocales(prev => ({ ...prev, [preguntaActual.id]: letra }))
    responderMut.mutate({ pId: preguntaActual.id, r: letra })
  }

  const handleFinalizar = () => {
    if (confirm('¿Estás seguro de que deseas finalizar el examen? No podrás cambiar tus respuestas.')) {
      finalizarMut.mutate()
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Barra Superior Fija */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-foreground">Simulacro 2026</h2>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm font-medium text-muted-foreground">
            Pregunta {currentQuestionIndex + 1} de {preguntas?.length}
          </div>
        </div>
        
        <SimulacroTimer initialMinutes={120} onTimeUp={() => handleFinalizar()} />
        
        <Button 
          variant="destructive" 
          onClick={handleFinalizar}
          disabled={finalizarMut.isPending}
          className="font-bold shadow-md"
        >
          {finalizarMut.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          Finalizar Examen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Pregunta */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-xl overflow-hidden bg-card">
            <CardHeader className="bg-primary p-6 text-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-foreground/10 rounded-lg">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium leading-relaxed">
                  {preguntaActual.pregunta_simplificada || preguntaActual.pregunta_original}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {['A', 'B', 'C', 'D'].map((letra) => {
                const key = `opcion_${letra.toLowerCase()}` as 'opcion_a' | 'opcion_b' | 'opcion_c' | 'opcion_d'
                const texto = preguntaActual[key]
                const isSelected = respuestasLocales[preguntaActual.id] === letra

                return (
                  <button
                    key={letra}
                    onClick={() => handleResponder(letra)}
                    className={cn(
                      "w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all group",
                      isSelected 
                        ? "bg-primary/10 border-primary ring-1 ring-primary" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold mr-4 border-2 transition-colors",
                      isSelected 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50"
                    )}>
                      {letra}
                    </span>
                    <span className={cn(
                      "text-lg font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {texto}
                    </span>
                  </button>
                )
              })}
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-between items-center border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => prevQuestion()}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>
              
              <Button 
                onClick={() => nextQuestion()}
                disabled={currentQuestionIndex === (preguntas?.length || 0) - 1}
              >
                Siguiente <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Recuerda que puedes saltar entre preguntas usando el navegador de la derecha. 
              Tus respuestas se guardan automáticamente.
            </p>
          </div>
        </div>

        {/* Lado Derecho: Navegador */}
        <div className="space-y-6">
          <Card className="sticky top-48 border shadow-lg bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Estado del Examen</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <NavegadorPreguntas 
                total={preguntas?.length || 0}
                currentIndex={currentQuestionIndex}
                respuestas={respuestasLocales}
                preguntasIds={preguntas?.map(p => p.pregunta_id || '') || []}
                onSelect={(idx) => setQuestionIndex(idx)}
              />
              
              <div className="mt-6 space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Respondidas</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{Object.keys(respuestasLocales).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pendientes</span>
                  <span className="font-bold text-muted-foreground">{(preguntas?.length || 0) - Object.keys(respuestasLocales).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}