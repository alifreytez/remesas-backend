// Definiciòn de contratos para implementar en los repositorios

import { WhereCondition } from '@bases/repository.base.js';
import { OperationOptions } from '@database/repositories/bases/sequelize.repository.js';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';

export interface AssetRequestImplements {
    getRequests(history: boolean, filters: ProcessedQueryFilters, operation?: OperationOptions | null, where?: WhereCondition): Promise<unknown>;

    getRequest(id: string | number, history: boolean, operation?: OperationOptions): Promise<unknown>;

    /** Obtiene la cantidad de bienes asociados a una solicitud */
    countAssets(reqId: string | number, operation?: OperationOptions): Promise<number>;

    getAllIdAssociates(reqId: string | number, operation?: OperationOptions): Promise<Record<string, any> | null | undefined>;
}

export interface EmployeePayrollUnitImplements {
    /**
     * Obtiene la data del responsable administrativo a partir del id del responsable,
     * el id del responsable puede ser el de uso, o de cuido.
     */
    getRespAdm(respId?: string | number, operation?: OperationOptions): Promise<unknown>;
}

export interface GetAssetDataImplements {
    /**
     * Obtiene la data en crudo de un bien registrado, a través del detalle de solicitud
     */
    getRawAssetData(bnId: string | number, operation?: OperationOptions): Promise<unknown>;

    /**
     * Obtiene la data en crudo todos los bienes registrados en la solicitud reqId, a través de la tabla detalleSolicitud
     */
    getRawAssetDataByReq(reqId: string | number, filters: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;
}

export interface DetailsRequestImplements {
    /**
     * Función que actua en conjunto con `AssetRequestImplements.countAssets`.
     * Devuelve un booleano que indica si una solicitud identificada por `reqId`, tiene registrada al menos un bien.
     */
    reqContainAssets(reqId: string | number, operation?: OperationOptions): Promise<boolean>;
}

export interface AssetResponsiblesImplements {
    /**
     * Obtiene la data de un responsable específico, o lo crea en caso de que no exista.
     */
    getOrCreate(
        respId: string | number,
        resource: {
            tipoResponsable: string | number;
            unidadAdministradora: string | number;
        },
        operation?: OperationOptions
    ): Promise<[Record<string, any>, boolean]>;
}
