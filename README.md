# 🎓 Sistema de Evaluación y Aprendizaje - Examen 2026 Bolivia

Plataforma web integral diseñada para la preparación efectiva de aspirantes al examen de admisión 2026. La aplicación ofrece una experiencia de aprendizaje personalizada, simulacros en tiempo real y seguimiento detallado del progreso.

## 🚀 Características Principales

- **📚 Modo Estudio:** Navegación por 4 áreas y 24 temas específicos con material de lectura y práctica focalizada.
- **📝 Simulacros de Examen:** Evaluaciones de 100 preguntas balanceadas con temporizador, sistema de pausas y navegación intuitiva.
- **🏆 Gamificación:** Sistema de logros, rachas diarias de estudio y rankings globales para fomentar la competitividad sana.
- **📊 Análisis de Progreso:** Estadísticas detalladas por área y tema para identificar fortalezas y debilidades.
- **💳 Gestión de Suscripciones:** Flujo de pago manual mediante QR con carga de comprobantes y validación administrativa.
- **🔒 Seguridad Avanzada:** Protección de contenido mediante bloqueo de DevTools y control de sesiones concurrentes.

## 🛠️ Stack Tecnológico

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/).
- **UI & Componentes:** [Shadcn/UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/).
- **Estado y Datos:** [Zustand](https://docs.pmnd.rs/zustand/), [TanStack Query v5](https://tanstack.com/query/latest).
- **Backend & DB:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage, Edge Functions).
- **Validación:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/).

## 📦 Estructura del Proyecto

```text
├── src/
│   ├── app/            # Rutas y páginas (Next.js App Router)
│   ├── components/     # Componentes de UI y lógica de negocio
│   ├── hooks/          # Hooks personalizados
│   ├── lib/            # Configuraciones de clientes (Supabase, utils)
│   ├── services/       # Capa de servicios para interactuar con la API/DB
│   ├── stores/         # Gestión de estado global con Zustand
│   └── types/          # Definiciones de TypeScript y tipos de Base de Datos
├── docs/               # Documentación arquitectónica y de flujos
├── data/               # Banco de preguntas y datos maestros
└── scripts/            # Utilidades de migración y procesamiento de datos
```

## ⚙️ Configuración del Entorno

1. **Clonar el repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd quiz-app
   ```

2. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` con las siguientes llaves:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   pnpm dev
   ```

## 📖 Documentación Adicional

Para más detalles sobre la arquitectura y el diseño, consulta la carpeta `docs/`:

- [Arquitectura Frontend](./docs/frontend_arch.md)
- [Esquema de Base de Datos](./docs/supabase_database.sql)
- [Flujos de Usuario](./docs/ux_flows.md)

---

Desarrollado para la excelencia académica en el Examen de Admisión 2026.
