# Reglas Generales del Proyecto

- Los archivos temporales o scripts de soporte creados durante la ejecución de tareas deben guardarse siempre dentro de una carpeta `scraps/` en el proyecto correspondiente, y no sueltos en otros directorios.
- Cuando se requiera realizar un `git add` y `git commit`, haz **commits atómicos** por cada bloque de cambios lógicos (no agrupes todos los cambios en un solo commit gigante). Además, el mensaje del commit debe estar en **español** y utilizar la sintaxis Conventional Commits incluyendo un "scope" (ej. `fix(ui): corrigiendo inconsistencia de tamaños`, `feat(auth): agregando login`).
