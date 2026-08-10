# Ecosistema de Segundo Plano (`src/background/`)

Este ecosistema paralelo gestiona todo el procesamiento que ocurre **fuera** del ciclo Request-Response de Express, garantizando que el hilo principal jamás se bloquee.

## 1. Componentes del Background

- **`orchestrator.ts`:** Orquestador central encargado de registrar e iniciar workers, crons y subscribers al arrancar la app. No contiene lógica de negocio.
- **Workers (`workers/`):** Consumidores de colas (BullMQ, apoyados en Redis). Toman trabajos encolados. 
  - **[REGLA ESTRICTA]**: Los workers NO interactúan directamente con la base de datos ni con los Repositorios. Su única función es desempacar el Payload y ejecutar el Servicio correspondiente de `shared/services` (o un módulo específico).
- **Crons (`crons/`):** Ejecutan tareas basadas en el tiempo. Actúan únicamente como gatillos hacia los Servicios.
- **Subscribers (`subscribers/`):** Escuchan eventos (Pub/Sub Redis o Event Emitters nativos) para desacoplar flujos secundarios (ej. enviar email de registro).
- **Tasks (`tasks/`):** Definen el payload estandarizado (contrato de datos) que los productores (servicios/controladores) envían hacia las colas.

## 2. Aislamiento de Estado y Medios
- El almacenamiento en toda la aplicación es Stateless. Las cargas efímeras usan `multer.memoryStorage()`.
- La persistencia de medios se delega en ImageKit.io mediante inyección de dependencias. **[PROHIBIDO]** intentar guardar o procesar archivos en el disco local de la aplicación.
