console.log(`
======================================================================
               GUÍA DE COMANDOS DE BASE DE DATOS REMESAS
======================================================================
Esta herramienta automatizada te permite gestionar respaldos, 
exportaciones e importaciones de la base de datos de manera sencilla.

----------------------------------------------------------------------
1. RESPALDOS, RESTAURACIÓN Y ESTRUCTURA
----------------------------------------------------------------------
> yarn db:backup <ruta_archivo> [opciones]
  Genera un respaldo completo (estructura y datos) en formato binario.
  - Parámetros:
    <ruta_archivo> : (Obligatorio) Ruta destino. Si omites la extensión,
                     se le añadirá automáticamente ".dump".

> yarn db:restore <ruta_archivo> [opciones]
  Restaura un archivo binario (.dump) a la base de datos.
  - Parámetros:
    <ruta_archivo> : (Obligatorio) Ruta del archivo a restaurar.

> yarn db:export-schema <ruta_archivo_sql> [opciones]
  Exporta ÚNICAMENTE la estructura de la base de datos (tablas, 
  esquemas, etc.) en formato SQL plano.
  - Parámetros:
    <ruta_archivo> : (Obligatorio) Ruta destino. Si omites la extensión,
                     se le añadirá automáticamente ".sql".

----------------------------------------------------------------------
2. EXPORTACIÓN E IMPORTACIÓN (SOLO DATOS)
----------------------------------------------------------------------
> yarn db:export-data --type <sql|bin> <ruta_archivo|carpeta> [opciones]
  Exporta únicamente los datos, omitiendo la estructura de tablas.
  - Parámetros Base:
    --type <sql|bin>: (Obligatorio) 'sql' genera sentencias SQL, 'bin'
                      genera un formato binario comprimido (.dump).
    <ruta/carpeta>  : (Obligatorio) Archivo destino o carpeta si usas 
                      el flag --split-tables.
  - Modificadores (Opcionales):
    -t <tabla>      : Exporta solo esta tabla (ej. -t auth.permisos).
                      Puedes repetirlo varias veces.
    -et <tabla>     : Excluye una tabla de la exportación general.
                      Puedes repetirlo varias veces.
    --split-tables  : Cambia el comportamiento: en lugar de un archivo,
                      exportará un archivo por cada tabla adentro de la 
                      carpeta indicada.

> yarn db:import-data --type <sql|bin> <ruta_archivo> [opciones]
  Importa únicamente datos a tablas que ya existen en la base de datos.
  - Parámetros:
    --type <sql|bin>: (Obligatorio) Formato de tu archivo.
    <ruta_archivo>  : (Obligatorio) Ruta del archivo a importar.

----------------------------------------------------------------------
* NOTA: OPCIONES DE CONEXIÓN (Solo aplican para comandos 1 y 2)
----------------------------------------------------------------------
Si omites estas opciones, los comandos 1 y 2 leerán automáticamente las 
credenciales principales definidas en tu archivo local ".env".
Úsalas solo si necesitas apuntar a un entorno distinto en caliente:

  --host <host>       Ej: 192.168.1.10
  --port <puerto>     Ej: 5432
  --user <usuario>    Ej: admin
  --db <base_datos>   Ej: REMESAS_produccion
  --password <clave>  Ej: mi_secreto

----------------------------------------------------------------------
3. MIGRACIONES, SEEDERS Y ESTRUCTURA (NATIVOS DE SEQUELIZE)
----------------------------------------------------------------------
> yarn db:setup
  Crea la base de datos (vacía) si aún no existe.

> yarn db:drop
  Elimina la base de datos por completo. ¡Cuidado!

> yarn db:migrate
  Ejecuta todos los archivos de migración pendientes para construir 
  o actualizar las tablas de tu base de datos.

> yarn db:seed:all
  Ejecuta todos los seeders (semilleros) para poblar las tablas 
  con datos por defecto iniciales.

> yarn db:seed
  Ejecuta un seeder en particular (debes pasarle el flag --seed).

> yarn db:setup:fresh
  Ejecuta secuencialmente: db:setup + db:migrate + db:seed:all.
  Ideal para levantar la BD desde cero por primera vez.

> yarn db:reset
  Ejecuta secuencialmente: db:drop + db:setup. 
  Borra todo y deja la BD completamente limpia y vacía.

> yarn db:reset:fresh
  Ejecuta secuencialmente: db:reset + db:migrate + db:seed:all.
  Borra todo y reconstruye la BD desde cero con datos iniciales.
======================================================================
`);


