-- ============================================
-- SCHEMA COMPLETO - SISTEMA DE EVALUACIÓN
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. CONTENIDO EDUCATIVO (Versionado)
-- ============================================

-- Versiones del banco de preguntas
CREATE TABLE versiones_examen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL, -- "Examen 2026", "Examen 2027"
    año INTEGER NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE, -- Null si es la versión activa
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Áreas de conocimiento
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES versiones_examen(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7), -- HEX color para UI
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(version_id, nombre)
);

-- Temas por área
CREATE TABLE temas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    md_doc TEXT, -- Material de estudio en Markdown
    orden INTEGER NOT NULL DEFAULT 0,
    peso_evaluacion DECIMAL(5,2) DEFAULT 1.0, -- Peso para distribución en simulacros
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(area_id, nombre)
);

-- Preguntas
CREATE TABLE preguntas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
    pregunta_original TEXT NOT NULL, -- Pregunta extraída del PDF
    pregunta_simplificada TEXT, -- Versión generada por LLM
    sustento TEXT NOT NULL, -- Explicación detallada
    opcion_a TEXT NOT NULL,
    opcion_b TEXT NOT NULL,
    opcion_c TEXT NOT NULL,
    opcion_d TEXT NOT NULL,
    respuesta_correcta CHAR(1) CHECK (respuesta_correcta IN ('A', 'B', 'C', 'D')),
    dificultad VARCHAR(20) CHECK (dificultad IN ('facil', 'medio', 'dificil')),
    tiene_formula BOOLEAN DEFAULT false,
    estado VARCHAR(20) DEFAULT 'pendiente_revision' CHECK (estado IN ('pendiente_revision', 'aprobada', 'rechazada')),
    metadata JSONB, -- Para datos adicionales del LLM
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_preguntas_tema ON preguntas(tema_id);
CREATE INDEX idx_preguntas_estado ON preguntas(estado);
CREATE INDEX idx_temas_area ON temas(area_id);
CREATE INDEX idx_areas_version ON areas(version_id);

-- ============================================
-- 2. GESTIÓN DE USUARIOS Y SUSCRIPCIONES
-- ============================================

-- Perfiles de usuario (extendiendo auth.users de Supabase)
CREATE TABLE perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    avatar_url TEXT,
    fecha_nacimiento DATE,
    ciudad VARCHAR(100),
    rol VARCHAR(20) DEFAULT 'estudiante' CHECK (rol IN ('estudiante', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de suscripción
CREATE TABLE planes_suscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    duracion_dias INTEGER NOT NULL, -- 30, 90, 365
    version_examen_id UUID REFERENCES versiones_examen(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suscripciones de usuarios
CREATE TABLE suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES planes_suscripcion(id),
    version_examen_id UUID REFERENCES versiones_examen(id),
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'expirada', 'cancelada')),
    comprobante_pago_url TEXT, -- URL del comprobante subido
    monto_pagado DECIMAL(10,2),
    verificado_por UUID REFERENCES perfiles(id), -- Admin que verificó
    verificado_at TIMESTAMPTZ,
    notas_verificacion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Período de prueba
CREATE TABLE periodos_prueba (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE UNIQUE,
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ NOT NULL,
    usado BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_suscripciones_user ON suscripciones(user_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);

-- ============================================
-- 3. PROGRESO Y ACTIVIDAD DEL USUARIO
-- ============================================

-- Progreso por tema (Modo Estudio)
CREATE TABLE progreso_temas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    tema_id UUID REFERENCES temas(id) ON DELETE CASCADE,
    preguntas_respondidas INTEGER DEFAULT 0,
    preguntas_correctas INTEGER DEFAULT 0,
    preguntas_incorrectas INTEGER DEFAULT 0,
    preguntas_omitidas INTEGER DEFAULT 0,
    porcentaje_completado DECIMAL(5,2) DEFAULT 0,
    ultima_pregunta_id UUID REFERENCES preguntas(id),
    ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tema_id)
);

-- Respuestas individuales en modo estudio
CREATE TABLE respuestas_estudio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES preguntas(id) ON DELETE CASCADE,
    respuesta_usuario CHAR(1) CHECK (respuesta_usuario IN ('A', 'B', 'C', 'D', 'X')), -- X = omitida
    es_correcta BOOLEAN NOT NULL,
    tiempo_respuesta INTEGER, -- Segundos
    intentos INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulacros (Modo Evaluación)
