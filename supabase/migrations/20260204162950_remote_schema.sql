


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."actualizar_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."actualizar_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calcular_percentil"("p_simulacro_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_puntaje DECIMAL;
    v_total_simulacros INTEGER;
    v_simulacros_menores INTEGER;
BEGIN
    SELECT puntaje_total INTO v_puntaje
    FROM simulacros WHERE id = p_simulacro_id;
    
    SELECT COUNT(*) INTO v_total_simulacros
    FROM simulacros WHERE estado = 'completado';
    
    SELECT COUNT(*) INTO v_simulacros_menores
    FROM simulacros 
    WHERE estado = 'completado' AND puntaje_total < v_puntaje;
    
    IF v_total_simulacros > 0 THEN
        RETURN (v_simulacros_menores::DECIMAL / v_total_simulacros * 100);
    ELSE
        RETURN 50.0;
    END IF;
END;
$$;


ALTER FUNCTION "public"."calcular_percentil"("p_simulacro_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Insertar en perfiles
  INSERT INTO public.perfiles (id, email, nombre_completo, rol)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'estudiante'
  );

  -- Insertar en periodo de prueba (24 horas)
  INSERT INTO public.periodos_prueba (user_id, fecha_fin)
  VALUES (
    new.id,
    now() + interval '24 hours'
  );

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM perfiles
    WHERE id = auth.uid()
    AND rol = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verificar_acceso_usuario"("p_user_id" "uuid") RETURNS TABLE("tiene_acceso" boolean, "tipo_acceso" character varying, "dias_restantes" integer)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_perfil RECORD;
    v_periodo_prueba RECORD;
    v_suscripcion RECORD;
    v_sistema_activo BOOLEAN;
BEGIN
    -- 1. Verificar si el usuario existe y si está bloqueado
    SELECT * INTO v_perfil FROM perfiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'usuario_no_encontrado'::VARCHAR, 0;
        RETURN;
    END IF;

    IF v_perfil.bloqueado THEN
        RETURN QUERY SELECT false, 'bloqueado'::VARCHAR, 0;
        RETURN;
    END IF;

    -- 2. Verificar si el sistema de suscripciones está activo globalmente
    -- Si no está activo (false), se otorga acceso libre.
    SELECT (valor = 'true') INTO v_sistema_activo 
    FROM configuracion 
    WHERE clave = 'sistema_suscripciones_activo';

    IF v_sistema_activo IS NOT TRUE THEN
        -- Retornamos un valor alto de días para que la UI muestre acceso ilimitado/prolongado
        RETURN QUERY SELECT true, 'acceso_libre'::VARCHAR, 365;
        RETURN;
    END IF;

    -- 3. Verificar período de prueba
    SELECT * INTO v_periodo_prueba
    FROM periodos_prueba
    WHERE user_id = p_user_id AND fecha_fin > NOW();
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            true,
            'prueba'::VARCHAR,
            EXTRACT(DAY FROM v_periodo_prueba.fecha_fin - NOW())::INTEGER;
        RETURN;
    END IF;
    
    -- 4. Verificar suscripción activa
    SELECT * INTO v_suscripcion
    FROM suscripciones
    WHERE user_id = p_user_id 
    AND estado = 'activa' 
    AND fecha_fin > NOW()
    ORDER BY fecha_fin DESC
    LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            true,
            'suscripcion'::VARCHAR,
            EXTRACT(DAY FROM v_suscripcion.fecha_fin - NOW())::INTEGER;
        RETURN;
    END IF;
    
    -- 5. Sin acceso
    RETURN QUERY SELECT false, 'sin_acceso'::VARCHAR, 0;
END;
$$;


ALTER FUNCTION "public"."verificar_acceso_usuario"("p_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."areas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "version_id" "uuid",
    "nombre" character varying(100) NOT NULL,
    "descripcion" "text",
    "orden" integer DEFAULT 0 NOT NULL,
    "color" character varying(7),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."areas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "accion" character varying(100) NOT NULL,
    "tabla" character varying(50),
    "registro_id" "uuid",
    "datos_anteriores" "jsonb",
    "datos_nuevos" "jsonb",
    "ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."configuracion" (
    "clave" character varying(100) NOT NULL,
    "valor" "text" NOT NULL,
    "tipo" character varying(20),
    "descripcion" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "configuracion_tipo_check" CHECK ((("tipo")::"text" = ANY ((ARRAY['string'::character varying, 'integer'::character varying, 'boolean'::character varying, 'json'::character varying])::"text"[])))
);


