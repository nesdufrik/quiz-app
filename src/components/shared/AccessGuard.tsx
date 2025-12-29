'use client'

import { useAcceso } from '@/hooks/useAcceso'
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lock, Clock, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function AccessGuard({ children }: { children: React.ReactNode }) {
	const { data: acceso, isLoading } = useAcceso()

	if (isLoading) {
		return (
			<div className="p-8 space-y-4">
				<Skeleton className="h-12 w-3/4" />
				<Skeleton className="h-64 w-full" />
			</div>
		)
	}

	// Si tiene acceso (prueba o suscripción), renderizar el contenido
	if (acceso?.tiene_acceso) {
		return (
			<>
				{/* Aviso discreto si le queda poco tiempo de prueba (menos de 2 horas) */}
				{acceso.tipo_acceso === 'prueba' && acceso.dias_restantes === 0 && (
					<div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-center mb-4 rounded-lg flex items-center justify-center gap-2 animate-in slide-in-from-top-2 flex-col sm:flex-row">
						<Clock className="w-4 h-4" />
						<span>Tu periodo de prueba termina pronto.</span>
						<Link
							href="/suscripcion"
							className="underline font-bold hover:text-amber-900 dark:hover:text-amber-100"
						>
							Suscríbete aquí.
						</Link>
					</div>
				)}
				{children}
			</>
		)
	}

	// Si NO tiene acceso, mostrar pantalla de bloqueo
	return (
		<div className="flex items-center justify-center min-h-[60vh] p-4 animate-in zoom-in duration-300">
			<Card className="max-w-md w-full border-destructive/20 shadow-xl overflow-hidden">
				<div className="h-2 bg-destructive w-full" />
				<CardHeader className="text-center pb-2 pt-8">
					<div className="mx-auto bg-destructive/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
						<Lock className="w-10 h-10 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-bold text-foreground">
						Acceso Restringido
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<p className="text-muted-foreground">
						Tu <strong>Periodo de Prueba de 24 horas</strong> ha finalizado o no
						cuentas con una suscripción activa.
					</p>
					<div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground flex items-start gap-3 text-left">
						<AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
						<p>
							Para continuar accediendo a los simulacros y material de estudio,
							necesitas activar el Plan Premium.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-3 pb-8">
					<Link href="/suscripcion" className="w-full">
						<Button className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all">
							Desbloquear Acceso Ahora
						</Button>
					</Link>
					<Link href="/inicio" className="w-full">
						<Button
							variant="ghost"
							className="w-full text-muted-foreground hover:text-foreground"
						>
							Volver al Inicio
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	)
}
