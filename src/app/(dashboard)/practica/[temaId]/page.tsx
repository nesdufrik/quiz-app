'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { estudioService, type Pregunta } from '@/services/estudio.service'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, AlertCircle, HelpCircle, Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { logrosService } from '@/services/logros.service'

export default function PracticaPage() {
  const params = useParams()
  const temaId = Array.isArray(params.temaId) ? params.temaId[0] : params.temaId
  const router = useRouter()
  const { user } = useAuthStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const { data: preguntas, isLoading } = useQuery({
    queryKey: ['preguntas', temaId],
    queryFn: () => estudioService.getPreguntasPorTema(temaId!),
    enabled: !!temaId
  })

  const registrarRespuesta = useMutation({
    mutationFn: async (datos: { esCorrecta: boolean, respuesta: string }) => {
      if (!user) throw new Error('Usuario no autenticado')
      return estudioService.registrarRespuesta(
        user.id,
        temaId!,
        preguntas![currentIndex].id,
        datos.respuesta,
        datos.esCorrecta
      )
    },
    onError: (error: any) => {
      console.error('Error guardando progreso:', error)
      toast.error('Error al guardar tu progreso')
    }
  })

  if (isLoading) return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  )

  if (!preguntas || preguntas.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
      <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-yellow-600" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">No hay preguntas disponibles</h2>
      <p className="text-muted-foreground mt-2 max-w-md">Este tema aún no tiene preguntas aprobadas. Intenta con otro tema.</p>
      <Button variant="outline" className="mt-6" onClick={() => router.back()}>Volver a Temas</Button>
    </div>
  )

  const preguntaActual = preguntas[currentIndex]
  const isLastQuestion = currentIndex === preguntas.length - 1
  const progress = ((currentIndex + 1) / preguntas.length) * 100

  const handleSelectOption = (letra: string) => {
    if (showFeedback || registrarRespuesta.isPending) return
    setSelectedOption(letra)
  }

  const handleVerificar = () => {
    if (!selectedOption) return
    
    const isCorrect = selectedOption === preguntaActual.respuesta_correcta
    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }))
    }
    setStats(prev => ({ ...prev, total: prev.total + 1 }))
    
    registrarRespuesta.mutate({ 
      esCorrecta: isCorrect, 
      respuesta: selectedOption 
    })

    if (user) {
      logrosService.otorgarLogro(user.id, 'primera_pregunta')
    }
    
    setShowFeedback(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      router.push(`/estudio`)
      toast.success(`Tema finalizado. Correctas: ${stats.correct}/${stats.total}`)
      return
    }
    setCurrentIndex(prev => prev + 1)
    setSelectedOption(null)
    setShowFeedback(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Salir
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Pregunta {currentIndex + 1} de {preguntas.length}
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-8" />

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border py-6">
          <div className="flex items-start gap-3">
             <div className="p-2 bg-primary/10 rounded-lg mt-1 shrink-0">
               <HelpCircle className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h2 className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
                 {preguntaActual.pregunta_simplificada || preguntaActual.pregunta_original}
               </h2>
               {preguntaActual.pregunta_simplificada && (
                 <p className="mt-2 text-sm text-muted-foreground italic">
                   Original: {preguntaActual.pregunta_original}
                 </p>
               )}
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-3">
          {['A', 'B', 'C', 'D'].map((letra) => {
            const opcionTexto = preguntaActual[`opcion_${letra.toLowerCase()}` as keyof Pregunta] as string
            const isSelected = selectedOption === letra
            
            let variantClass = "border-input hover:bg-muted hover:border-primary/50"
            let icon = <div className="h-5 w-5 rounded-full border border-input flex items-center justify-center text-xs text-muted-foreground font-medium group-hover:border-primary">{letra}</div>

            if (showFeedback) {
              const isCorrectAnswer = letra === preguntaActual.respuesta_correcta
              
              if (isCorrectAnswer) {
                variantClass = "bg-green-500/15 border-green-500 text-green-700 dark:text-green-300 ring-1 ring-green-500"
                icon = <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              } else if (isSelected && !isCorrectAnswer) {
                variantClass = "bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 ring-1 ring-red-500"
                icon = <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              } else {
                variantClass = "opacity-50 border-border"
              }
            } else if (isSelected) {
              variantClass = "bg-primary/10 border-primary text-primary ring-1 ring-primary"
              icon = <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{letra}</div>
            }

            return (
              <div 
                key={letra}
                onClick={() => handleSelectOption(letra)}
                className={cn(
                  "relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                  variantClass,
                  showFeedback && "cursor-default"
                )}
              >
                <div className="flex-shrink-0 mr-4">
                  {icon}
                </div>
                <div className="flex-1 text-sm md:text-base font-medium">
                  {opcionTexto}
                </div>
              </div>
            )
          })}
        </CardContent>

        {showFeedback && (
          <div className={cn(
            "px-6 py-4 border-t animate-in fade-in slide-in-from-top-2",
            selectedOption === preguntaActual.respuesta_correcta 
              ? "bg-green-500/10 border-green-500/20" 
              : "bg-red-500/10 border-red-500/20"
          )}>
            <h4 className={cn(
              "font-semibold flex items-center gap-2 mb-2",
              selectedOption === preguntaActual.respuesta_correcta 
                ? "text-green-700 dark:text-green-400" 
                : "text-red-700 dark:text-red-400"
            )}>
              {selectedOption === preguntaActual.respuesta_correcta ? "¡Correcto!" : "Incorrecto"}
            </h4>
            <p className="text-foreground text-sm leading-relaxed">
              <span className="font-semibold">Explicación: </span>
              {preguntaActual.sustento}
            </p>
          </div>
        )}

        <CardFooter className="bg-muted/30 px-6 py-4 flex justify-end border-t border-border">
          {!showFeedback ? (
            <Button 
              onClick={handleVerificar} 
              disabled={!selectedOption || registrarRespuesta.isPending}
              className="w-full md:w-auto"
            >
              {registrarRespuesta.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar Respuesta
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full md:w-auto">
              {isLastQuestion ? "Finalizar" : "Siguiente Pregunta"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