ALTER TABLE "public"."configuracion" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."distribucion_preguntas" AS
SELECT
    NULL::character varying(100) AS "version",
    NULL::character varying(100) AS "area",
    NULL::character varying(200) AS "tema",
    NULL::bigint AS "total_preguntas",
    NULL::numeric(5,2) AS "peso_evaluacion",
    NULL::bigint AS "preguntas_aprobadas";


ALTER VIEW "public"."distribucion_preguntas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfiles" (
    "id" "uuid" NOT NULL,
    "nombre_completo" character varying(200),
    "email" character varying(255) NOT NULL,
    "telefono" character varying(20),
    "avatar_url" "text",
    "fecha_nacimiento" "date",
    "ciudad" character varying(100),
    "rol" character varying(20) DEFAULT 'estudiante'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bloqueado" boolean DEFAULT false,
    CONSTRAINT "perfiles_rol_check" CHECK ((("rol")::"text" = ANY ((ARRAY['estudiante'::character varying, 'admin'::character varying])::"text"[])))
);


ALTER TABLE "public"."perfiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."progreso_temas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "tema_id" "uuid",
    "preguntas_respondidas" integer DEFAULT 0,
    "preguntas_correctas" integer DEFAULT 0,
    "preguntas_incorrectas" integer DEFAULT 0,
    "preguntas_omitidas" integer DEFAULT 0,
    "porcentaje_completado" numeric(5,2) DEFAULT 0,
    "ultima_pregunta_id" "uuid",
    "ultima_actividad" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."progreso_temas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rachas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "racha_actual" integer DEFAULT 0,
    "racha_maxima" integer DEFAULT 0,
    "ultima_actividad" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rachas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."simulacros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "version_examen_id" "uuid",
    "estado" character varying(20) DEFAULT 'en_progreso'::character varying,
    "fecha_inicio" timestamp with time zone DEFAULT "now"(),
    "fecha_fin" timestamp with time zone,
    "tiempo_limite_minutos" integer DEFAULT 120,
    "tiempo_usado_segundos" integer DEFAULT 0,
    "pausas_realizadas" integer DEFAULT 0,
    "puntaje_total" numeric(5,2),
    "preguntas_correctas" integer DEFAULT 0,
    "preguntas_incorrectas" integer DEFAULT 0,
    "preguntas_omitidas" integer DEFAULT 0,
    "percentil" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "simulacros_estado_check" CHECK ((("estado")::"text" = ANY ((ARRAY['en_progreso'::character varying, 'pausado'::character varying, 'completado'::character varying, 'abandonado'::character varying])::"text"[])))
);


ALTER TABLE "public"."simulacros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuario_logros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "logro_id" "uuid",
    "desbloqueado_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usuario_logros" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."estadisticas_usuario" WITH ("security_invoker"='true') AS
 SELECT "p"."id" AS "user_id",
    "p"."nombre_completo",
    "count"(DISTINCT "pt"."tema_id") AS "temas_iniciados",
    "avg"("pt"."porcentaje_completado") AS "progreso_promedio",
    "sum"("pt"."preguntas_correctas") AS "total_correctas",
    "sum"("pt"."preguntas_respondidas") AS "total_respondidas",
    "count"(DISTINCT "s"."id") AS "simulacros_realizados",
    "avg"("s"."puntaje_total") AS "puntaje_promedio_simulacros",
    "r"."racha_actual",
    "r"."racha_maxima",
    "count"(DISTINCT "ul"."logro_id") AS "logros_desbloqueados"
   FROM (((("public"."perfiles" "p"
     LEFT JOIN "public"."progreso_temas" "pt" ON (("p"."id" = "pt"."user_id")))
     LEFT JOIN "public"."simulacros" "s" ON ((("p"."id" = "s"."user_id") AND (("s"."estado")::"text" = 'completado'::"text"))))
     LEFT JOIN "public"."rachas" "r" ON (("p"."id" = "r"."user_id")))
     LEFT JOIN "public"."usuario_logros" "ul" ON (("p"."id" = "ul"."user_id")))
  GROUP BY "p"."id", "p"."nombre_completo", "r"."racha_actual", "r"."racha_maxima";