CREATE TABLE simulacros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    version_examen_id UUID REFERENCES versiones_examen(id),
    estado VARCHAR(20) DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'pausado', 'completado', 'abandonado')),
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    tiempo_limite_minutos INTEGER DEFAULT 120,
    tiempo_usado_segundos INTEGER DEFAULT 0,
    pausas_realizadas INTEGER DEFAULT 0,
    puntaje_total DECIMAL(5,2),
    preguntas_correctas INTEGER DEFAULT 0,
    preguntas_incorrectas INTEGER DEFAULT 0,
    preguntas_omitidas INTEGER DEFAULT 0,
    percentil DECIMAL(5,2), -- Calculado vs otros usuarios
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preguntas incluidas en cada simulacro
CREATE TABLE simulacro_preguntas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulacro_id UUID REFERENCES simulacros(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES preguntas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    respuesta_usuario CHAR(1) CHECK (respuesta_usuario IN ('A', 'B', 'C', 'D', 'X')),
    es_correcta BOOLEAN,
    tiempo_respuesta INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(simulacro_id, pregunta_id)
);

-- Índices
CREATE INDEX idx_progreso_user ON progreso_temas(user_id);
CREATE INDEX idx_respuestas_user ON respuestas_estudio(user_id);
CREATE INDEX idx_simulacros_user ON simulacros(user_id);
CREATE INDEX idx_simulacros_estado ON simulacros(estado);

-- ============================================
-- 4. GAMIFICACIÓN Y LOGROS
-- ============================================

-- Definición de logros
CREATE TABLE logros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL, -- "primera_perfecta", "racha_7_dias"
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50), -- Emoji o nombre de icono
    categoria VARCHAR(50) CHECK (categoria IN ('estudio', 'evaluacion', 'racha', 'maestria')),
    condicion JSONB, -- Criterios para desbloquear
    puntos INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logros desbloqueados por usuario
CREATE TABLE usuario_logros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    logro_id UUID REFERENCES logros(id) ON DELETE CASCADE,
    desbloqueado_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, logro_id)
);

-- Racha de días consecutivos
CREATE TABLE rachas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE UNIQUE,
    racha_actual INTEGER DEFAULT 0,
    racha_maxima INTEGER DEFAULT 0,
    ultima_actividad DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. SESIONES Y SEGURIDAD
-- ============================================

