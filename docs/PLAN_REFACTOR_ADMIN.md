# Plan de Refactorización y Mejoras Administrativas

Este documento detalla los pasos para eliminar las restricciones de desarrollo, implementar un control administrativo flexible sobre las suscripciones y añadir notificaciones por correo.

## 📋 Objetivos Principales
1. **Eliminar Bloqueo de DevTools:** Permitir inspección de código libremente.
2. **Control Global de Acceso:** Interruptor maestro para desactivar el requisito de pago/suscripción globalmente.
3. **Activación Manual:** Capacidad para que el admin regale tiempo de suscripción a usuarios específicos.
4. **Notificaciones:** Enviar correos al activar cuentas.

---

## 🛠 Fase 1: Eliminación de Restricciones (DevTools)

**Estado Actual:**
- Hook `useDevTools.ts` detecta el tamaño de ventana y teclas.
- Componente `DevToolsGuard.tsx` envuelve la app.
- Configuración en BD `bloquear_devtools` = true.

**Acciones:**
1. **Eliminar archivos:**
   - `src/hooks/useDevTools.ts`
   - `src/components/shared/DevToolsGuard.tsx`
2. **Limpiar Layout:**
   - Remover la importación y uso de `DevToolsGuard` en `src/app/layout.tsx`.
3. **Actualizar BD:**
   - Ejecutar SQL para eliminar o desactivar la key `bloquear_devtools` (opcional, por limpieza).

---

## 🔐 Fase 2: Lógica de Acceso Global (Backend/DB)

**Estado Actual:**
- Función `verificar_acceso_usuario` chequea estrictamente: Bloqueo -> Prueba -> Suscripción.

**Nueva Lógica:**
- Función `verificar_acceso_usuario` chequeará: Bloqueo -> **¿Sistema Cobro Activo?** -> Prueba -> Suscripción.
- Si el sistema de cobro está INACTIVO, devuelve acceso `gratuito_global`.

**Acciones:**
1. **Migración SQL:**
   ```sql
   INSERT INTO configuracion (clave, valor, tipo, descripcion)
   VALUES ('sistema_suscripciones_activo', 'true', 'boolean', 'Si es false, todos tienen acceso libre');
   ```
2. **Actualizar RPC `verificar_acceso_usuario`:**
   - Leer la configuración al inicio.
   - Si es 'false', retornar `true` (tiene acceso) inmediatamente.

---

## 📧 Fase 3: Sistema de Notificaciones (Email)

Usaremos **Resend** por su simplicidad en Next.js.

**Acciones:**
1. **Setup:**
   - `npm install resend`
   - Agregar `RESEND_API_KEY` a `.env.local`.
2. **Server Action `sendAccessEmail`:**
   - Crear template simple de HTML.
   - Función para enviar correo de "Bienvenida / Acceso Habilitado".

---

## 🖥 Fase 4: Gestión Administrativa (Server Actions & UI)

Modificar `src/app/(dashboard)/admin/suscripciones/page.tsx` y crear `src/services/admin-actions.ts`.

### 4.1 Server Actions (`admin-actions.ts`)
1. `toggleSubscriptionSystem(isActive: boolean)`: Actualiza la tabla `configuracion`.
2. `activateUserManually(userId: string, months: number)`:
   - Inserta en `suscripciones`:
     - `estado`: 'activa'
     - `plan_id`: (buscar uno genérico o null)
     - `fecha_inicio`: NOW()
     - `fecha_fin`: NOW() + interval 'X months'
     - `monto_pagado`: 0
     - `notas_verificacion`: 'Activación manual por Admin'
   - Llama a `sendAccessEmail`.

### 4.2 Interfaz de Usuario
1. **Card de Control Global:**
   - Switch: "Restringir Acceso (Cobros Activos)"
   - Estado actual leído de DB.
2. **Tabla de Usuarios Mejorada:**
   - Columna de estado actual (calculado).
   - Botón "Otorgar Acceso": Abre un Dialog.
   - **Dialog:**
     - Input: Cantidad de meses.
     - Checkbox: "Enviar correo de notificación".
     - Botón: "Confirmar Activación".

---

## 📅 Roadmap de Ejecución Inmediata

1. **Limpieza DevTools:** Borrar archivos y referencias.
2. **Base de Datos:** Ejecutar SQL para `sistema_suscripciones_activo` y actualizar función RPC.
3. **Backend:** Crear `admin-actions.ts` con la lógica de activación y toggle.
4. **Frontend:** Actualizar página de admin.
5. **Email:** Integrar Resend (si hay API Key) o dejar mock preparado.

**Nota:** Si no tienes API Key de Resend aún, implementaremos un "Mock Email Service" que solo haga `console.log` para no detener el desarrollo.