ALTER VIEW "public"."estadisticas_usuario" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."logros" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "codigo" character varying(50) NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "descripcion" "text",
    "icono" character varying(50),
    "categoria" character varying(50),
    "condicion" "jsonb",
    "puntos" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "logros_categoria_check" CHECK ((("categoria")::"text" = ANY ((ARRAY['estudio'::character varying, 'evaluacion'::character varying, 'racha'::character varying, 'maestria'::character varying])::"text"[])))
);


ALTER TABLE "public"."logros" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."periodos_prueba" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "fecha_inicio" timestamp with time zone DEFAULT "now"(),
    "fecha_fin" timestamp with time zone NOT NULL,
    "usado" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."periodos_prueba" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planes_suscripcion" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "descripcion" "text",
    "precio" numeric(10,2) NOT NULL,
    "duracion_dias" integer NOT NULL,
    "version_examen_id" "uuid",
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."planes_suscripcion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."preguntas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tema_id" "uuid",
    "pregunta_original" "text" NOT NULL,
    "pregunta_simplificada" "text",
    "sustento" "text" NOT NULL,
    "opcion_a" "text" NOT NULL,
    "opcion_b" "text" NOT NULL,
    "opcion_c" "text" NOT NULL,
    "opcion_d" "text" NOT NULL,
    "respuesta_correcta" character(1),
    "dificultad" character varying(20),
    "tiene_formula" boolean DEFAULT false,
    "estado" character varying(20) DEFAULT 'pendiente_revision'::character varying,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "preguntas_dificultad_check" CHECK ((("dificultad")::"text" = ANY ((ARRAY['facil'::character varying, 'medio'::character varying, 'dificil'::character varying])::"text"[]))),
    CONSTRAINT "preguntas_estado_check" CHECK ((("estado")::"text" = ANY ((ARRAY['pendiente_revision'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::"text"[]))),
    CONSTRAINT "preguntas_respuesta_correcta_check" CHECK (("respuesta_correcta" = ANY (ARRAY['A'::"bpchar", 'B'::"bpchar", 'C'::"bpchar", 'D'::"bpchar"])))
);


ALTER TABLE "public"."preguntas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reportes_soporte" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "tipo" "text" NOT NULL,
    "titulo" "text" NOT NULL,
    "descripcion" "text" NOT NULL,
    "prioridad" "text" DEFAULT 'media'::"text",
    "estado" "text" DEFAULT 'pendiente'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reportes_soporte_estado_check" CHECK (("estado" = ANY (ARRAY['pendiente'::"text", 'en_revision'::"text", 'resuelto'::"text"]))),
    CONSTRAINT "reportes_soporte_prioridad_check" CHECK (("prioridad" = ANY (ARRAY['baja'::"text", 'media'::"text", 'alta'::"text"]))),
    CONSTRAINT "reportes_soporte_tipo_check" CHECK (("tipo" = ANY (ARRAY['sugerencia'::"text", 'error'::"text", 'soporte'::"text"])))
);


ALTER TABLE "public"."reportes_soporte" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."respuestas_estudio" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "pregunta_id" "uuid",
    "respuesta_usuario" character(1),
    "es_correcta" boolean NOT NULL,
    "tiempo_respuesta" integer,
    "intentos" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "respuestas_estudio_respuesta_usuario_check" CHECK (("respuesta_usuario" = ANY (ARRAY['A'::"bpchar", 'B'::"bpchar", 'C'::"bpchar", 'D'::"bpchar", 'X'::"bpchar"])))
);


ALTER TABLE "public"."respuestas_estudio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sesiones_activas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "session_token" "text" NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "ultima_actividad" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sesiones_activas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."simulacro_preguntas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "simulacro_id" "uuid",
    "pregunta_id" "uuid",
    "orden" integer NOT NULL,
    "respuesta_usuario" character(1),
    "es_correcta" boolean,
    "tiempo_respuesta" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "simulacro_preguntas_respuesta_usuario_check" CHECK (("respuesta_usuario" = ANY (ARRAY['A'::"bpchar", 'B'::"bpchar", 'C'::"bpchar", 'D'::"bpchar", 'X'::"bpchar"])))
);


