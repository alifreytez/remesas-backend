import { Database } from '@database/index.js';
import { BadRequestError } from '@errors/index.js';

export interface RequestTypeParams {
    requestType: number | string;
    adminUnit?: number | string | null;
}

export interface SessionWithRoles {
    roles?: Array<{ code: string; id: number | string }> | null;
    [key: string]: any;
}

export interface SessionRoleParams {
    session: SessionWithRoles;
    role: string;
}

class RolesService {
    private get TesRelacionTiposSolcajRepository() {
        return Database.repository('main', 'tesoreria-relacion-tipos-solcaj') as any;
    }
    private get AuthRolesEspecificacionesRepository() {
        return Database.repository('main', 'auth-roles-especificaciones') as any;
    }
    private get TesRelacionUnidadesFomentoRepository() {
        return Database.repository('main', 'tesoreria-relacion-unidades-fomento') as any;
    }
    private get TesCuentasBancariasRepository() {
        return Database.repository('main', 'tesoreria-cuentas-bancarias') as any;
    }
    private get PlaUnidadesAdministradorasRepository() {
        return Database.repository('main', 'pla-unidades-administradoras') as any;
    }

    async getRoleByRequestType(requestType: number | string): Promise<any> {
        return (
            await this.TesRelacionTiposSolcajRepository.getAll(
                { attributes: ['id', 'rolEncargado', 'tipoSolicitud'] },
                {
                    tipoSolicitud: requestType,
                }
            )
        )?.rows;
    }

    async getRolesIdByRequestType({ requestType, adminUnit }: RequestTypeParams): Promise<any> {
        const where: Record<string, any> = { tipoSolicitud: requestType };
        if (requestType == 1 && adminUnit != null) {
            where['$_Roles->_RolEsp.unidadIngresos$'] = adminUnit;
        }

        const relation = await this.TesRelacionTiposSolcajRepository.getOne(where, {
            operation: { subQuery: false },
            relations: [{ association: '_Roles', nested: [{ association: '_RolEsp', required: true }], required: true }],
        });

        return relation?._Roles?._RolEsp;
    }

    async getAdminUnitByRequestType({ requestType, adminUnit }: RequestTypeParams): Promise<any> {
        const where: Record<string, any> = { tipoSolicitud: Number(requestType) };
        if (requestType == 1 && adminUnit != null) where['$_Roles->_RolEsp.unidadIngresos$'] = adminUnit;

        const relation = await this.TesRelacionTiposSolcajRepository.getOne(where, {
            operation: { subQuery: false },
            relations: [
                {
                    association: '_Roles',
                    nested: [{ association: '_RolEsp', nested: [{ association: '_UniAdm' }], required: true }],
                    required: true,
                },
            ],
        });
        const _adminUnit = relation?._Roles?._RolEsp[0]?._UniAdm;

        if (_adminUnit != null) _adminUnit.tipoUnidadIngresos = relation?._Roles?._RolEsp[0].tipoUnidadIngresos;

        return _adminUnit;
    }

    getRoleId(session: SessionWithRoles, role: string): number | string {
        if (session?.roles == null || role == null) throw new BadRequestError('No se proporcionó la información necesaria sobre el rol.');

        const roleId = session?.roles.find((rol) => rol.code === role)?.id;

        if (roleId == null) throw new BadRequestError('No se encontró permiso para usar el rol proporcionado.');

        return roleId;
    }

    async getRequestTypesIdByRole({ session, role }: SessionRoleParams): Promise<any> {
        const roleId = this.getRoleId(session, role);
        const result = await this.TesRelacionTiposSolcajRepository.getAll({ attributes: ['tipoSolicitud'] }, { rolEncargado: roleId });

        return result?.rows?.map((req: any) => req.tipoSolicitud);
    }

    async getBankAccountByRole({ session, role }: SessionRoleParams): Promise<any> {
        const roleId = this.getRoleId(session, role);

        const roleSpecs = await this.AuthRolesEspecificacionesRepository.getOne({ rol: roleId, status: 1 });
        if (roleSpecs == null) throw new BadRequestError('No se encontró asociación con una unidad administradora.');

        const bankAccount = await this.TesCuentasBancariasRepository.getFullByPk(roleSpecs.cuentaBancariaIngresos);

        return bankAccount;
    }

    async getAdminUnitByRole({ session, role }: SessionRoleParams): Promise<any> {
        const roleId = this.getRoleId(session, role);

        const roleSpecs = await this.AuthRolesEspecificacionesRepository.getOne({ rol: roleId, status: 1 });
        if (roleSpecs == null) throw new BadRequestError('No se encontró asociación con una unidad administradora.');

        const adminUnit = await this.PlaUnidadesAdministradorasRepository.getById(roleSpecs.unidadIngresos);
        if (adminUnit == null) throw new BadRequestError('Hubo problemas para hallar la unidad administradora.');

        return { ...adminUnit, tipoUnidadIngresos: roleSpecs.tipoUnidadIngresos };
    }

    async getBankAccountUnitByRole({ session, role }: SessionRoleParams): Promise<any> {
        const roleId = this.getRoleId(session, role);
        let bankAdminUnitId = '';

        const roleSpecs = await this.AuthRolesEspecificacionesRepository.getOne({ rol: roleId, status: 1 });

        if (roleSpecs == null) throw new BadRequestError('No se encontró asociación con una unidad administradora.');
        bankAdminUnitId = roleSpecs.unidadIngresos;

        if (roleSpecs.tipoUnidadIngresos == 2) {
            const otherUnit = await this.TesRelacionUnidadesFomentoRepository.getOne({
                unidadAdministradora: roleSpecs.unidadIngresos,
                status: 1,
            });

            if (otherUnit == null) throw new BadRequestError('Hubo problemas para hallar la unidad administradora asociada a la cuenta bancaria.');

            bankAdminUnitId = otherUnit.unidadFomento;
        }

        const unitAccount = await this.PlaUnidadesAdministradorasRepository.getById(bankAdminUnitId);

        if (unitAccount == null) throw new BadRequestError('Hubo problemas para hallar la unidad administradora.');

        return { ...unitAccount, tipoUnidadIngresos: roleSpecs.tipoUnidadIngresos };
    }
}

export default new RolesService();
