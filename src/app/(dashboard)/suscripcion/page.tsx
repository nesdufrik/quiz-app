'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suscripcionesService } from '@/services/suscripciones.service'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
	Loader2,
	Upload,
	CheckCircle2,
	QrCode,
	Clock,
	XCircle,
	Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SuscripcionPage() {
	const { user } = useAuthStore()
	const [file, setFile] = useState<File | null>(null)
	const queryClient = useQueryClient()

	// 1. Obtener Estado Actual
	const { data: estado, isLoading: loadingEstado } = useQuery({
		queryKey: ['estado-suscripcion', user?.id],
		queryFn: () => suscripcionesService.getEstadoSuscripcion(user!.id),
		enabled: !!user,
	})

	// 2. Obtener Plan Activo (Precio)
	const { data: plan, isLoading: loadingPlan } = useQuery({
		queryKey: ['plan-activo'],
		queryFn: () => suscripcionesService.getPlanActivo(),
	})

	// Mutación: Enviar Comprobante
	const enviarComprobante = useMutation({
		mutationFn: async () => {
			if (!user || !file) return
			// Busca la versión activa automáticamente
			return suscripcionesService.enviarComprobante(
				user.id,
				file,
				'e4bed9b5-8709-490a-9d4e-a006634e8bca' // TODO: Resolver dinámicamente si es necesario
			)
		},
		onSuccess: () => {
			toast.success(
				'Comprobante enviado. Te notificaremos cuando sea aprobado.'
			)
			setFile(null)
			queryClient.invalidateQueries({ queryKey: ['estado-suscripcion'] })
		},
		onError: (error) => {
			console.error(error)
			toast.error('Error al subir el comprobante. Intenta de nuevo.')
		},
	})

	if (loadingEstado || loadingPlan) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	// Estado: ACTIVA
	if (estado?.tipo === 'suscripcion' && 'estado' in estado && estado.estado === 'activa') {
		return (
			<div className="max-w-2xl mx-auto py-10 animate-in fade-in zoom-in duration-500">
				<Card className="bg-green-500/10 border-green-500/20">
					<CardContent className="flex flex-col items-center text-center p-8">
						<div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
							<CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
						</div>
						<h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
							¡Tu suscripción está activa!
						</h2>
						<p className="text-green-600 dark:text-green-400 mt-2">
							Tienes acceso total hasta el{' '}
							{'fecha_fin' in estado && estado.fecha_fin ? new Date(estado.fecha_fin).toLocaleDateString() : ''}.
						</p>
						<Button
							variant="outline"
							className="mt-6 border-green-500/30 text-green-700 hover:bg-green-500/10"
							onClick={() => (window.location.href = '/estudio')}
						>
							Ir a Estudiar
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Estado: PENDIENTE
	if (estado?.tipo === 'suscripcion' && 'estado' in estado && estado.estado === 'pendiente') {
		return (
			<div className="max-w-2xl mx-auto py-10 animate-in fade-in zoom-in duration-500">
				<Card className="bg-amber-500/10 border-amber-500/20">
					<CardContent className="flex flex-col items-center text-center p-8">
						<div className="h-16 w-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
							<Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-pulse" />
						</div>
						<h2 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
							Verificación en Progreso
						</h2>
						<p className="text-amber-600 dark:text-amber-400 mt-2 max-w-md">
							Hemos recibido tu comprobante y está en cola de revisión. Un
							administrador validará tu pago en breve.
						</p>
						<Button
							variant="ghost"
							className="mt-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
						>
							<XCircle className="w-4 h-4 mr-2" /> Cancelar Solicitud
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	// Estado: SIN SUSCRIPCIÓN (Mostrar oferta)
	return (
		<div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold text-foreground">
					{plan?.nombre || 'Plan Premium'}
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					{plan?.descripcion ||
						'Desbloquea el acceso ilimitado a simulacros, estadísticas avanzadas y todo el banco de preguntas.'}
				</p>
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				{/* Lado Izquierdo: Beneficios y QR */}
				<Card className="border-2 border-primary/20 shadow-lg relative overflow-hidden bg-card">
					<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
						RECOMENDADO
					</div>
					<CardHeader className="bg-muted/30 border-b">
						<CardTitle className="text-primary text-3xl flex items-baseline gap-1">
							Bs. {plan?.precio || 150}
							<span className="text-sm text-muted-foreground font-normal">
								/ pago único
							</span>
						</CardTitle>
						<CardDescription>
							Acceso completo hasta el día del examen
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6 p-6">
						<ul className="space-y-3">
							{[
								'750+ Preguntas Reales',
								'Simulacros Ilimitados',
								'Resultados Detallados',
								'Modo Estudio Sin Límites',
							].map((item) => (
								<li key={item} className="flex items-center gap-3">
									<div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
										<CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
									</div>
									<span className="text-sm text-foreground">{item}</span>
								</li>
							))}
						</ul>

						<div className="border-t pt-6 text-center">
							<p className="text-sm font-medium mb-4 text-foreground">
								Escanea para pagar con QR
							</p>
              <div className="bg-white p-2 w-48 h-48 mx-auto rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20 shadow-sm overflow-hidden">
                <img 
                  src="/qr-pago.png" 
                  alt="Código QR de Pago" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/200x200?text=Sube+QR+a+public/"
                  }}
                />
              </div>
              
              <div className="mt-4">
                <a href="/qr-pago.png" download="QR-Pago-QuizApp.png">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar QR
                  </Button>
                </a>
              </div>

              <p className="text-xs text-muted-foreground mt-3 font-mono">
                Banco Nacional de Bolivia
              </p>
						</div>
					</CardContent>
				</Card>

				{/* Lado Derecho: Subida */}
				<div className="space-y-6">
					<Alert className="bg-primary/5 border-primary/20">
						<Clock className="h-4 w-4 text-primary" />
						<AlertTitle className="text-primary font-semibold">
							¿Ya realizaste el pago?
						</AlertTitle>
						<AlertDescription className="text-muted-foreground">
							Sube una captura de pantalla o foto de tu comprobante para activar
							tu cuenta inmediatamente.
						</AlertDescription>
					</Alert>

					<Card className="bg-card">
						<CardHeader>
							<CardTitle>Enviar Comprobante</CardTitle>
							<CardDescription>
								Formatos: JPG, PNG. Tamaño máx: 500KB
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid w-full items-center gap-2">
								<Label htmlFor="picture">Archivo del Comprobante</Label>
								<div className="flex items-center justify-center w-full">
									<label
										htmlFor="picture"
										className={cn(
											'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
											file
												? 'border-primary bg-primary/5'
												: 'border-muted-foreground/25 bg-muted/30 hover:bg-muted/50'
										)}
									>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<Upload
												className={cn(
													'w-8 h-8 mb-2',
													file ? 'text-primary' : 'text-muted-foreground'
												)}
											/>
											<p className="text-sm text-muted-foreground text-center px-4">
												{file ? (
													<span className="font-semibold text-primary">
														{file.name}
													</span>
												) : (
													'Haz clic para seleccionar o arrastra aquí'
												)}
											</p>
										</div>
										<Input
											id="picture"
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => {
												const selectedFile = e.target.files?.[0] || null
												if (selectedFile && selectedFile.size > 500 * 1024) {
													toast.error('El archivo es demasiado grande. Máximo 500KB.')
													e.target.value = ''
													setFile(null)
													return
												}
												setFile(selectedFile)
											}}
										/>
									</label>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full shadow-md hover:shadow-lg transition-all"
								size="lg"
								disabled={!file || enviarComprobante.isPending}
								onClick={() => enviarComprobante.mutate()}
							>
								{enviarComprobante.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Subiendo...
									</>
								) : (
									<>Enviar para Revisión</>
								)}
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	)
}
