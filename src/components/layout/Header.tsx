'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuthStore } from '@/stores/authStore'
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const { user, profile } = useAuthStore()

  // Calcular iniciales
  const getInitials = () => {
    const name = profile?.nombre_completo || user?.user_metadata?.full_name || user?.email || 'U'
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Sistema de Evaluación 2026
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Versión Beta 0.1
          </div>
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.nombre_completo} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}