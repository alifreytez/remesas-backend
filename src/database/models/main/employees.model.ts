import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class EmployeesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            person: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Persona', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'people'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Empleados',
            appRawName: 'employees',
            tableName: 'employees',
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'People',
                options: { foreignKey: 'person', as: '_Person' },
            }
        ];
    }
}
