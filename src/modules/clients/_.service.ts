import { BaseService } from '@bases/service.base.js';
import { Database } from '@database/index.js';
import { BadRequestError } from '@errors/index.js';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';
import { Transaction } from 'sequelize';

class ClientsService extends BaseService {
    async list(filters: ProcessedQueryFilters) {
        return await this.Clients.getAll({
            ...filters,
            relations: [
                { association: '_Person' },
                { association: '_OriginCountry' }
            ]
        });
    }

    async getById(id: string | number) {
        return await this.Clients.getOne({ id }, {
            relations: [
                { association: '_Person' },
                { association: '_OriginCountry' }
            ]
        });
    }

    async create(data: any) {
        const { firstName, lastName, documentNumber, phone, originCountry } = data;

        if (!firstName || !lastName || !documentNumber || !originCountry) {
            throw new BadRequestError('Faltan datos requeridos (firstName, lastName, documentNumber, originCountry)');
        }

        const transaction = (await this.Clients.transaction()) as Transaction;
        try {
            // Check if person exists or create
            let person = await this.People.getOne({ documentNumber });
            if (!person) {
                person = await this.People.create({
                    firstName,
                    lastName,
                    documentNumber,
                    phone
                }, { transaction });
            } else {
                await this.People.update({ id: person.id }, { firstName, lastName, phone }, { transaction });
            }

            const client = await this.Clients.create({
                person: person.id,
                originCountry
            }, { transaction });

            await transaction.commit();
            return this.getById(client.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(id: string | number, data: any) {
        const { originCountry, firstName, lastName, phone } = data;
        
        const client = await this.getById(id) as Record<string, any>;
        const transaction = (await this.Clients.transaction()) as Transaction;

        try {
            if (originCountry) {
                await this.Clients.update({ id }, { originCountry }, { transaction });
            }
            if (firstName || lastName || phone) {
                await this.People.update({ id: client.person }, { firstName, lastName, phone }, { transaction });
            }
            await transaction.commit();
            return this.getById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async remove(id: string | number) {
        await this.Clients.delete({ id });
        return true;
    }

    private get Clients() {
        return Database.repository('main', 'clients') as SequelizeRepositoryBase;
    }

    private get People() {
        return Database.repository('main', 'people') as SequelizeRepositoryBase;
    }
}

export default new ClientsService();
