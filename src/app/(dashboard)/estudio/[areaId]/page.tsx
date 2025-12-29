'use client'

import { useQuery } from '@tanstack/react-query'
import { estudioService } from '@/services/estudio.service'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowLeft, Book, PlayCircle, CheckCircle2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TeoriaModal } from '@/components/estudio/TeoriaModal'
import { useState } from 'react'

export default function TemasPage() {
	const params = useParams()
	const areaId = Array.isArray(params.areaId) ? params.areaId[0] : params.areaId
	const router = useRouter()
	const { user } = useAuthStore()

	const [temaSeleccionado, setTemaSeleccionado] = useState<{
		nombre: string
		contenido: string
	} | null>(null)

	const { data: temas, isLoading: loadingTemas } = useQuery({
		queryKey: ['temas', areaId],
		queryFn: () => estudioService.getTemasPorArea(areaId!),
		enabled: !!areaId,
	})

	const { data: progreso } = useQuery({
		queryKey: ['progreso', areaId, user?.id],
		queryFn: () => estudioService.getProgresoUsuario(user!.id, areaId!),
		enabled: !!areaId && !!user,
	})

	if (loadingTemas)
		return (
			<div className="space-y-4">
				<Skeleton className="h-12 w-1/3" />
				<Skeleton className="h-64 w-full" />
			</div>
		)

	const getProgresoTema = (temaId: string) => {
		return progreso?.find((p) => p.tema_id === temaId)
	}

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div className="flex flex-col sm:flex-row sm:items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="shrink-0"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h2 className="text-2xl font-bold text-foreground">
						Temas de Estudio
					</h2>
					<p className="text-muted-foreground">
						{temas?.length || 0} temas disponibles
					</p>
				</div>
			</div>

			<div className="grid gap-4">
				{temas?.map((tema) => {
					const stats = getProgresoTema(tema.id)
					const porcentaje = stats?.porcentaje_completado || 0
					const esCompletado = porcentaje === 100

					return (
						<Card
							key={tema.id}
							className="group hover:border-primary/50 transition-colors"
						>
							<CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between">
								<div className="p-6 flex-1">
									<div className="flex items-center gap-3 mb-2">
										{esCompletado ? (
											<span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 shrink-0">
												<CheckCircle2 className="h-5 w-5" />
											</span>
										) : (
											<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary shrink-0">
												{tema.orden}
											</span>
										)}
										<h3 className="font-semibold text-lg text-foreground line-clamp-1">
											{tema.nombre}
										</h3>
									</div>

									<div className="pl-11 space-y-3">
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<span className="flex items-center gap-1">
												<Book className="h-4 w-4" />
												{tema.total_preguntas} preguntas
											</span>
											<span className="text-muted-foreground/30">|</span>
											<span
												className={
													esCompletado ? 'text-green-600 font-medium' : ''
												}
											>
												{porcentaje}% Completado
											</span>
										</div>

										<div className="w-full max-w-xs">
											<Progress value={porcentaje} className="h-1.5" />
										</div>
									</div>
								</div>

								<div className="px-6 pb-6 sm:pb-0 sm:pr-6 flex items-center flex-col sm:flex-row gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
									{tema.md_doc && (
										<Button
											variant="ghost"
											size="sm"
											className="inline-flex"
											onClick={() =>
												setTemaSeleccionado({
													nombre: tema.nombre,
													contenido: tema.md_doc!,
												})
											}
										>
											Lectura del tema
										</Button>
									)}

									<Link
										href={`/practica/${tema.id}`}
										className="w-full sm:w-auto"
									>
										<Button
											className={cn(
												'w-full sm:w-auto',
												esCompletado ? 'bg-green-600 hover:bg-green-700' : ''
											)}
										>
											<PlayCircle className="mr-2 h-4 w-4" />
											{esCompletado ? 'Repasar' : 'Practicar'}
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<TeoriaModal
				isOpen={!!temaSeleccionado}
				onClose={() => setTemaSeleccionado(null)}
				titulo={temaSeleccionado?.nombre || ''}
				contenido={temaSeleccionado?.contenido || null}
			/>
		</div>
	)
}
