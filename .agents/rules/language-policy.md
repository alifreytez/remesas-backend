# Reglas Estrictas de Idioma para el Agente

Estas reglas son OBLIGATORIAS E INQUEBRANTABLES para cualquier interacción, generación y modificación en el proyecto:

1. **Código Fuente en Inglés:**
   - Cada parte del código fuente (nombres de variables, funciones, métodos, clases, tipos, interfaces, propiedades de objetos computacionales, etc.) debe redactarse exclusivamente en **inglés**.

2. **Comentarios en Español:**
   - Todo comentario aclaratorio de línea, bloque de notas o documentación técnica incrustada (como JSDoc) dentro de los archivos del proyecto debe redactarse obligatoriamente en **español**.

3. **Mensajes y Respuestas en Español:**
   - **Respuestas del Backend / API:** Todo mensaje devuelto por los endpoints (mensajes de éxito `message`, errores en excepciones, validaciones en texto plano y cuerpos de correos electrónicos) debe estar formulado estrictamente en **español**.
   - **Interacción del Agente:** Toda comunicación, explicación, saludo o respuesta proporcionada al usuario mediante el chat del asistente debe realizarse incondicionalmente en **español**.

4. **Mensajes de Commit (Git):**
   - La descripción y el cuerpo de los commits deben redactarse obligatoriamente en **español**.
   - Sin embargo, el prefijo inicial (tipo y ámbito de Conventional Commits como `feat(...)`, `refactor(...)`, `docs(...)`, `fix:`) debe mantenerse estandarizado en **inglés**.
   - **Ejemplo correcto:** `refactor(auth): implementar caché redis en catálogos rbac y centralizar generación de tokens`
