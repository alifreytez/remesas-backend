// @ts-nocheck
import { ControllerBase } from '@bases/controller.base.js';
import CatalogsService from './_.service.js';

class CatalogsController extends ControllerBase {
    constructor() {
        super();
    }

    async listAllCatalogs() {
        const filters = this.getQueryFilters();
        const session = this.getSession();
        return CatalogsService.getAvailableCatalogs(filters, session);
    }

    async getMetadata() {
        const { catalogName } = this.getParams();
        const session = this.getSession();
        return CatalogsService.getCatalogMetadata(catalogName, session);
    }

    async list() {
        const { catalogName } = this.getParams();
        const filters = this.getQueryFilters();
        const query = this.getQuery();
        const session = this.getSession();
        const include = query.include === 'true';
        const includeDeleted = query.includeDeleted === 'true';

        const result = await CatalogsService.list(catalogName, filters, include, includeDeleted, session);
        return result;
    }

    async getById() {
        const { catalogName, id } = this.getParams();
        const query = this.getQuery();
        const session = this.getSession();
        const include = query.include === 'true';
        const includeDeleted = query.includeDeleted === 'true';

        const result = await CatalogsService.getById(catalogName, id, include, includeDeleted, session);
        return result;
    }

    async create() {
        const { catalogName } = this.getParams();
        const body = this.getBody();
        const session = this.getSession();

        const result = await CatalogsService.create(catalogName, body, session);
        return this.created(result);
    }

    async update() {
        const { catalogName, id } = this.getParams();
        const body = this.getBody();
        const session = this.getSession();

        const result = await CatalogsService.update(catalogName, id, body, session);
        return this.updated(result);
    }

    async remove() {
        const { catalogName, id } = this.getParams();
        const session = this.getSession();

        await CatalogsService.remove(catalogName, id, session);
        return this.noContent();
    }

    async restore() {
        const { catalogName, id } = this.getParams();
        const session = this.getSession();

        await CatalogsService.restore(catalogName, id, session);
        return this.noContent();
    }
}

export default new CatalogsController();