ALTER TABLE "public"."simulacro_preguntas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suscripciones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "plan_id" "uuid",
    "version_examen_id" "uuid",
    "fecha_inicio" timestamp with time zone NOT NULL,
    "fecha_fin" timestamp with time zone NOT NULL,
    "estado" character varying(20) DEFAULT 'pendiente'::character varying,
    "comprobante_pago_url" "text",
    "monto_pagado" numeric(10,2),
    "verificado_por" "uuid",
    "verificado_at" timestamp with time zone,
    "notas_verificacion" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "suscripciones_estado_check" CHECK ((("estado")::"text" = ANY ((ARRAY['pendiente'::character varying, 'activa'::character varying, 'expirada'::character varying, 'cancelada'::character varying])::"text"[])))
);


ALTER TABLE "public"."suscripciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."temas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "area_id" "uuid",
    "nombre" character varying(200) NOT NULL,
    "md_doc" "text",
    "orden" integer DEFAULT 0 NOT NULL,
    "peso_evaluacion" numeric(5,2) DEFAULT 1.0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."temas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."versiones_examen" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "año" integer NOT NULL,
    "descripcion" "text",
    "fecha_inicio" "date" NOT NULL,
    "fecha_fin" "date",
    "activa" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."versiones_examen" OWNER TO "postgres";


ALTER TABLE ONLY "public"."areas"
    ADD CONSTRAINT "areas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."areas"
    ADD CONSTRAINT "areas_version_id_nombre_key" UNIQUE ("version_id", "nombre");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."configuracion"
    ADD CONSTRAINT "configuracion_pkey" PRIMARY KEY ("clave");



ALTER TABLE ONLY "public"."logros"
    ADD CONSTRAINT "logros_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."logros"
    ADD CONSTRAINT "logros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."periodos_prueba"
    ADD CONSTRAINT "periodos_prueba_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."periodos_prueba"
    ADD CONSTRAINT "periodos_prueba_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."planes_suscripcion"
    ADD CONSTRAINT "planes_suscripcion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."preguntas"
    ADD CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progreso_temas"
    ADD CONSTRAINT "progreso_temas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progreso_temas"
    ADD CONSTRAINT "progreso_temas_user_id_tema_id_key" UNIQUE ("user_id", "tema_id");



ALTER TABLE ONLY "public"."rachas"
    ADD CONSTRAINT "rachas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rachas"
    ADD CONSTRAINT "rachas_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."reportes_soporte"
    ADD CONSTRAINT "reportes_soporte_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."respuestas_estudio"
    ADD CONSTRAINT "respuestas_estudio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sesiones_activas"
    ADD CONSTRAINT "sesiones_activas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sesiones_activas"
    ADD CONSTRAINT "sesiones_activas_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."simulacro_preguntas"
    ADD CONSTRAINT "simulacro_preguntas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."simulacro_preguntas"
    ADD CONSTRAINT "simulacro_preguntas_simulacro_id_pregunta_id_key" UNIQUE ("simulacro_id", "pregunta_id");



ALTER TABLE ONLY "public"."simulacros"
    ADD CONSTRAINT "simulacros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suscripciones"
    ADD CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."temas"
    ADD CONSTRAINT "temas_area_id_nombre_key" UNIQUE ("area_id", "nombre");



ALTER TABLE ONLY "public"."temas"
    ADD CONSTRAINT "temas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuario_logros"
    ADD CONSTRAINT "usuario_logros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuario_logros"
    ADD CONSTRAINT "usuario_logros_user_id_logro_id_key" UNIQUE ("user_id", "logro_id");



ALTER TABLE ONLY "public"."versiones_examen"
    ADD CONSTRAINT "versiones_examen_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_areas_version" ON "public"."areas" USING "btree" ("version_id");



CREATE INDEX "idx_audit_fecha" ON "public"."audit_log" USING "btree" ("created_at");



CREATE INDEX "idx_audit_user" ON "public"."audit_log" USING "btree" ("user_id");



CREATE INDEX "idx_preguntas_estado" ON "public"."preguntas" USING "btree" ("estado");



CREATE INDEX "idx_preguntas_tema" ON "public"."preguntas" USING "btree" ("tema_id");



CREATE INDEX "idx_progreso_user" ON "public"."progreso_temas" USING "btree" ("user_id");



CREATE INDEX "idx_respuestas_user" ON "public"."respuestas_estudio" USING "btree" ("user_id");



