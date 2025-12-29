'use client'

import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, Clock, DollarSign } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getDashboardStats
  })

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-32 w-full" /></div>

  const kpi = [
    { label: 'Usuarios Totales', value: stats?.usuarios, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Suscripciones Activas', value: stats?.activas, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Pendientes de Aprobar', value: stats?.pendientes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Ingresos Totales', value: `Bs. ${stats?.totalIngresos}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpi.map((item) => (
          <Card key={item.label} className="border shadow-sm">
            <CardContent className="flex items-center p-6">
              <div className={`p-4 rounded-full mr-4 ${item.bg} dark:bg-opacity-20`}>
                <item.icon className={`h-6 w-6 ${item.color} dark:text-opacity-90`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{item.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
