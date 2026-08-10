// Interface definitions for the 'tesoreria' (treasury) module

// 1. Agencias Bancarias
export interface TesAgenciasBancarias {
    id: number;
    banco: number;
    codigoAgencia: string;
    descripcion: string;
    direccion: string | null;
    status: number;
}
export interface CreateTesAgenciasBancariasDto extends Omit<TesAgenciasBancarias, 'id' | 'status' | 'direccion'> {
    id?: number;
    direccion?: string | null;
    status?: number;
}
export interface UpdateTesAgenciasBancariasDto extends Partial<CreateTesAgenciasBancariasDto> {}

// 2. Aranceles Caja
export interface TesArancelesCaja {
    id: number;
    documentoCaja: number;
    tipoSolicitante: number;
    certificacion: number | null;
    nacionalidad: number | null;
    tipoEstudio: number | null;
    statusEstudiante: number | null;
    montoArancel: number | null;
    cantidadUnidadTribut: number;
    status: number;
}
export interface CreateTesArancelesCajaDto extends Omit<TesArancelesCaja, 'id' | 'status' | 'certificacion' | 'nacionalidad' | 'tipoEstudio' | 'statusEstudiante' | 'montoArancel'> {
    id?: number;
    certificacion?: number | null;
    nacionalidad?: number | null;
    tipoEstudio?: number | null;
    statusEstudiante?: number | null;
    montoArancel?: number | null;
    status?: number;
}
export interface UpdateTesArancelesCajaDto extends Partial<CreateTesArancelesCajaDto> {}

// 3. Bancos
export interface TesBancos {
    id: number;
    codigoBanco: string;
    descripcion: string;
    status: number;
}
export interface CreateTesBancosDto extends Omit<TesBancos, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesBancosDto extends Partial<CreateTesBancosDto> {}