CREATE INDEX "idx_sesiones_user" ON "public"."sesiones_activas" USING "btree" ("user_id");



CREATE INDEX "idx_simulacros_estado" ON "public"."simulacros" USING "btree" ("estado");



CREATE INDEX "idx_simulacros_user" ON "public"."simulacros" USING "btree" ("user_id");



CREATE INDEX "idx_suscripciones_estado" ON "public"."suscripciones" USING "btree" ("estado");



CREATE INDEX "idx_suscripciones_user" ON "public"."suscripciones" USING "btree" ("user_id");



CREATE INDEX "idx_temas_area" ON "public"."temas" USING "btree" ("area_id");



CREATE OR REPLACE VIEW "public"."distribucion_preguntas" WITH ("security_invoker"='true') AS
 SELECT "v"."nombre" AS "version",
    "a"."nombre" AS "area",
    "t"."nombre" AS "tema",
    "count"("p"."id") AS "total_preguntas",
    "t"."peso_evaluacion",
    "count"(
        CASE
            WHEN (("p"."estado")::"text" = 'aprobada'::"text") THEN 1
            ELSE NULL::integer
        END) AS "preguntas_aprobadas"
   FROM ((("public"."versiones_examen" "v"
     JOIN "public"."areas" "a" ON (("v"."id" = "a"."version_id")))
     JOIN "public"."temas" "t" ON (("a"."id" = "t"."area_id")))
     LEFT JOIN "public"."preguntas" "p" ON (("t"."id" = "p"."tema_id")))
  GROUP BY "v"."id", "v"."nombre", "a"."id", "a"."nombre", "t"."id", "t"."nombre", "t"."peso_evaluacion"
  ORDER BY "v"."nombre", "a"."orden", "t"."orden";



CREATE OR REPLACE TRIGGER "trigger_actualizar_perfiles" BEFORE UPDATE ON "public"."perfiles" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_actualizar_preguntas" BEFORE UPDATE ON "public"."preguntas" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_actualizar_progreso" BEFORE UPDATE ON "public"."progreso_temas" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_actualizar_suscripciones" BEFORE UPDATE ON "public"."suscripciones" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_timestamp"();



ALTER TABLE ONLY "public"."areas"
    ADD CONSTRAINT "areas_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."versiones_examen"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."periodos_prueba"
    ADD CONSTRAINT "periodos_prueba_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."planes_suscripcion"
    ADD CONSTRAINT "planes_suscripcion_version_examen_id_fkey" FOREIGN KEY ("version_examen_id") REFERENCES "public"."versiones_examen"("id");



ALTER TABLE ONLY "public"."preguntas"
    ADD CONSTRAINT "preguntas_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "public"."temas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."progreso_temas"
    ADD CONSTRAINT "progreso_temas_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "public"."temas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."progreso_temas"
    ADD CONSTRAINT "progreso_temas_ultima_pregunta_id_fkey" FOREIGN KEY ("ultima_pregunta_id") REFERENCES "public"."preguntas"("id");



ALTER TABLE ONLY "public"."progreso_temas"
    ADD CONSTRAINT "progreso_temas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rachas"
    ADD CONSTRAINT "rachas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reportes_soporte"
    ADD CONSTRAINT "reportes_soporte_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."respuestas_estudio"
    ADD CONSTRAINT "respuestas_estudio_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "public"."preguntas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."respuestas_estudio"
    ADD CONSTRAINT "respuestas_estudio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sesiones_activas"
    ADD CONSTRAINT "sesiones_activas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."simulacro_preguntas"
    ADD CONSTRAINT "simulacro_preguntas_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "public"."preguntas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."simulacro_preguntas"
    ADD CONSTRAINT "simulacro_preguntas_simulacro_id_fkey" FOREIGN KEY ("simulacro_id") REFERENCES "public"."simulacros"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."simulacros"
    ADD CONSTRAINT "simulacros_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."simulacros"
    ADD CONSTRAINT "simulacros_version_examen_id_fkey" FOREIGN KEY ("version_examen_id") REFERENCES "public"."versiones_examen"("id");



ALTER TABLE ONLY "public"."suscripciones"
    ADD CONSTRAINT "suscripciones_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."planes_suscripcion"("id");



