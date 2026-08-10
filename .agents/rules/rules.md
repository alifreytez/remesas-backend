# Boost Backend - Reglas Estrictas para Agentes de IA

Este documento contiene las reglas de codificación y nomenclatura inquebrantables que **todos los agentes de IA** deben seguir al interactuar con el backend unificado (`boost-backend`).

## 1. Gestor de Paquetes
- **OBLIGATORIO:** Usa **exclusivamente `yarn`**. 
- **PROHIBIDO:** Usar `npm` bajo cualquier circunstancia.

## 2. Convenciones de Nomenclatura
- **Carpetas:** `kebab-case` (ej. `academic-programs`).
- **Endpoints (Rutas API):** `kebab-case` obligatoriamente (ej. `GET /api/v1/bank-accounts/user-balance`).
- **Variables y Métodos:** `camelCase`.
- **Clases:** `PascalCase`.
- **Constantes Globales:** `UPPER_SNAKE_CASE`. 
  - **[Regla de Cero Variables Mágicas]:** Todo dato estático "hardcodeado" (ej. valores para consultas DB) debe extraerse a una constante descriptiva en `shared/constants/`.
- **Archivos:**
  - En `src/modules/<modulo>/`: Usa el prefijo `_` (ej. `_.controller.ts`, `_.service.ts`, `_.schemas.ts`).
  - En `src/shared/` o `src/core/`: Usa notación de puntos descriptiva (ej. `roles.service.ts`).

## 3. Estructura de Servicios
- **Servicios Compartidos (Shared Services):**
  - **[OBLIGATORIO]** Cuando una funcionalidad o método específico que reside en un `_.service.ts` sea consumida por **múltiples módulos** o submódulos, **únicamente esos métodos compartidos** deben ser abstraídos y movidos a la carpeta `src/shared/services/`.
  - Lo que sea utilizado exclusivamente de manera interna por el módulo, debe permanecer en su `_.service.ts` local. No se debe mover todo el archivo si solo una parte de la lógica cruza dominios.

## 4. Controladores y Estructura HTTP
- **Controladores Ultra-Delgados:** 
  - **[PROHIBIDO]** usar `req` y `res` en las firmas de los métodos. Toda interacción y extracción de datos debe hacerse a través de los métodos proporcionados por la clase `ControllerBase`.
  - **[PROHIBIDO]** usar `res.json()` o `res.send()`. Usa siempre la envoltura de respuesta estándar provista por `ControllerBase` (ej. `res.sendResult`) para garantizar la estructura (`success`, `message`, `data`, `metadata`).
  - **[PROHIBIDO]** usar bloques `try/catch` manuales. El `ControllerBase` maneja las capturas globalmente.
- **Diseño REST Pragmático (Sub-recursos):**
  - **[PERMITIDO Y RECOMENDADO]** Aislar lógicas de negocio complejas o divergentes en endpoints separados (ej. `/users/:id/permissions/granted` o `/users/:id/permissions/excluded`) en lugar de usar query params (ej. `?type=granted`) que fuercen al controlador a tener múltiples `if/else`. Privilegia siempre el Principio de Responsabilidad Única (SRP) sobre la pureza REST estricta.
- **Respuestas de Controlador:**
  - **[OBLIGATORIO]** Aunque el controlador esté preparado para procesar retornos por defecto (ej. `return await service...`), debes usar explícitamente los métodos semánticos proveídos por `ControllerBase` que correspondan a la acción: `this.success()`, `this.created()`, `this.updated()`, `this.noContent()`.
- **Condicionales Cortos (If de una línea):**
  - **[OBLIGATORIO]** Para bloques `if` cuyo contenido sea una sola instrucción corta, **NO uses llaves `{}` ni saltos de línea**. Escribe la instrucción en la misma línea que la condición. Ejemplo: `if (body && Object.keys(body).length > 0) updated = await this.Roles.update({ id }, body, { transaction });`. Prettier se encargará de ajustarlo si supera el límite de caracteres (300).
- **Códigos HTTP Estrictos:** Nunca usar 200 en errores. 400 para validaciones, 401 para Auth, 500 exclusivo de fallas internas.

## 4. Validaciones y Tipado
- **Tipos TypeScript:** Interfaces genéricas y abstracciones van en `src/core/types/`.
- **Validaciones Joi:**
  - Específicas del módulo: `src/modules/<modulo>/_.schemas.ts`.
  - Compartidas: `src/shared/schemas/`.
  - **[PROHIBIDO]** mezclar validaciones Joi en la carpeta `docs/`.
- **Documentación Swagger:** Exclusivamente en formato YAML dentro de `src/modules/<modulo>/docs/`. **[PROHIBIDO]** usar `swagger-jsdoc` en el código.

## 5. Seguridad y Autenticación
- **Seguridad Omnicanal:** El middleware debe soportar y extraer el token tanto de Cookies (web) como de Headers Bearer (móvil). Las respuestas deben devolver el token por la misma vía en la que llegó.
- **Autorización:** Preferir `verifyPermission` usando el formato `CRUD:<ACTION>:<RESOURCE>`.

## 6. Economía de Tokens y Comportamiento del Agente
- **NO EXPLIQUES EL CÓDIGO** ni des respuestas largas. Ve al grano.
- **APLICA LOS CAMBIOS DIRECTAMENTE** en los archivos a menos que el usuario pida explícitamente ver el código en el chat.

## 7. Idiomas del Código, Comentarios y Comunicación
- **Código Fuente:** Todo elemento computacional del código (nombres de variables, funciones, clases, métodos, tipos, interfaces, etc.) debe redactarse exclusivamente en **inglés**.
- **Comentarios:** Todos los comentarios explicativos o de documentación dentro de los archivos de código (JSDoc, comentarios de línea) deben redactarse en **español**.
- **Mensajes y Respuestas:** 
  - Todo mensaje o respuesta generada por el sistema (mensajes de éxito en endpoints, mensajes de error en excepciones, alertas, correos) debe redactarse en **español**.
  - Todas las explicaciones, saludos y respuestas del agente en el chat deben ser incondicionalmente en **español**.
- **Mensajes de Commit (Git):** 
  - La descripción y comentarios de los commits deben redactarse siempre en **español**.
  - El prefijo inicial estandarizado de Conventional Commits (`feat(...)`, `refactor(...)`, `docs(...)`, `fix:`, etc.) debe mantenerse obligatoriamente en **inglés**.
  - **Ejemplo:** `feat(templates): integrar diseño base de correos en html con tipografía ubuntu`

## 8. Definiciones y Terminología Oficial de REMESAS
- **Acrónimo REMESAS:** Significa única y exclusivamente **Sistema de Remesas**.
- Está terminantemente prohibido utilizar o inventar cualquier otra expansión o definición de las siglas (ej. "Sistema Online del Área Docente"). Todo texto de la interfaz, plantillas de correo y comentarios del código debe usar **Sistema de Remesas**.



