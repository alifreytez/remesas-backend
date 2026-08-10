import { Database } from '@database/index.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';
import { RolesUsersImplements, RolesPermissionsImplements } from '@rules/repositories-contracts.type.js';
import { CacheDatabaseProvider } from '@providers/cache-database.provider.js';

export class PermissionsService {
    private static get cacheClient() {
        return CacheDatabaseProvider.getInstance().client;
    }

    /**
     * Cachea en Redis exclusivamente las tablas de catálogo estructural y de asignaciones por rol
     */
    private static async getCachedRbacTable(tableName: string, repoName: string): Promise<Array<Record<string, any>>> {
        const cacheKey = `rbac:table:${tableName}`;
        try {
            const cached = await PermissionsService.cacheClient.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            // Continuar si redis falla
        }

        const repo = Database.repository('main', repoName) as any;
        const rows = await repo.getModel().findAll({ raw: true });

        try {
            await PermissionsService.cacheClient.set(cacheKey, JSON.stringify(rows), 'EX', 3600);
        } catch (e) {
            // Ignorar error al escribir caché
        }

        return rows;
    }

    private static async getRbacCachedCatalogs() {
        const [rolesPermissions, roleInheritances, permissions, actions, resources, permissionTypes] = await Promise.all([
            PermissionsService.getCachedRbacTable('role_permissions', 'role-permissions'),
            PermissionsService.getCachedRbacTable('role_inheritances', 'role-inheritances'),
            PermissionsService.getCachedRbacTable('permissions', 'permissions'),
            PermissionsService.getCachedRbacTable('actions', 'actions'),
            PermissionsService.getCachedRbacTable('resources', 'resources'),
            PermissionsService.getCachedRbacTable('permission_types', 'permission-types'),
        ]);

        const accMap = new Map<string | number, string>(actions.map((a: any) => [a.id, a.code]));
        const recMap = new Map<string | number, string>(resources.map((r: any) => [r.id, r.code]));
        const tipMap = new Map<string | number, string>(permissionTypes.map((t: any) => [t.id, t.code]));

        const permStringMap = new Map<string | number, string>();
        permissions.forEach((p: any) => {
            const tipCode = tipMap.get(p.permissionType);
            const accCode = accMap.get(p.action);
            const recCode = recMap.get(p.resource);
            if (tipCode && accCode && recCode) {
                permStringMap.set(p.id, `${tipCode}:${accCode}:${recCode}`);
            }
        });

        return { rolesPermissions, roleInheritances, permStringMap };
    }

