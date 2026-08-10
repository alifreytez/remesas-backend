# Dominio de Economía y Transacciones

**REGLA DE LECTURA OBLIGATORIA:** Si la tarea actual involucra flujos de cotización, transacciones financieras, procesamiento de pagos, la tabla `exchange_rates` o creación de órdenes/tickets, DEBES aplicar las siguientes restricciones:

## 1. Integridad Transaccional
Toda operación que involucre saldo, cupones o compras debe realizarse **estrictamente** dentro de una Transacción de Sequelize (distribuida, si aplica). **[PROHIBIDO]** realizar débitos o cálculos sin bloqueos de transacción que aseguren la atomicidad del flujo.

## 2. Aislamiento de Repositorios Económicos
Solo los Repositorios pertenecientes a los módulos de economía/pagos (accedidos vía `Database.repository()`) tienen la autorización para ejecutar transacciones SQL financieras. 

*(Agente: Al operar en módulos de economía, revisa exhaustivamente los repositorios antes de alterar cualquier flujo del servicio)*.
