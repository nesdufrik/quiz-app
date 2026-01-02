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
import { Badge } from '@/components/ui/badge'
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  UserMinus, 
  MoreVertical,
  Ban,
  Unlock,
  CreditCard,
  Loader2,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminUsuariosPage() {
  const { user: adminUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isSuscripcionDialogOpen, setIsSuscripcionDialogOpen] = useState(false)
  const [diasSuscripcion, setDiasSuscripcion] = useState(365)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: adminService.getUsuarios
  })

  // Filtrado de usuarios en el cliente
  const usuariosFiltrados = usuarios?.filter((u: any) => 
    u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const bloquearMut = useMutation({
    mutationFn: (userId: string) => adminService.bloquearUsuario(userId),
    onSuccess: () => {
      toast.success('Usuario bloqueado')
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (error: any) => toast.error('Error: ' + error.message)
  })

  const desbloquearMut = useMutation({
    mutationFn: (userId: string) => adminService.desbloquearUsuario(userId),
    onSuccess: () => {
      toast.success('Usuario desbloqueado')
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (error: any) => toast.error('Error: ' + error.message)
  })

  const cambiarRolMut = useMutation({
    mutationFn: ({ userId, rol }: { userId: string, rol: 'admin' | 'estudiante' }) => 
      adminService.cambiarRol(userId, rol),
    onSuccess: () => {
      toast.success('Rol actualizado')
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (error: any) => toast.error('Error: ' + error.message)
  })

  const asignarSusMut = useMutation({
    mutationFn: ({ userId, dias }: { userId: string, dias: number }) => 
      adminService.asignarSuscripcionManual(userId, dias, adminUser!.id),
    onSuccess: () => {
      toast.success('Suscripción asignada')
      setIsSuscripcionDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (error: any) => toast.error('Error: ' + error.message)
  })

  const cancelarSusMut = useMutation({
    mutationFn: (userId: string) => adminService.cancelarSuscripcionesActivas(userId),
    onSuccess: () => {
      toast.success('Suscripciones canceladas')
      queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (error: any) => toast.error('Error: ' + error.message)
  })

  const reenviarEmailMut = useMutation({
    mutationFn: async (u: any) => {
      const { sendAccessActivatedEmailAction } = await import('@/actions/email-actions');
      const result = await sendAccessActivatedEmailAction(u.email, u.nombre_completo || 'Usuario');
      
      if (!result.success) throw new Error(result.error || 'Fallo desconocido al enviar');
      return result;
    },
    onSuccess: () => toast.success('Correo enviado correctamente'),
    onError: (error: any) => toast.error('Error al enviar: ' + error.message)
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra perfiles, roles y accesos.</p>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-1">
          {usuarios?.length || 0} usuarios registrados
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground">
            Encontrados: {usuariosFiltrados?.length}
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado de Acceso</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No se encontraron usuarios que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados?.map((u: any) => {
                const suscripcionActiva = u.suscripciones?.find((s: any) => s.estado === 'activa');
                const estaBloqueado = u.bloqueado;

                return (
                  <TableRow key={u.id} className={estaBloqueado ? "opacity-60 bg-muted/20" : ""}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{u.nombre_completo || 'Sin nombre'}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.rol === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {estaBloqueado ? (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="w-3 h-3" /> Bloqueado
                        </Badge>
                      ) : suscripcionActiva ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600 gap-1">
                          <ShieldCheck className="w-3 h-3" /> Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Gratis / Prueba</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Acciones de Usuario</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Bloqueo */}
                          {estaBloqueado ? (
                            <DropdownMenuItem onClick={() => desbloquearMut.mutate(u.id)}>
                              <Unlock className="w-4 h-4 mr-2 text-green-600" />
                              Desbloquear
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => bloquearMut.mutate(u.id)} className="text-destructive">
                              <Ban className="w-4 h-4 mr-2" />
                              Bloquear
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Suscripción</DropdownMenuLabel>
                          
                          {/* Gestionar Suscripción */}
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(u);
                            setIsSuscripcionDialogOpen(true);
                          }}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Asignar Acceso Manual
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            onClick={() => reenviarEmailMut.mutate(u)}
                            disabled={reenviarEmailMut.isPending}
                          >
                            {reenviarEmailMut.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 mr-2" />
                            )}
                            Notificar Acceso por Correo
                          </DropdownMenuItem>

                          {suscripcionActiva && (
                            <DropdownMenuItem onClick={() => cancelarSusMut.mutate(u.id)} className="text-destructive">
                              <UserMinus className="w-4 h-4 mr-2" />
                              Quitar Acceso Premium
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Roles</DropdownMenuLabel>
                          
                          {u.rol === 'admin' ? (
                            <DropdownMenuItem onClick={() => cambiarRolMut.mutate({ userId: u.id, rol: 'estudiante' })}>
                              <ShieldAlert className="w-4 h-4 mr-2" />
                              Quitar Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => cambiarRolMut.mutate({ userId: u.id, rol: 'admin' })}>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Hacer Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para Asignar Suscripción */}
      <Dialog open={isSuscripcionDialogOpen} onOpenChange={setIsSuscripcionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Acceso Manual</DialogTitle>
            <DialogDescription>
              Esto activará una suscripción premium para {selectedUser?.nombre_completo} sin necesidad de pago.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days" className="text-right">Días</Label>
              <Input
                id="days"
                type="number"
                value={diasSuscripcion}
                onChange={(e) => setDiasSuscripcion(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuscripcionDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => asignarSusMut.mutate({ userId: selectedUser.id, dias: diasSuscripcion })}>
              Confirmar Acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
