'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trophy, Medal, User } from 'lucide-react'

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Ranking de Estudiantes</h1>
        <p className="text-gray-500">Compite con otros estudiantes y mide tu nivel.</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> Top 10 Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-yellow-50 rounded-full">
              <Medal className="h-12 w-12 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold">¡Próximamente!</h3>
            <p className="text-gray-500 max-w-md">
              Estamos calculando los puntajes globales. Sigue practicando para aparecer en la cima de la tabla cuando se lance esta funcionalidad.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