ALTER TABLE ONLY "public"."suscripciones"
    ADD CONSTRAINT "suscripciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suscripciones"
    ADD CONSTRAINT "suscripciones_verificado_por_fkey" FOREIGN KEY ("verificado_por") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."suscripciones"
    ADD CONSTRAINT "suscripciones_version_examen_id_fkey" FOREIGN KEY ("version_examen_id") REFERENCES "public"."versiones_examen"("id");



ALTER TABLE ONLY "public"."temas"
    ADD CONSTRAINT "temas_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuario_logros"
    ADD CONSTRAINT "usuario_logros_logro_id_fkey" FOREIGN KEY ("logro_id") REFERENCES "public"."logros"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuario_logros"
    ADD CONSTRAINT "usuario_logros_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



CREATE POLICY "Acceso actualizacion perfiles" ON "public"."perfiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Acceso borrado perfiles" ON "public"."perfiles" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Acceso insercion perfiles" ON "public"."perfiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Acceso lectura perfiles" ON "public"."perfiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Admin editar todas" ON "public"."suscripciones" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admin ver todas" ON "public"."suscripciones" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins pueden actualizar configuracion" ON "public"."configuracion" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."perfiles"
  WHERE (("perfiles"."id" = "auth"."uid"()) AND (("perfiles"."rol")::"text" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."perfiles"
  WHERE (("perfiles"."id" = "auth"."uid"()) AND (("perfiles"."rol")::"text" = 'admin'::"text")))));



CREATE POLICY "Crear propias" ON "public"."suscripciones" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Gestionar propia racha" ON "public"."rachas" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Gestionar propias sesiones" ON "public"."sesiones_activas" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Insertar audit propio" ON "public"."audit_log" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Insertar propios logros" ON "public"."usuario_logros" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Lectura autenticada areas" ON "public"."areas" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Lectura autenticada config" ON "public"."configuracion" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Lectura autenticada logros_def" ON "public"."logros" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Lectura autenticada planes" ON "public"."planes_suscripcion" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Lectura autenticada preguntas" ON "public"."preguntas" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Lectura autenticada temas" ON "public"."temas" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Lectura autenticada versiones" ON "public"."versiones_examen" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Los admins pueden ver todos los reportes" ON "public"."reportes_soporte" USING ((EXISTS ( SELECT 1
   FROM "public"."perfiles"
  WHERE (("perfiles"."id" = "auth"."uid"()) AND (("perfiles"."rol")::"text" = 'admin'::"text")))));



CREATE POLICY "Los usuarios pueden crear sus propios reportes" ON "public"."reportes_soporte" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Los usuarios pueden ver sus propios reportes" ON "public"."reportes_soporte" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Perfil - Acceso Admin" ON "public"."perfiles" USING ("public"."is_admin"());



CREATE POLICY "Perfil - Acceso Individual" ON "public"."perfiles" USING (("auth"."uid"() = "id"));



CREATE POLICY "Suscripciones - Acceso Admin" ON "public"."suscripciones" USING ("public"."is_admin"());



