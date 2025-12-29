"use client"

import * as React from "react"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  CreditCard,
  Trophy,
  ShieldCheck,
  Users
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/authStore"
import { useAcceso } from "@/hooks/useAcceso"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile } = useAuthStore()
  const { data: acceso } = useAcceso()

  // Determinar la etiqueta del plan
  let planLabel = "Cargando..."
  if (acceso) {
    if (acceso.tipo_acceso === 'suscripcion') planLabel = "Premium"
    else if (acceso.tipo_acceso === 'prueba') planLabel = `Prueba (${acceso.dias_restantes} días)`
    else planLabel = "Gratis"
  }

  const isAdmin = profile?.rol === 'admin'

  const data = {
    user: {
      name: profile?.nombre_completo || user?.user_metadata?.full_name || "Estudiante",
      email: user?.email || "estudiante@quizapp.com",
      avatar: profile?.avatar_url || undefined,
    },
    teams: [
      {
        name: "QuizApp 2026",
        logo: GraduationCap,
        plan: isAdmin ? "Administrador" : planLabel,
      },
    ],
    navMain: [
      {
        title: "Inicio",
        url: "/inicio",
        icon: LayoutDashboard,
      },
      {
        title: "Modo Estudio",
        url: "/estudio",
        icon: BookOpen,
      },
      {
        title: "Evaluación",
        url: "/evaluacion",
        icon: Trophy,
      },
      {
        title: "Suscripción",
        url: "/suscripcion",
        icon: CreditCard,
      },
      {
        title: "Ranking",
        url: "/ranking",
        icon: Trophy,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* Sección Admin (Restaurada) */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Panel General">
                  <Link href="/admin">
                    <ShieldCheck />
                    <span>Panel General</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Suscripciones">
                  <Link href="/admin/suscripciones">
                    <Users />
                    <span>Suscripciones</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Gestión de Usuarios">
                  <Link href="/admin/usuarios">
                    <Users />
                    <span>Usuarios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
