export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          color: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          version_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          version_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "versiones_examen"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          accion: string
          created_at: string | null
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          id: string
          ip_address: unknown
          registro_id: string | null
          tabla: string | null
          user_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          ip_address?: unknown
          registro_id?: string | null
          tabla?: string | null
          user_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string | null
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          ip_address?: unknown
          registro_id?: string | null
          tabla?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion: {
        Row: {
          clave: string
          descripcion: string | null
          tipo: string | null
          updated_at: string | null
          valor: string
        }
        Insert: {
          clave: string
          descripcion?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor: string
        }
        Update: {
          clave?: string
          descripcion?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      logros: {
        Row: {
          categoria: string | null
          codigo: string
          condicion: Json | null
          created_at: string | null
          descripcion: string | null
          icono: string | null
          id: string
          nombre: string
          puntos: number | null
        }
        Insert: {
          categoria?: string | null
          codigo: string
          condicion?: Json | null
          created_at?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre: string
          puntos?: number | null
        }
        Update: {
          categoria?: string | null
          codigo?: string
          condicion?: Json | null
          created_at?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre?: string
          puntos?: number | null
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          avatar_url: string | null
          bloqueado: boolean | null
          ciudad: string | null
          created_at: string | null
          email: string
          fecha_nacimiento: string | null
          id: string
          nombre_completo: string | null
          rol: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bloqueado?: boolean | null
          ciudad?: string | null
          created_at?: string | null
          email: string
          fecha_nacimiento?: string | null
          id: string
          nombre_completo?: string | null
          rol?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bloqueado?: boolean | null
          ciudad?: string | null
          created_at?: string | null
          email?: string
          fecha_nacimiento?: string | null
          id?: string
          nombre_completo?: string | null
          rol?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      periodos_prueba: {
        Row: {
          created_at: string | null
          fecha_fin: string
          fecha_inicio: string | null
          id: string
          usado: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fecha_fin: string
          fecha_inicio?: string | null
          id?: string
          usado?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fecha_fin: string
          fecha_inicio?: string | null
          id?: string
          usado?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "periodos_prueba_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "periodos_prueba_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planes_suscripcion: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          duracion_dias: number
          id: string
          nombre: string
          precio: number
          version_examen_id: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_dias: number
          id?: string
          nombre: string
          precio: number
          version_examen_id?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_dias?: number
          id?: string
          nombre?: string
          precio?: number
          version_examen_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planes_suscripcion_version_examen_id_fkey"
            columns: ["version_examen_id"]
            isOneToOne: false
            referencedRelation: "versiones_examen"
            referencedColumns: ["id"]
          },
        ]
      }
      preguntas: {
        Row: {
          created_at: string | null
          dificultad: string | null
          estado: string | null
          id: string
          metadata: Json | null
          opcion_a: string
          opcion_b: string
          opcion_c: string
          opcion_d: string
          pregunta_original: string
          pregunta_simplificada: string | null
          respuesta_correcta: string | null
          sustento: string
          tema_id: string | null
          tiene_formula: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dificultad?: string | null
          estado?: string | null
          id?: string
          metadata?: Json | null
          opcion_a: string
          opcion_b: string
          opcion_c: string
          opcion_d: string
          pregunta_original: string
          pregunta_simplificada?: string | null
          respuesta_correcta?: string | null
          sustento: string
          tema_id?: string | null
          tiene_formula?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dificultad?: string | null
          estado?: string | null
          id?: string
          metadata?: Json | null
          opcion_a?: string
          opcion_b?: string
          opcion_c?: string
          opcion_d?: string
          pregunta_original?: string
          pregunta_simplificada?: string | null
          respuesta_correcta?: string | null
          sustento?: string
          tema_id?: string | null
          tiene_formula?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      progreso_temas: {
        Row: {
          created_at: string | null
          id: string
          porcentaje_completado: number | null
          preguntas_correctas: number | null
          preguntas_incorrectas: number | null
          preguntas_omitidas: number | null
          preguntas_respondidas: number | null
          tema_id: string | null
          ultima_actividad: string | null
          ultima_pregunta_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          porcentaje_completado?: number | null
          preguntas_correctas?: number | null
          preguntas_incorrectas?: number | null
          preguntas_omitidas?: number | null
          preguntas_respondidas?: number | null
          tema_id?: string | null
          ultima_actividad?: string | null
          ultima_pregunta_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          porcentaje_completado?: number | null
          preguntas_correctas?: number | null
          preguntas_incorrectas?: number | null
          preguntas_omitidas?: number | null
          preguntas_respondidas?: number | null
          tema_id?: string | null
          ultima_actividad?: string | null
          ultima_pregunta_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progreso_temas_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_temas_ultima_pregunta_id_fkey"
            columns: ["ultima_pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progreso_temas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "progreso_temas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rachas: {
        Row: {
          created_at: string | null
          id: string
          racha_actual: number | null
          racha_maxima: number | null
          ultima_actividad: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          racha_actual?: number | null
          racha_maxima?: number | null
          ultima_actividad?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          racha_actual?: number | null
          racha_maxima?: number | null
          ultima_actividad?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rachas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "rachas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_soporte: {
        Row: {
          created_at: string | null
          descripcion: string
          estado: string | null
          id: string
          prioridad: string | null
          tipo: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          estado?: string | null
          id?: string
          prioridad?: string | null
          tipo: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          estado?: string | null
          id?: string
          prioridad?: string | null
          tipo?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_soporte_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reportes_soporte_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      respuestas_estudio: {
        Row: {
          created_at: string | null
          es_correcta: boolean
          id: string
          intentos: number | null
          pregunta_id: string | null
          respuesta_usuario: string | null
          tiempo_respuesta: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          es_correcta: boolean
          id?: string
          intentos?: number | null
          pregunta_id?: string | null
          respuesta_usuario?: string | null
          tiempo_respuesta?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          es_correcta?: boolean
          id?: string
          intentos?: number | null
          pregunta_id?: string | null
          respuesta_usuario?: string | null
          tiempo_respuesta?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respuestas_estudio_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respuestas_estudio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "respuestas_estudio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sesiones_activas: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          session_token: string
          ultima_actividad: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          session_token: string
          ultima_actividad?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          session_token?: string
          ultima_actividad?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_activas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sesiones_activas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacro_preguntas: {
        Row: {
          created_at: string | null
          es_correcta: boolean | null
          id: string
          orden: number
          pregunta_id: string | null
          respuesta_usuario: string | null
          simulacro_id: string | null
          tiempo_respuesta: number | null
        }
        Insert: {
          created_at?: string | null
          es_correcta?: boolean | null
          id?: string
          orden: number
          pregunta_id?: string | null
          respuesta_usuario?: string | null
          simulacro_id?: string | null
          tiempo_respuesta?: number | null
        }
        Update: {
          created_at?: string | null
          es_correcta?: boolean | null
          id?: string
          orden?: number
          pregunta_id?: string | null
          respuesta_usuario?: string | null
          simulacro_id?: string | null
          tiempo_respuesta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulacro_preguntas_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulacro_preguntas_simulacro_id_fkey"
            columns: ["simulacro_id"]
            isOneToOne: false
            referencedRelation: "simulacros"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacros: {
        Row: {
          created_at: string | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          pausas_realizadas: number | null
          percentil: number | null
          preguntas_correctas: number | null
          preguntas_incorrectas: number | null
          preguntas_omitidas: number | null
          puntaje_total: number | null
          tiempo_limite_minutos: number | null
          tiempo_usado_segundos: number | null
          updated_at: string | null
          user_id: string | null
          version_examen_id: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          pausas_realizadas?: number | null
          percentil?: number | null
          preguntas_correctas?: number | null
          preguntas_incorrectas?: number | null
          preguntas_omitidas?: number | null
          puntaje_total?: number | null
          tiempo_limite_minutos?: number | null
          tiempo_usado_segundos?: number | null
          updated_at?: string | null
          user_id?: string | null
          version_examen_id?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          pausas_realizadas?: number | null
          percentil?: number | null
          preguntas_correctas?: number | null
          preguntas_incorrectas?: number | null
          preguntas_omitidas?: number | null
          puntaje_total?: number | null
          tiempo_limite_minutos?: number | null
          tiempo_usado_segundos?: number | null
          updated_at?: string | null
          user_id?: string | null
          version_examen_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulacros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "simulacros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulacros_version_examen_id_fkey"
            columns: ["version_examen_id"]
            isOneToOne: false
            referencedRelation: "versiones_examen"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripciones: {
        Row: {
          comprobante_pago_url: string | null
          created_at: string | null
          estado: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          monto_pagado: number | null
          notas_verificacion: string | null
          plan_id: string | null
          updated_at: string | null
          user_id: string | null
          verificado_at: string | null
          verificado_por: string | null
          version_examen_id: string | null
        }
        Insert: {
          comprobante_pago_url?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          monto_pagado?: number | null
          notas_verificacion?: string | null
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verificado_at?: string | null
          verificado_por?: string | null
          version_examen_id?: string | null
        }
        Update: {
          comprobante_pago_url?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          monto_pagado?: number | null
          notas_verificacion?: string | null
          plan_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verificado_at?: string | null
          verificado_por?: string | null
          version_examen_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes_suscripcion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "suscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_verificado_por_fkey"
            columns: ["verificado_por"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "suscripciones_verificado_por_fkey"
            columns: ["verificado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_version_examen_id_fkey"
            columns: ["version_examen_id"]
            isOneToOne: false
            referencedRelation: "versiones_examen"
            referencedColumns: ["id"]
          },
        ]
      }
      temas: {
        Row: {
          area_id: string | null
          created_at: string | null
          id: string
          md_doc: string | null
          nombre: string
          orden: number
          peso_evaluacion: number | null
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          id?: string
          md_doc?: string | null
          nombre: string
          orden?: number
          peso_evaluacion?: number | null
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          id?: string
          md_doc?: string | null
          nombre?: string
          orden?: number
          peso_evaluacion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "temas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_logros: {
        Row: {
          desbloqueado_at: string | null
          id: string
          logro_id: string | null
          user_id: string | null
        }
        Insert: {
          desbloqueado_at?: string | null
          id?: string
          logro_id?: string | null
          user_id?: string | null
        }
        Update: {
          desbloqueado_at?: string | null
          id?: string
          logro_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuario_logros_logro_id_fkey"
            columns: ["logro_id"]
            isOneToOne: false
            referencedRelation: "logros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_logros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "estadisticas_usuario"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "usuario_logros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      versiones_examen: {
        Row: {
          activa: boolean | null
          año: number
          created_at: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          año: number
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          año?: number
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      distribucion_preguntas: {
        Row: {
          area: string | null
          peso_evaluacion: number | null
          preguntas_aprobadas: number | null
          tema: string | null
          total_preguntas: number | null
          version: string | null
        }
        Relationships: []
      }
      estadisticas_usuario: {
        Row: {
          logros_desbloqueados: number | null
          nombre_completo: string | null
          progreso_promedio: number | null
          puntaje_promedio_simulacros: number | null
          racha_actual: number | null
          racha_maxima: number | null
          simulacros_realizados: number | null
          temas_iniciados: number | null
          total_correctas: number | null
          total_respondidas: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_percentil: { Args: { p_simulacro_id: string }; Returns: number }
      verificar_acceso_usuario: {
        Args: { p_user_id: string }
        Returns: {
          dias_restantes: number
          tiene_acceso: boolean
          tipo_acceso: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
