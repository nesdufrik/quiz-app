'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { soporteService, type ReporteSoporte } from '@/services/soporte.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Mail,
  Loader2,
  RefreshCcw,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ReportesAdminPage() {
  const queryClient = useQueryClient()

  const { data: reportes, isLoading, refetch } = useQuery({
    queryKey: ['admin-reportes'],
    queryFn: () => soporteService.getTodosLosReportes()
  })

  const mutation = useMutation({
    mutationFn: ({ id, estado }: { id: string, estado: ReporteSoporte['estado'] }) => 
      soporteService.actualizarEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reportes'] })
      toast.success('Estado actualizado correctamente')
    }
  })

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'error': return <Badge variant="destructive">Error</Badge>
      case 'sugerencia': return <Badge variant="secondary" className="bg-blue-500 text-white">Sugerencia</Badge>
      case 'soporte': return <Badge variant="outline" className="border-amber-500 text-amber-600">Soporte</Badge>
      default: return <Badge>{tipo}</Badge>
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Badge variant="outline" className="animate-pulse">Pendiente</Badge>
      case 'en_revision': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">En Revisión</Badge>
      case 'resuelto': return <Badge className="bg-green-500">Resuelto</Badge>
      default: return <Badge>{estado}</Badge>
    }
  }

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sugerencias y Reportes</h1>
          <p className="text-muted-foreground">Gestiona el feedback y problemas reportados por los usuarios.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Actualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {reportes?.length === 0 ? (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-12 text-center text-muted-foreground">
              No hay reportes ni sugerencias por el momento.
            </CardContent>
          </Card>
        ) : (
          reportes?.map((reporte: any) => (
            <Card key={reporte.id} className={cn(
              "overflow-hidden transition-all border-l-4",
              reporte.prioridad === 'alta' ? "border-l-destructive" : 
              reporte.prioridad === 'media' ? "border-l-amber-500" : "border-l-blue-500"
            )}>
              <CardHeader className="pb-3 bg-muted/20">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTipoBadge(reporte.tipo)}
                      {getEstadoBadge(reporte.estado)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reporte.created_at && format(new Date(reporte.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{reporte.titulo}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {reporte.perfil?.nombre_completo || 'Usuario'}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {reporte.perfil?.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      defaultValue={reporte.estado} 
                      onValueChange={(val) => mutation.mutate({ id: reporte.id, estado: val as any })}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en_revision">En Revisión</SelectItem>
                        <SelectItem value="resuelto">Resuelto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {reporte.descripcion}
                </p>
                
                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Trash2 className="h-4 w-4 mr-2" /> Archivar
                  </Button>
                  {reporte.estado !== 'resuelto' && (
                    <Button 
                      size="sm" 
                      onClick={() => mutation.mutate({ id: reporte.id, estado: 'resuelto' })}
                      disabled={mutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como Resuelto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