// 4. Certificaciones Documento
export interface TesCertificacionesDocumento {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesCertificacionesDocumentoDto extends Omit<TesCertificacionesDocumento, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesCertificacionesDocumentoDto extends Partial<CreateTesCertificacionesDocumentoDto> {}

// 5. Códigos Bancarios
export interface TesCodigosBancarios {
    id: number;
    codigoBancario: string;
    descripcion: string;
    status: number;
}
export interface CreateTesCodigosBancariosDto extends Omit<TesCodigosBancarios, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesCodigosBancariosDto extends Partial<CreateTesCodigosBancariosDto> {}

// 6. Condiciones Solicitud Caja
export interface TesCondicionesSolicitudCaja {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesCondicionesSolicitudCajaDto extends Omit<TesCondicionesSolicitudCaja, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesCondicionesSolicitudCajaDto extends Partial<CreateTesCondicionesSolicitudCajaDto> {}

// 7. Control Solicitudes
export interface TesControlSolicitudes {
    id: number;
    unidadAdministradora: number;
    nroSolicitud: number;
    fechaInicio: string | null;
    fechaFin: string | null;
    horario: string | null;
    status: number;
}
export interface CreateTesControlSolicitudesDto extends Omit<TesControlSolicitudes, 'id' | 'status' | 'fechaInicio' | 'fechaFin' | 'horario'> {
    id?: number;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    horario?: string | null;
    status?: number;
}
export interface UpdateTesControlSolicitudesDto extends Partial<CreateTesControlSolicitudesDto> {}

// 8. Cuentas Bancarias Unidad
export interface TesCuentasBancariasUnidad {
    id: number;
    cuentaBancaria: number;
    unidadAdministradora: number;
    status: number;
}
export interface CreateTesCuentasBancariasUnidadDto extends Omit<TesCuentasBancariasUnidad, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesCuentasBancariasUnidadDto extends Partial<CreateTesCuentasBancariasUnidadDto> {}

// 9. Cuentas Bancarias
export interface TesCuentasBancarias {
    id: number;
    agenciaBancaria: number;
    nroCuenta: string;
    tipo: number;
    rif: string;
    observacion: string | null;
    fechaApertura: string | null;
    status: number;
}
export interface CreateTesCuentasBancariasDto extends Omit<TesCuentasBancarias, 'id' | 'status' | 'observacion' | 'fechaApertura'> {
    id?: number;
    observacion?: string | null;
    fechaApertura?: string | null;
    status?: number;
}
export interface UpdateTesCuentasBancariasDto extends Partial<CreateTesCuentasBancariasDto> {}

// 10. Documentos Caja
export interface TesDocumentosCaja {
    id: number;
    tipoSolicitud: number;
    descripcion: string;
    status: number;
}
export interface CreateTesDocumentosCajaDto extends Omit<TesDocumentosCaja, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesDocumentosCajaDto extends Partial<CreateTesDocumentosCajaDto> {}

// 11. Estado Cuenta
export interface TesEstadoCuenta {
    id: number;
    cuentaBancaria: number;
    nroDocumentoBancario: string;
    descripcion: string;
    montoMovimiento: number;
    tipoTransaccion: number;
    empleadoResponsable: number;
    empleadoConciliacion: number | null;
    solicitudCaja: number | null;
    fechaMovimiento: string;
    fechaRegistro: string;
    fechaConciliacion: string | null;
    fechaRelacion: string | null;
    status: number;
}
export interface CreateTesEstadoCuentaDto extends Omit<TesEstadoCuenta, 'id' | 'status' | 'fechaRegistro' | 'empleadoConciliacion' | 'solicitudCaja' | 'fechaConciliacion' | 'fechaRelacion'> {
    id?: number;
    empleadoConciliacion?: number | null;
    solicitudCaja?: number | null;
    fechaRegistro?: string;
    fechaConciliacion?: string | null;
    fechaRelacion?: string | null;
    status?: number;
}
export interface UpdateTesEstadoCuentaDto extends Partial<CreateTesEstadoCuentaDto> {}

// 12. Histórico Solicitudes Caja
export interface TesHistoricoSolicitudesCaja {
    id: number;
    solicitudCaja: number;
    statusSolicitud: number;
    condicionSolicitud: number;
    fechaRegistro: string;
    observacion: string | null;
    status: number;
}
export interface CreateTesHistoricoSolicitudesCajaDto extends Omit<TesHistoricoSolicitudesCaja, 'id' | 'status' | 'fechaRegistro' | 'observacion'> {
    id?: number;
    fechaRegistro?: string;
    observacion?: string | null;
    status?: number;
}
export interface UpdateTesHistoricoSolicitudesCajaDto extends Partial<CreateTesHistoricoSolicitudesCajaDto> {}

// 13. Relación Códigos Bancarios
export interface TesRelacionCodigosBancarios {
    id: number;
    codigoBancario: number;
    tipoTransaccion: number;
    status: number;
}
export interface CreateTesRelacionCodigosBancariosDto extends Omit<TesRelacionCodigosBancarios, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesRelacionCodigosBancariosDto extends Partial<CreateTesRelacionCodigosBancariosDto> {}

// 14. Relación Tipos Solicitud Caja
export interface TesRelacionTiposSolcaj {
    id: number;
    tipoSolicitud: number;
    rolEncargado: string;
    status: number;
}
export interface CreateTesRelacionTiposSolcajDto extends Omit<TesRelacionTiposSolcaj, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesRelacionTiposSolcajDto extends Partial<CreateTesRelacionTiposSolcajDto> {}

// 15. Relación Unidades Fomento
export interface TesRelacionUnidadesFomento {
    id: number;
    unidadAdministradora: number;
    unidadFomento: number;
    status: number;
}
export interface CreateTesRelacionUnidadesFomentoDto extends Omit<TesRelacionUnidadesFomento, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesRelacionUnidadesFomentoDto extends Partial<CreateTesRelacionUnidadesFomentoDto> {}

// 16. Requisitos Arancel Caja
export interface TesRequisitosArancelCaja {
    id: number;
    requisito: number;
    arancelCaja: number;
    status: number;
}
export interface CreateTesRequisitosArancelCajaDto extends Omit<TesRequisitosArancelCaja, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesRequisitosArancelCajaDto extends Partial<CreateTesRequisitosArancelCajaDto> {}

// 17. Requisitos Documento Caja
export interface TesRequisitosDocumentoCaja {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesRequisitosDocumentoCajaDto extends Omit<TesRequisitosDocumentoCaja, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesRequisitosDocumentoCajaDto extends Partial<CreateTesRequisitosDocumentoCajaDto> {}

// 18. Solicitantes Caja Empleados
export interface TesSolicitantesCajaEmpleados {
    id: number;
    empleado: number;
    tipoPersonal: number;
    cargoLaboral: number;
    condicionEmpleado: number;
    dedicacion: number;
    fechaIngreso: string | null;
    fechaEgreso: string | null;
    status: number;
}
export interface CreateTesSolicitantesCajaEmpleadosDto extends Omit<TesSolicitantesCajaEmpleados, 'id' | 'status' | 'fechaIngreso' | 'fechaEgreso'> {
    id?: number;
    fechaIngreso?: string | null;
    fechaEgreso?: string | null;
    status?: number;
}
export interface UpdateTesSolicitantesCajaEmpleadosDto extends Partial<CreateTesSolicitantesCajaEmpleadosDto> {}

// 19. Solicitantes Caja Estudiantes
export interface TesSolicitantesCajaEstudiantes {
    id: number;
    estudiante: number;
    programaAcademico: number;
    statusEstudiante: number;
    fechaIngreso: string | null;
    fechaEgreso: string | null;
    status: number;
}
export interface CreateTesSolicitantesCajaEstudiantesDto extends Omit<TesSolicitantesCajaEstudiantes, 'id' | 'status' | 'fechaIngreso' | 'fechaEgreso'> {
    id?: number;
    fechaIngreso?: string | null;
    fechaEgreso?: string | null;
    status?: number;
}
export interface UpdateTesSolicitantesCajaEstudiantesDto extends Partial<CreateTesSolicitantesCajaEstudiantesDto> {}

// 20. Solicitudes Caja Aranceles
export interface TesSolicitudesCajaAranceles {
    id: number;
    solicitudCaja: number;
    arancelCaja: number;
    cantidad: number;
    costoAcumulado: number;
    fechaRecepcion: string | null;
    fechaTramite: string | null;
    fechaEntrega: string | null;
    empleadoRecepcion: number | null;
    empleadoTramite: number | null;
    empleadoEntrega: number | null;
    status: number;
}
export interface CreateTesSolicitudesCajaArancelesDto extends Omit<
    TesSolicitudesCajaAranceles,
    'id' | 'status' | 'fechaRecepcion' | 'fechaTramite' | 'fechaEntrega' | 'empleadoRecepcion' | 'empleadoTramite' | 'empleadoEntrega'
> {
    id?: number;
    fechaRecepcion?: string | null;
    fechaTramite?: string | null;
    fechaEntrega?: string | null;
    empleadoRecepcion?: number | null;
    empleadoTramite?: number | null;
    empleadoEntrega?: number | null;
    status?: number;
}
export interface UpdateTesSolicitudesCajaArancelesDto extends Partial<CreateTesSolicitudesCajaArancelesDto> {}

// 21. Solicitudes Caja Disponible
export interface TesSolicitudesCajaDisponible {
    id: number;
    tipoSolicitante: number;
    tipoSolicitud: number;
    status: number;
}
export interface CreateTesSolicitudesCajaDisponibleDto extends Omit<TesSolicitudesCajaDisponible, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesSolicitudesCajaDisponibleDto extends Partial<CreateTesSolicitudesCajaDisponibleDto> {}

// 22. Solicitudes Caja Programas Equivalentes
export interface TesSolicitudesCajaProgramasequiv {
    id: number;
    solicitudCaja: number;
    programaAcademico: number;
    status: number;
}
export interface CreateTesSolicitudesCajaProgramasequivDto extends Omit<TesSolicitudesCajaProgramasequiv, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesSolicitudesCajaProgramasequivDto extends Partial<CreateTesSolicitudesCajaProgramasequivDto> {}

// 23. Solicitudes Caja Solicitantes
export interface TesSolicitudesCajaSolicitantes {
    id: number;
    solicitanteEstudiante: number | null;
    solicitanteEmpleado: number | null;
    solicitanteExterno: number | null;
    tipoSolicitante: number;
    tipoEstudio: number | null;
    tipoPersonal: number | null;
    status: number;
}
export interface CreateTesSolicitudesCajaSolicitantesDto extends Omit<
    TesSolicitudesCajaSolicitantes,
    'id' | 'status' | 'solicitanteEstudiante' | 'solicitanteEmpleado' | 'solicitanteExterno' | 'tipoEstudio' | 'tipoPersonal'
> {
    id?: number;
    solicitanteEstudiante?: number | null;
    solicitanteEmpleado?: number | null;
    solicitanteExterno?: number | null;
    tipoEstudio?: number | null;
    tipoPersonal?: number | null;
    status?: number;
}
export interface UpdateTesSolicitudesCajaSolicitantesDto extends Partial<CreateTesSolicitudesCajaSolicitantesDto> {}

// 24. Solicitudes Caja Transacciones
export interface TesSolicitudesCajaTransacciones {
    id: number;
    solicitudCaja: number;
    cuentaBancaria: number;
    tipoTransaccion: number;
    referenciaTransaccion: string;
    montoTransaccion: number;
    fechaTransaccion: string;
    status: number;
}
export interface CreateTesSolicitudesCajaTransaccionesDto extends Omit<TesSolicitudesCajaTransacciones, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesSolicitudesCajaTransaccionesDto extends Partial<CreateTesSolicitudesCajaTransaccionesDto> {}

// 25. Solicitudes Caja
export interface TesSolicitudesCaja {
    id: number;
    nroSolicitud: string;
    unidadAdministradora: number;
    tipoSolicitud: number;
    solicitanteCaja: number;
    correoSolicitante: string;
    telefonoSolicitante: string;
    montoTotal: number;
    nroIntentoConciliacion: number;
    fechaRegistro: string;
    fechaRechazo: string | null;
    fechaConciliacion: string | null;
    fechaEntrega: string | null;
    fechaTramite: string | null;
    fechaReverso: string | null;
    statusSolicitud: number;
    condicionSolicitud: number;
    status: number;
}
export interface CreateTesSolicitudesCajaDto extends Omit<
    TesSolicitudesCaja,
    'id' | 'status' | 'fechaRegistro' | 'nroIntentoConciliacion' | 'fechaRechazo' | 'fechaConciliacion' | 'fechaEntrega' | 'fechaTramite' | 'fechaReverso'
> {
    id?: number;
    nroIntentoConciliacion?: number;
    fechaRegistro?: string;
    fechaRechazo?: string | null;
    fechaConciliacion?: string | null;
    fechaEntrega?: string | null;
    fechaTramite?: string | null;
    fechaReverso?: string | null;
    status?: number;
}
export interface UpdateTesSolicitudesCajaDto extends Partial<CreateTesSolicitudesCajaDto> {}

// 26. Status Solicitud Caja
export interface TesStatusSolicitudCaja {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesStatusSolicitudCajaDto extends Omit<TesStatusSolicitudCaja, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesStatusSolicitudCajaDto extends Partial<CreateTesStatusSolicitudCajaDto> {}

// 27. Tasas Divisa
export interface TesTasasDivisa {
    id: number;
    montoTasa: number;
    empleadoResponsable: number;
    fechaRegistro: string;
    status: number;
}
export interface CreateTesTasasDivisaDto extends Omit<TesTasasDivisa, 'id' | 'status' | 'fechaRegistro'> {
    id?: number;
    fechaRegistro?: string;
    status?: number;
}
export interface UpdateTesTasasDivisaDto extends Partial<CreateTesTasasDivisaDto> {}

// 28. Tipos Cuenta Bancaria
export interface TesTiposCuentaBancaria {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesTiposCuentaBancariaDto extends Omit<TesTiposCuentaBancaria, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesTiposCuentaBancariaDto extends Partial<CreateTesTiposCuentaBancariaDto> {}

// 29. Tipos Solicitante
export interface TesTiposSolicitante {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesTiposSolicitanteDto extends Omit<TesTiposSolicitante, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesTiposSolicitanteDto extends Partial<CreateTesTiposSolicitanteDto> {}

// 30. Tipos Solicitud Caja
export interface TesTiposSolicitudCaja {
    id: number;
    descripcion: string;
    status: number;
}
export interface CreateTesTiposSolicitudCajaDto extends Omit<TesTiposSolicitudCaja, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesTiposSolicitudCajaDto extends Partial<CreateTesTiposSolicitudCajaDto> {}

// 31. Tipos Transacción Bancaria
export interface TesTiposTransaccionBancaria {
    id: number;
    codigo: string;
    descripcion: string;
    status: number;
}
export interface CreateTesTiposTransaccionBancariaDto extends Omit<TesTiposTransaccionBancaria, 'id' | 'status'> {
    id?: number;
    status?: number;
}
export interface UpdateTesTiposTransaccionBancariaDto extends Partial<CreateTesTiposTransaccionBancariaDto> {}
