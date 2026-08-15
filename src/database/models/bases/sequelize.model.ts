import { Model, Sequelize, type ModelStatic, type ModelAttributes, type InitOptions, HasOne, HasMany, BelongsTo, BelongsToMany, DataTypes } from 'sequelize';
import { BaseModel, type Instance } from '@bases/model.base.js';

/**
 * Configuración extendida para modelos Sequelize, utilizada para la generación
 * automática de metadatos en módulos genéricos (ej. catálogos).
 */
type EnhanceConfig = InitOptions<Model> &
    Instance & {
        /** Si es true, el modelo se expone en las rutas genéricas de catálogos y se gestiona dinámicamente en el frontend. */
        isBasicTable?: boolean;
        /** Nombre en bruto (kebab-case) usado en las URLs de la API y el frontend (ej. 'bn-request-actions'). */
        appRawName: string;
        /** Nombre legible para humanos del modelo (ej. 'Acciones de Solicitud'). */
        name?: string;
        /** Descripción del catálogo para mostrar en el bloque frontend. */
        description?: string;
        /** (Alias de name) Nombre legible para la interfaz de usuario. */
        uiName?: string;
        /** Campo que representa visualmente este modelo al usarse como relación foránea (ej. 'nro_cuenta'). */
        displayField?: string;
        /** Campos específicos a considerar, en caso de querer limitar los atributos expuestos. */
        catalogFields?: string | Array<string>;
        /** Si es true, las rutas GET (lectura) de este catálogo no requerirán sesión ni permisos (acceso público). */
        publicAccess?: boolean;
        /** Si es true, el catálogo exige sesión obligatoria para ser consultado. */
        private?: boolean;
    };

import type { ModelAttributeColumnOptions } from 'sequelize';

export type EnhancedColumnOptions = ModelAttributeColumnOptions & {
    /**
     * Configuración específica para el comportamiento del campo en el frontend,
     * anulando o expandiendo el comportamiento inferido desde la BD (Sequelize).
     */
    enhancedData?: {
        /** Etiqueta que se mostrará en los headers de tablas y labels de inputs (ej. 'Código'). */
        uiLabel?: string;
        /** Determina si la columna es visible en la tabla de listado. Por defecto es true. */
        visible?: boolean;
        /** Determina si el campo puede llenarse/editarse desde los formularios. Por defecto true (excepto PK y fechas auto). */
        editable?: boolean;
        /** Determina si el campo es obligatorio. Por defecto asume el valor inverso de la propiedad Sequelize `allowNull`. */
        required?: boolean;
        /** Si es true, el campo es privado y solo se expondrá a usuarios autenticados. */
        private?: boolean;
        /** Posición del campo al renderizarse en tablas y formularios (menor número = primero). */
        order?: number;
        /** Fuerza un tipo de input HTML específico (anula la inferencia basada en DataType). */
        inputType?: 'text' | 'textarea' | 'number' | 'password' | 'email' | 'color' | 'select' | 'radio' | 'date' | 'json-table';
        /** Si inputType es 'select', el nombre del catálogo relacionado. */
        relatedCatalog?: string;
        /** Texto de sugerencia (placeholder) visible en el input del formulario. */
        placeholder?: string;
        /** Mensaje de ayuda extra a mostrar cerca del campo. */
        tooltip?: string;
    };
};

export type EnhanceAttributes = Record<string, EnhancedColumnOptions>;

export type ModelWithAssociate = ModelStatic<Model> &
    EnhanceConfig & {
        associate?: (models: Map<string, ModelStatic<Model>>) => void;
    };

export type ModelWithAssociations = ModelStatic<Model> & {
    hasOne: (target: ModelStatic<Model>, options?: any) => HasOne;
    hasMany: (target: ModelStatic<Model>, options?: any) => HasMany;
    belongsTo: (target: ModelStatic<Model>, options?: any) => BelongsTo;
    belongsToMany: (target: ModelStatic<Model>, options?: any) => BelongsToMany;
};

export type RelationsReturn = Array<{
    type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';
    target: string;
    options?: any;
    inversed?: boolean;
}>;

export abstract class SequelizeModelBase extends BaseModel {
    static instance?: ModelWithAssociate;

    static config(): Partial<InitOptions & EnhanceConfig> {
        return {};
    }

    static relations(): RelationsReturn {
        return [];
    }

    static definition(): EnhanceAttributes {
        return {};
    }

    static override init(dbInstance: Sequelize, dbInstanceName: string): ModelStatic<Model> {
        const { isBasicTable, appRawName, name: uiName, catalogFields, ...config } = this.config();

        const finalConfig = {
            timestamps: true,
            paranoid: true,
            underscored: true,
            createdAt: false,
            updatedAt: false,
            deletedAt: 'deletedAt',
            ...config,
        };

        const rawDefinition = this.definition();
        const processedDefinition: EnhanceAttributes = {};

        // Inyección automática del mapeo hacia SQL en snake_case para todas las propiedades en camelCase
        for (const [key, attribute] of Object.entries(rawDefinition)) {
            const snakeCaseField = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            processedDefinition[key] = {
                ...attribute,
                field: attribute.field || snakeCaseField,
            };
        }

        const finalDefinition = {
            ...processedDefinition,
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'deleted_at',
                enhancedData: { visible: false, editable: false },
            },
        };

        this.instance = dbInstance.define(this.modelName, finalDefinition as ModelAttributes, finalConfig) as ModelWithAssociate;

        if (this.relations().length > 0) this.instance.associate = (models: Map<string, ModelStatic<Model>>) => this.associate(models);

        // Asignamos el nombre de la instancia de base de datos
        this.instance.dbInstanceName = dbInstanceName;
        this.instance.isBasicTable = isBasicTable;
        this.instance.appRawName = appRawName as EnhanceConfig['appRawName'];
        this.instance.uiName = uiName;
        this.instance.displayField = config.displayField;
        this.instance.catalogFields = catalogFields;
        this.instance.publicAccess = config.publicAccess;

        return this.instance;
    }

    static associate(models: Map<string, ModelStatic<Model>>): void {
        const _source = models.get(this.modelName) as ModelWithAssociations;

        if (!_source) throw new Error(`Model ${this.modelName} not found in models registry`);

        this.relations().forEach((relation) => {
            const relationName = `${relation.target}Model`;
            const source = (relation?.inversed ? models.get(relationName) : models.get(this.modelName)) as ModelWithAssociations;
            const target = (relation?.inversed ? models.get(this.modelName) : models.get(relationName)) as ModelWithAssociations;

            if (!target) throw new Error(`Target model ${relationName} not found for relation from ${this.modelName}`);

            switch (relation.type) {
                case 'hasOne':
                    source.hasOne(target, relation.options);
                    break;
                case 'hasMany':
                    source.hasMany(target, relation.options);
                    break;
                case 'belongsTo':
                    source.belongsTo(target, relation.options);
                    break;
                case 'belongsToMany':
                    source.belongsToMany(target, relation.options);
                    break;
                default:
                    throw new Error(`Unknown relation type: ${relation.type}`);
            }
        });
    }
}
