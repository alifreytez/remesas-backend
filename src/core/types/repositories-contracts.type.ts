// Definiciòn de contratos para implementar en los repositorios

import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { OperationOptions } from '@database/repositories/bases/sequelize.repository.js';

export interface SystemAccessImplements {
    getAllFull(filters: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;

    getFull(id: string | number, operation?: OperationOptions): Promise<unknown>;

    getByUser(where: { usuario?: string | number }, operation?: OperationOptions): Promise<unknown>;

    getByCredentials(where: { id?: string | number; usuario?: string | number; clave?: string | number; emailGestion?: string }, operation?: OperationOptions): Promise<unknown>;
}

export interface RolesPermissionsImplements {
    getAllFull(filters: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;

    getFullByRole(roles: Array<string | number> | (string | number), filters?: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;
}

export interface RolesUsersImplements {
    getFullByUser(data: Record<string, any>, filters?: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;
}

export interface PermissionsImplements {
    getAllFull(filters: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;

    getFull(id: string | number, operation?: OperationOptions): Promise<unknown>;
}

export interface RolesImplements {
    getAllFull(filters: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;

    getFull(id: string | number, filters: ProcessedQueryFilters, operation?: OperationOptions): Promise<unknown>;
}

export interface RolesSpecificationsImplements {
    getAllByAranceles(filters: ProcessedQueryFilters): Promise<unknown>;
}
