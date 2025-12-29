import { supabase } from '@/lib/supabase/client'

// Función auxiliar para redimensionar y convertir a WebP
const optimizarImagen = (file: File): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)

		reader.onload = (event) => {
			const img = new Image()
			img.src = event.target?.result as string

			img.onload = () => {
				const MAX_WIDTH = 1024
				const MAX_HEIGHT = 1024
				let width = img.width
				let height = img.height

				// Calcular nuevas dimensiones manteniendo aspect ratio
				if (width > height) {
					if (width > MAX_WIDTH) {
						height *= MAX_WIDTH / width
						width = MAX_WIDTH
					}
				} else {
					if (height > MAX_HEIGHT) {
						width *= MAX_HEIGHT / height
						height = MAX_HEIGHT
					}
				}

				const canvas = document.createElement('canvas')
				canvas.width = width
				canvas.height = height

				const ctx = canvas.getContext('2d')
				if (!ctx) {
					reject(new Error('No se pudo obtener contexto del canvas'))
					return
				}

				// Fondo blanco por si es PNG transparente
				ctx.fillStyle = '#FFFFFF'
				ctx.fillRect(0, 0, width, height)
				ctx.drawImage(img, 0, 0, width, height)

				// Exportar a WebP
				canvas.toBlob(
					(blob) => {
						if (blob) resolve(blob)
						else reject(new Error('Error al comprimir imagen'))
					},
					'image/webp',
					0.8
				) // Calidad 80%
			}

			img.onerror = (error) => reject(error)
		}

		reader.onerror = (error) => reject(error)
	})
}

export const suscripcionesService = {
	// Obtener estado de suscripción actual
	async getEstadoSuscripcion(userId: string) {
		// 1. Verificar suscripción activa
		const { data: sus } = await supabase
			.from('suscripciones')
			.select('*')
			.eq('user_id', userId)
			.in('estado', ['activa', 'pendiente'])
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()

		if (sus) return { tipo: 'suscripcion', ...sus }

		// 2. Verificar periodo de prueba
		const { data: prueba } = await supabase
			.from('periodos_prueba')
			.select('*')
			.eq('user_id', userId)
			.single()

		if (prueba) {
			const fin = new Date(prueba.fecha_fin)
			const ahora = new Date()
			if (fin > ahora) {
				return {
					tipo: 'prueba',
					diasRestantes: Math.ceil(
						(fin.getTime() - ahora.getTime()) / (1000 * 3600 * 24)
					),
				}
			}
		}

		return { tipo: 'sin_acceso' }
	},

	// Obtener información del plan activo para mostrar en UI
	async getPlanActivo() {
		const { data, error } = await supabase
			.from('planes_suscripcion')
			.select('*')
			.eq('activo', true)
			.limit(1)
			.single()

		if (error) throw error
		return data
	},

	// Subir comprobante y registrar solicitud
	async enviarComprobante(userId: string, file: File, versionId: string) {
		try {
			let fileToUpload: File | Blob = file
			let fileExt = file.name.split('.').pop()?.toLowerCase() || 'dat'

			// Optimizar si es imagen
			if (file.type.startsWith('image/')) {
				try {
					console.log(`Optimizando imagen: ${file.size / 1024} KB...`)
					const optimizedBlob = await optimizarImagen(file)
					console.log(
						`Imagen optimizada: ${optimizedBlob.size / 1024} KB (WebP)`
					)

					fileToUpload = optimizedBlob
					fileExt = 'webp'
				} catch (e) {
					console.warn('No se pudo optimizar la imagen, subiendo original', e)
				}
			}

			// 1. Subir archivo
			const fileName = `${userId}-${Date.now()}.${fileExt}`
			const filePath = `${fileName}`

			const { error: uploadError } = await supabase.storage
				.from('comprobantes')
				.upload(filePath, fileToUpload, {
					contentType: fileExt === 'webp' ? 'image/webp' : file.type,
				})

			if (uploadError) throw uploadError

			// 2. Obtener URL pública
			const {
				data: { publicUrl },
			} = supabase.storage.from('comprobantes').getPublicUrl(filePath)

			// 3. Obtener plan
			const { data: plan } = await supabase
				.from('planes_suscripcion')
				.select('*')
				.limit(1)
				.single()

			if (!plan) throw new Error('No hay planes de suscripción configurados')

			// 4. Crear registro de suscripción
			const { error: dbError } = await supabase.from('suscripciones').insert({
				user_id: userId,
				version_examen_id: versionId,
				plan_id: plan.id,
				estado: 'pendiente',
				comprobante_pago_url: publicUrl,
				fecha_inicio: new Date().toISOString(),
				fecha_fin: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000
				).toISOString(),
				monto_pagado: plan.precio,
			})

			if (dbError) throw dbError

			return true
		} catch (error) {
			console.error('Error enviando comprobante:', error)
			throw error
		}
	},
}