    /**
     * Obtiene los permisos del usuario aplicando la fórmula:
     * (permisos de los roles asociados directamente al usuario + permisos por herencia de roles + permisos granulares concedidos al usuario) - (permisos excluidos al usuario)
     * NOTA: user_roles y user_permissions NO son caducables/cacheadas, se consultan en vivo.
     */
    static async getSessionPermissions(userId: string | number) {
        const UserRoles = Database.repository('main', 'user-roles') as any; // SequelizeRepositoryBase & RolesUsersImplements
        const UserPermissions = Database.repository('main', 'user-permissions') as any;

        // 1. Consultas EN VIVO (NO cacheadas)
        const foundRolesData = await UserRoles.getAllActive({}, { userId: userId });
        const foundRoles = Array.isArray(foundRolesData) ? foundRolesData : (foundRolesData?.rows || []);
        const rolesData = foundRoles.map((rol: any) => ({ id: rol._Roles?.id || rol.role, code: rol._Roles?.code || 'UNKNOWN' }));

        const userGranular = await UserPermissions.getAllActive({}, { userId: userId });
        const granularList = (Array.isArray(userGranular) ? userGranular : userGranular?.rows || []) as Array<Record<string, any>>;

        // 2. Cargar datos de tablas cacheadas desde Redis
        const { rolesPermissions, roleInheritances, permStringMap } = await PermissionsService.getRbacCachedCatalogs();

        const includedPermissions = new Set<string>();
        const excludedPermissions = new Set<string>();

        // Función recursiva en memoria para herencia de roles
        const getInheritedRoleIds = (roleId: number | string, visited = new Set<string>()): Array<string | number> => {
            const result: Array<string | number> = [];
            const strId = String(roleId);
            if (visited.has(strId)) return result;
            visited.add(strId);

            roleInheritances.forEach((row: any) => {
                if (String(row.childRole) === strId && row.parentRole != null) {
                    result.push(row.parentRole);
                    result.push(...getInheritedRoleIds(row.parentRole, visited));
                }
            });
            return result;
        };

        // Fórmula parte 1 y 2
        const allAssociatedRoleIds = new Set<string>();
        rolesData.forEach((role: any) => {
            allAssociatedRoleIds.add(String(role.id));
            getInheritedRoleIds(role.id).forEach((inhId) => allAssociatedRoleIds.add(String(inhId)));
        });

        rolesPermissions.forEach((rp: any) => {
            if (rp.role != null && allAssociatedRoleIds.has(String(rp.role))) {
                const pStr = permStringMap.get(rp.permission);
                if (pStr) includedPermissions.add(pStr);
            }
        });

        // Fórmula parte 3 y 4
        granularList.forEach((per: any) => {
            const permId = per.permission || (per._Permissions ? per._Permissions.id : null);
            let permString = permId != null ? permStringMap.get(permId) : null;

            if (!permString && per._Permissions?._PermissionTypes && per._Permissions?._Actions && per._Permissions?._Resources) {
                permString = `${per._Permissions._PermissionTypes.code}:${per._Permissions._Actions.code}:${per._Permissions._Resources.code}`;
            }

            if (permString) {
                if (per.isGranted === true || per.isGranted === 'true' || per.isGranted === 1 || per.isGranted === '1') {
                    includedPermissions.add(permString);
                } else {
                    excludedPermissions.add(permString);
                }
            }
        });

        // Fórmula final
        excludedPermissions.forEach((ex) => includedPermissions.delete(ex));

        return {
            roles: rolesData,
            permissions: Array.from(includedPermissions),
        };
    }

    static async getRolePermissions(roleId: number | string): Promise<string[]> {
        const { rolesPermissions, roleInheritances, permStringMap } = await PermissionsService.getRbacCachedCatalogs();

        const getInheritedRoleIds = (targetId: number | string, visited = new Set<string>()): Array<string | number> => {
            const result: Array<string | number> = [];
            const strId = String(targetId);
            if (visited.has(strId)) return result;
            visited.add(strId);

            roleInheritances.forEach((row: any) => {
                if (String(row.childRole) === strId && row.parentRole != null) {
                    result.push(row.parentRole);
                    result.push(...getInheritedRoleIds(row.parentRole, visited));
                }
            });
            return result;
        };

        const targetRoleIds = new Set<string>([String(roleId), ...getInheritedRoleIds(roleId).map((id) => String(id))]);
        const permissions = new Set<string>();

        rolesPermissions.forEach((rp: any) => {
            if (rp.role != null && targetRoleIds.has(String(rp.role))) {
                const pStr = permStringMap.get(rp.permission);
                if (pStr) permissions.add(pStr);
            }
        });

        return Array.from(permissions);
    }

    static async invalidateRbacCache(tables?: string | string[]): Promise<void> {
        try {
            if (!tables) {
                const keys = await PermissionsService.cacheClient.keys('rbac:table:*');
                if (keys.length > 0) {
                    await PermissionsService.cacheClient.del(...keys);
                }
            } else {
                const list = Array.isArray(tables) ? tables : [tables];
                const keysToDelete = list.map((t) => `rbac:table:${t}`);
                await PermissionsService.cacheClient.del(...keysToDelete);
            }
        } catch (e) {
            // Ignorar errores al invalidar en Redis
        }
    }

    static async invalidateRoleCache(_roleId?: number | string): Promise<void> {
        await PermissionsService.invalidateRbacCache();
    }
}

export default PermissionsService;
