'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { simulacrosService } from '@/services/simulacros.service'
import { useAuthStore } from '@/stores/authStore'
import { useSimulacroStore } from '@/stores/simulacroStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, History, Clock, Award, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AccessGuard } from '@/components/shared/AccessGuard'
import { cn } from '@/lib/utils'

export default function EvaluacionPage() {
	const { user } = useAuthStore()
	const { setActiveSimulacro } = useSimulacroStore()
	const router = useRouter()

	const { data: historial, isLoading } = useQuery({
		queryKey: ['simulacros-historial', user?.id],
		queryFn: () => simulacrosService.getHistorial(user!.id),
		enabled: !!user,
	})

	const crearSimulacro = useMutation({
		mutationFn: async () => {
			return simulacrosService.crearSimulacro(user!.id)
		},
		onSuccess: (data) => {
			setActiveSimulacro(data.id)
			router.push(`/evaluacion/${data.id}`)
			toast.success('¡Simulacro generado! Buena suerte.')
		},
		onError: (error) => {
			console.error(error)
			toast.error('Error al generar el simulacro')
		},
	})

	const handleNuevoSimulacro = async () => {
		crearSimulacro.mutate()
	}

	return (
		<AccessGuard>
			<div className="space-y-8 animate-in fade-in duration-500">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							Evaluación y Simulacros
						</h1>
						<p className="text-muted-foreground mt-1">
							Pon a prueba tus conocimientos con exámenes tipo admisión.
						</p>
					</div>
				</div>

				{/* Hero Card */}
				<Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-xl overflow-hidden relative">
					<div className="absolute top-0 right-0 p-8 opacity-10">
						<Award className="w-64 h-64" />
					</div>
					<CardContent className="p-8 relative z-10">
						<div className="max-w-xl">
							<h2 className="text-2xl font-bold mb-4">Simulacro Completo</h2>
							<ul className="space-y-2 mb-8 text-blue-100">
								<li className="flex items-center gap-2">
									<Clock className="w-5 h-5" /> 120 minutos de duración
								</li>
								<li className="flex items-center gap-2">
									<Award className="w-5 h-5" /> 100 preguntas variadas
								</li>
								<li className="flex items-center gap-2">
									<History className="w-5 h-5" /> Resultados detallados al
									finalizar
								</li>
							</ul>
							<Button
								size="lg"
								variant="secondary"
								onClick={() => handleNuevoSimulacro()}
								disabled={crearSimulacro.isPending}
								className="font-bold text-foreground shadow-lg hover:shadow-xl transition-all"
							>
								{crearSimulacro.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Generando examen...
									</>
								) : (
									<>
										<Play className="mr-2 h-4 w-4" />
										Comenzar Nuevo Simulacro
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Historial */}
				<div className="space-y-4">
					<h3 className="text-xl font-bold text-foreground flex items-center gap-2">
						<History className="w-5 h-5" /> Historial de Intentos
					</h3>

					{isLoading ? (
						<div className="text-muted-foreground">Cargando historial...</div>
					) : historial?.length === 0 ? (
						<Card className="border-dashed bg-muted/30">
							<CardContent className="p-8 text-center text-muted-foreground">
								No has realizado ningún simulacro todavía.
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4">
							{historial?.map((sim) => (
								<Card
									key={sim.id}
									className="hover:bg-muted/50 transition-colors cursor-pointer"
									onClick={() =>
										router.push(`/evaluacion/${sim.id}/resultados`)
									}
								>
									<CardContent className="p-4 flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div
												className={cn(
													'p-2 rounded-full',
													sim.estado === 'completado'
														? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
														: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
												)}
											>
												{sim.estado === 'completado' ? (
													<Award className="w-5 h-5" />
												) : (
													<Clock className="w-5 h-5" />
												)}
											</div>
											<div>
												<p className="font-medium text-foreground">
													{sim.fecha_inicio ? new Date(sim.fecha_inicio).toLocaleDateString() : 'Fecha no disponible'}
												</p>
												<p className="text-sm text-muted-foreground">
													{sim.estado === 'completado'
														? `Puntaje: ${sim.puntaje_total}/100`
														: 'En progreso...'}
												</p>
											</div>
										</div>
										<Button variant="ghost" size="sm">
											Ver Detalles
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</AccessGuard>
	)
}
