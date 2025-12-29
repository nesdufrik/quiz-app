'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/stores/authStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Eye, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSuscripcionesPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { data: suscripciones, isLoading } = useQuery({
    queryKey: ['admin-suscripciones'],
    queryFn: adminService.getSuscripcionesPendientes
  })

  const aprobarMut = useMutation({
    mutationFn: (id: string) => adminService.aprobarSuscripcion(id, user!.id),
    onSuccess: () => {
      toast.success('Suscripción aprobada')
      queryClient.invalidateQueries({ queryKey: ['admin-suscripciones'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error) => toast.error('Error al aprobar: ' + error.message)
  })

  const rechazarMut = useMutation({
    mutationFn: (id: string) => adminService.rechazarSuscripcion(id, user!.id, 'Comprobante inválido'),
    onSuccess: () => {
      toast.success('Suscripción rechazada')
      queryClient.invalidateQueries({ queryKey: ['admin-suscripciones'] })
    },
    onError: (error) => toast.error('Error al rechazar: ' + error.message)
  })

  if (isLoading) return <div>Cargando...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Solicitudes Pendientes</h1>
        <Badge variant="outline" className="text-base px-4 py-1">
          {suscripciones?.length || 0} pendientes
        </Badge>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suscripciones?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No hay solicitudes pendientes.
                </TableCell>
              </TableRow>
            ) : (
              suscripciones?.map((sus: any) => (
                <TableRow key={sus.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {sus.perfil?.nombre_completo || 'Usuario'}
                    </div>
                    <div className="text-xs text-muted-foreground">{sus.perfil?.email}</div>
                  </TableCell>
                  <TableCell>{new Date(sus.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>Bs. {sus.monto_pagado}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelectedImage(sus.comprobante_pago_url)}>
                      <Eye className="w-4 h-4 mr-2" /> Ver Imagen
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
                      onClick={() => aprobarMut.mutate(sus.id)}
                      disabled={aprobarMut.isPending}
                    >
                      {aprobarMut.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => rechazarMut.mutate(sus.id)}
                      disabled={rechazarMut.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para ver imagen */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
            <DialogDescription>Verifica los datos de la transferencia.</DialogDescription>
          </DialogHeader>
          <div className="relative h-[60vh] w-full bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center p-2">
            {selectedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={selectedImage} 
                alt="Comprobante" 
                className="max-h-full max-w-full object-contain rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}