-- Control de sesiones concurrentes
CREATE TABLE sesiones_activas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de acciones críticas
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES perfiles(id),
    accion VARCHAR(100) NOT NULL,
    tabla VARCHAR(50),
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sesiones_user ON sesiones_activas(user_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_fecha ON audit_log(created_at);

-- ============================================
-- 6. CONFIGURACIÓN DEL SISTEMA
-- ============================================

-- Configuraciones globales
CREATE TABLE configuracion (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('string', 'integer', 'boolean', 'json')),
    descripcion TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserts iniciales de configuración
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('duracion_periodo_prueba_horas', '24', 'integer', 'Duración del período de prueba en horas'),
('tiempo_simulacro_minutos', '120', 'integer', 'Tiempo límite por simulacro'),
('preguntas_por_simulacro', '100', 'integer', 'Número de preguntas en cada simulacro'),
('max_pausas_simulacro', '3', 'integer', 'Máximo de pausas permitidas'),
('bloquear_devtools', 'true', 'boolean', 'Bloquear herramientas de desarrollo');

-- ============================================
-- 7. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
CREATE TRIGGER trigger_actualizar_perfiles
    BEFORE UPDATE ON perfiles
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_preguntas
    BEFORE UPDATE ON preguntas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_suscripciones
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_progreso
    BEFORE UPDATE ON progreso_temas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Función para verificar acceso del usuario
CREATE OR REPLACE FUNCTION verificar_acceso_usuario(p_user_id UUID)
RETURNS TABLE (
    tiene_acceso BOOLEAN,
    tipo_acceso VARCHAR,
    dias_restantes INTEGER
) AS $$
DECLARE
    v_periodo_prueba RECORD;
    v_suscripcion RECORD;
BEGIN
    -- Verificar período de prueba
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
    
    -- Verificar suscripción activa
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
    
    -- Sin acceso
    RETURN QUERY SELECT false, 'sin_acceso'::VARCHAR, 0;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular percentil de simulacro
CREATE OR REPLACE FUNCTION calcular_percentil(p_simulacro_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_puntaje DECIMAL;
    v_total_simulacros INTEGER;
    v_simulacros_menores INTEGER;
BEGIN
    -- Obtener puntaje del simulacro
    SELECT puntaje_total INTO v_puntaje
    FROM simulacros WHERE id = p_simulacro_id;
    
    -- Contar total de simulacros completados
    SELECT COUNT(*) INTO v_total_simulacros
    FROM simulacros WHERE estado = 'completado';
    
    -- Contar simulacros con puntaje menor
    SELECT COUNT(*) INTO v_simulacros_menores
    FROM simulacros 
    WHERE estado = 'completado' AND puntaje_total < v_puntaje;
    
    -- Calcular percentil
    IF v_total_simulacros > 0 THEN
        RETURN (v_simulacros_menores::DECIMAL / v_total_simulacros * 100);
    ELSE
        RETURN 50.0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en tablas de usuario
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacros ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacro_preguntas ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles (usuarios solo ven su propio perfil)
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON perfiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON perfiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para suscripciones
CREATE POLICY "Usuarios pueden ver sus propias suscripciones"
    ON suscripciones FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas para progreso
CREATE POLICY "Usuarios pueden ver su propio progreso"
    ON progreso_temas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio progreso"
    ON progreso_temas FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins pueden ver todo
CREATE POLICY "Admins pueden ver todos los perfiles"
    ON perfiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM perfiles 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ============================================
-- 9. VISTAS ÚTILES
-- ============================================

-- Vista de estadísticas por usuario
CREATE OR REPLACE VIEW estadisticas_usuario AS
SELECT 
    p.id as user_id,
    p.nombre_completo,
    COUNT(DISTINCT pt.tema_id) as temas_iniciados,
    AVG(pt.porcentaje_completado) as progreso_promedio,
    SUM(pt.preguntas_correctas) as total_correctas,
    SUM(pt.preguntas_respondidas) as total_respondidas,
    COUNT(DISTINCT s.id) as simulacros_realizados,
    AVG(s.puntaje_total) as puntaje_promedio_simulacros,
    r.racha_actual,
    r.racha_maxima,
    COUNT(DISTINCT ul.logro_id) as logros_desbloqueados
FROM perfiles p
LEFT JOIN progreso_temas pt ON p.id = pt.user_id
LEFT JOIN simulacros s ON p.id = s.user_id AND s.estado = 'completado'
LEFT JOIN rachas r ON p.id = r.user_id
LEFT JOIN usuario_logros ul ON p.id = ul.user_id
GROUP BY p.id, p.nombre_completo, r.racha_actual, r.racha_maxima;

-- Vista de distribución de preguntas por área/tema
CREATE OR REPLACE VIEW distribucion_preguntas AS
SELECT 
    v.nombre as version,
    a.nombre as area,
    t.nombre as tema,
    COUNT(p.id) as total_preguntas,
    t.peso_evaluacion,
    COUNT(CASE WHEN p.estado = 'aprobada' THEN 1 END) as preguntas_aprobadas
FROM versiones_examen v
JOIN areas a ON v.id = a.version_id
JOIN temas t ON a.id = t.area_id
LEFT JOIN preguntas p ON t.id = p.tema_id
GROUP BY v.id, v.nombre, a.id, a.nombre, t.id, t.nombre, t.peso_evaluacion
ORDER BY v.nombre, a.orden, t.orden;

-- ============================================
-- 10. DATOS INICIALES
-- ============================================

-- Versión inicial del examen
INSERT INTO versiones_examen (nombre, año, descripcion, fecha_inicio, activa) VALUES
('Examen 2026', 2026, 'Primera versión del banco de preguntas', '2025-01-01', true);

-- Logros predefinidos
INSERT INTO logros (codigo, nombre, descripcion, icono, categoria, puntos) VALUES
('primera_pregunta', 'Primer Paso', 'Respondiste tu primera pregunta', '🎯', 'estudio', 10),
('tema_completo', 'Maestro del Tema', 'Completaste todas las preguntas de un tema', '📚', 'estudio', 50),
('simulacro_perfecto', 'Perfección Absoluta', 'Obtuviste 100% en un simulacro', '💯', 'evaluacion', 200),
('racha_7_dias', 'Constancia Semanal', 'Mantuviste una racha de 7 días', '🔥', 'racha', 100),
('top_10_percentil', 'Top 10%', 'Entraste al top 10% de mejores puntajes', '🏆', 'evaluacion', 150);