CREATE POLICY "Suscripciones - Acceso Individual" ON "public"."suscripciones" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Suscripciones - Insertar Propia" ON "public"."suscripciones" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden actualizar su propio progreso" ON "public"."progreso_temas" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden actualizar sus simulacros" ON "public"."simulacros" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden crear simulacros" ON "public"."simulacros" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden crear su progreso" ON "public"."progreso_temas" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden iniciar su periodo de prueba" ON "public"."periodos_prueba" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden insertar preguntas en sus simulacros" ON "public"."simulacro_preguntas" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."simulacros" "s"
  WHERE (("s"."id" = "simulacro_preguntas"."simulacro_id") AND ("s"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Usuarios pueden registrar sus respuestas" ON "public"."respuestas_estudio" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden responder en sus simulacros" ON "public"."simulacro_preguntas" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."simulacros" "s"
  WHERE (("s"."id" = "simulacro_preguntas"."simulacro_id") AND ("s"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Usuarios pueden ver preguntas de sus simulacros" ON "public"."simulacro_preguntas" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."simulacros" "s"
  WHERE (("s"."id" = "simulacro_preguntas"."simulacro_id") AND ("s"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Usuarios pueden ver su periodo de prueba" ON "public"."periodos_prueba" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden ver su propio progreso" ON "public"."progreso_temas" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden ver sus respuestas" ON "public"."respuestas_estudio" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Usuarios pueden ver sus simulacros" ON "public"."simulacros" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Ver propias" ON "public"."suscripciones" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Ver propios logros" ON "public"."usuario_logros" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."areas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."configuracion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."logros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."perfiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."periodos_prueba" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."planes_suscripcion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."preguntas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."progreso_temas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rachas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reportes_soporte" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."respuestas_estudio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sesiones_activas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."simulacro_preguntas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."simulacros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suscripciones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."temas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usuario_logros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."versiones_examen" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."actualizar_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."actualizar_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."actualizar_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calcular_percentil"("p_simulacro_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_percentil"("p_simulacro_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_percentil"("p_simulacro_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verificar_acceso_usuario"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."verificar_acceso_usuario"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verificar_acceso_usuario"("p_user_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."areas" TO "anon";
GRANT ALL ON TABLE "public"."areas" TO "authenticated";
GRANT ALL ON TABLE "public"."areas" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."configuracion" TO "anon";
GRANT ALL ON TABLE "public"."configuracion" TO "authenticated";
GRANT ALL ON TABLE "public"."configuracion" TO "service_role";



GRANT ALL ON TABLE "public"."distribucion_preguntas" TO "anon";
GRANT ALL ON TABLE "public"."distribucion_preguntas" TO "authenticated";
GRANT ALL ON TABLE "public"."distribucion_preguntas" TO "service_role";



GRANT ALL ON TABLE "public"."perfiles" TO "anon";
GRANT ALL ON TABLE "public"."perfiles" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles" TO "service_role";



GRANT ALL ON TABLE "public"."progreso_temas" TO "anon";
GRANT ALL ON TABLE "public"."progreso_temas" TO "authenticated";
GRANT ALL ON TABLE "public"."progreso_temas" TO "service_role";



GRANT ALL ON TABLE "public"."rachas" TO "anon";
GRANT ALL ON TABLE "public"."rachas" TO "authenticated";
GRANT ALL ON TABLE "public"."rachas" TO "service_role";



GRANT ALL ON TABLE "public"."simulacros" TO "anon";
GRANT ALL ON TABLE "public"."simulacros" TO "authenticated";
GRANT ALL ON TABLE "public"."simulacros" TO "service_role";



GRANT ALL ON TABLE "public"."usuario_logros" TO "anon";
GRANT ALL ON TABLE "public"."usuario_logros" TO "authenticated";
GRANT ALL ON TABLE "public"."usuario_logros" TO "service_role";



GRANT ALL ON TABLE "public"."estadisticas_usuario" TO "anon";
GRANT ALL ON TABLE "public"."estadisticas_usuario" TO "authenticated";
GRANT ALL ON TABLE "public"."estadisticas_usuario" TO "service_role";



GRANT ALL ON TABLE "public"."logros" TO "anon";
GRANT ALL ON TABLE "public"."logros" TO "authenticated";
GRANT ALL ON TABLE "public"."logros" TO "service_role";



GRANT ALL ON TABLE "public"."periodos_prueba" TO "anon";
GRANT ALL ON TABLE "public"."periodos_prueba" TO "authenticated";
GRANT ALL ON TABLE "public"."periodos_prueba" TO "service_role";



GRANT ALL ON TABLE "public"."planes_suscripcion" TO "anon";
GRANT ALL ON TABLE "public"."planes_suscripcion" TO "authenticated";
GRANT ALL ON TABLE "public"."planes_suscripcion" TO "service_role";



GRANT ALL ON TABLE "public"."preguntas" TO "anon";
GRANT ALL ON TABLE "public"."preguntas" TO "authenticated";
GRANT ALL ON TABLE "public"."preguntas" TO "service_role";



GRANT ALL ON TABLE "public"."reportes_soporte" TO "anon";
GRANT ALL ON TABLE "public"."reportes_soporte" TO "authenticated";
GRANT ALL ON TABLE "public"."reportes_soporte" TO "service_role";



GRANT ALL ON TABLE "public"."respuestas_estudio" TO "anon";
GRANT ALL ON TABLE "public"."respuestas_estudio" TO "authenticated";
GRANT ALL ON TABLE "public"."respuestas_estudio" TO "service_role";



GRANT ALL ON TABLE "public"."sesiones_activas" TO "anon";
GRANT ALL ON TABLE "public"."sesiones_activas" TO "authenticated";
GRANT ALL ON TABLE "public"."sesiones_activas" TO "service_role";



GRANT ALL ON TABLE "public"."simulacro_preguntas" TO "anon";
GRANT ALL ON TABLE "public"."simulacro_preguntas" TO "authenticated";
GRANT ALL ON TABLE "public"."simulacro_preguntas" TO "service_role";



GRANT ALL ON TABLE "public"."suscripciones" TO "anon";
GRANT ALL ON TABLE "public"."suscripciones" TO "authenticated";
GRANT ALL ON TABLE "public"."suscripciones" TO "service_role";



GRANT ALL ON TABLE "public"."temas" TO "anon";
GRANT ALL ON TABLE "public"."temas" TO "authenticated";
GRANT ALL ON TABLE "public"."temas" TO "service_role";



GRANT ALL ON TABLE "public"."versiones_examen" TO "anon";
GRANT ALL ON TABLE "public"."versiones_examen" TO "authenticated";
GRANT ALL ON TABLE "public"."versiones_examen" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

alter table "public"."configuracion" drop constraint "configuracion_tipo_check";

alter table "public"."logros" drop constraint "logros_categoria_check";

alter table "public"."perfiles" drop constraint "perfiles_rol_check";

alter table "public"."preguntas" drop constraint "preguntas_dificultad_check";

alter table "public"."preguntas" drop constraint "preguntas_estado_check";

alter table "public"."simulacros" drop constraint "simulacros_estado_check";

alter table "public"."suscripciones" drop constraint "suscripciones_estado_check";

alter table "public"."configuracion" add constraint "configuracion_tipo_check" CHECK (((tipo)::text = ANY ((ARRAY['string'::character varying, 'integer'::character varying, 'boolean'::character varying, 'json'::character varying])::text[]))) not valid;

alter table "public"."configuracion" validate constraint "configuracion_tipo_check";

alter table "public"."logros" add constraint "logros_categoria_check" CHECK (((categoria)::text = ANY ((ARRAY['estudio'::character varying, 'evaluacion'::character varying, 'racha'::character varying, 'maestria'::character varying])::text[]))) not valid;

alter table "public"."logros" validate constraint "logros_categoria_check";

alter table "public"."perfiles" add constraint "perfiles_rol_check" CHECK (((rol)::text = ANY ((ARRAY['estudiante'::character varying, 'admin'::character varying])::text[]))) not valid;

alter table "public"."perfiles" validate constraint "perfiles_rol_check";

alter table "public"."preguntas" add constraint "preguntas_dificultad_check" CHECK (((dificultad)::text = ANY ((ARRAY['facil'::character varying, 'medio'::character varying, 'dificil'::character varying])::text[]))) not valid;

alter table "public"."preguntas" validate constraint "preguntas_dificultad_check";

alter table "public"."preguntas" add constraint "preguntas_estado_check" CHECK (((estado)::text = ANY ((ARRAY['pendiente_revision'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[]))) not valid;

alter table "public"."preguntas" validate constraint "preguntas_estado_check";

alter table "public"."simulacros" add constraint "simulacros_estado_check" CHECK (((estado)::text = ANY ((ARRAY['en_progreso'::character varying, 'pausado'::character varying, 'completado'::character varying, 'abandonado'::character varying])::text[]))) not valid;

alter table "public"."simulacros" validate constraint "simulacros_estado_check";

alter table "public"."suscripciones" add constraint "suscripciones_estado_check" CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'activa'::character varying, 'expirada'::character varying, 'cancelada'::character varying])::text[]))) not valid;

alter table "public"."suscripciones" validate constraint "suscripciones_estado_check";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Cualquiera autenticado puede ver avatares 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "Usuarios pueden subir comprobantes"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'comprobantes'::text) AND (auth.uid() = owner)));



  create policy "Usuarios pueden subir y editar su propio avatar 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuarios pueden subir y editar su propio avatar 1oj01fe_1"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuarios pueden subir y editar su propio avatar 1oj01fe_2"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuarios pueden subir y editar su propio avatar 1oj01fe_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Usuarios pueden ver sus comprobantes"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'comprobantes'::text) AND (auth.uid() = owner)));



