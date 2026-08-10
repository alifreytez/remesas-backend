/**
 * Utilidad para el manejo de operaciones sobre objetos (transformaciones).
 * como cambiar nombres de claves, o crear múltiples representaciones de los mismos.
 */

export class RecordTransform {
    /**
     * Renombra los campos de un objeto, mientras que los que no se renombran,
     * quedan con el mismo nombre; esta es la transformación más simple, y devuelve un objeto
     * nuevo con los campos renombrados.
     * 
     * @param source - Objeto del que se van a renombrar campos
     * @param fields - Lista con los campos que se van a modificar
     * 
     * @example
     const source = {
            nombre: 'John',
            apellido: 'Doe',
            correos: ['email1@domain.com', 'email2@gmail.com'],
            telefono: '+1234567890'
     };

     renameKeys(source,
        [
            ['nombre', 'name'],
            ['apellido', 'surname'],
            ['correos', 'emails'],
        ]
     );

     // Resultado:
     // {
     //      name: 'John',
     //      surname: 'Doe',
     //      emails: ['email1@domain.com', 'email2@gmail.com'],
     //      telefono: '+1234567890'
     // }
     * 
     */

    static renameKeys = (fields: Array<[string, string]>, source: Record<string, any>) => {
        // Creamos el mapa de traducción
        const props: Record<string, any> = {};

        for (const [oldKey, newKey] of fields) props[oldKey] = newKey;

        const target: Record<string, any> = {};
        for (const prop of Object.keys(source)) {
            target[props[prop] || prop] = source[prop];
        }

        return target;
    };

    /**
     * Extrae (filtra) los pares clave: valor de un conjunto de objetos, y los coloca en un nuevo objeto,
     * tomar en cuenta que los pares se extraen en el mismo orden en que son definidos.
     * @param pairs - pares de configuración a aplicar, y objetos a tratar.
     * 
     * @param pairs[].0 - Configuración o keyConfig a aplicar sobre el Objeto source.
     * * Si un elemento del keyConfig es un string, ese será el miembro que se extraerá del source,
     * * Si un elemento del keyConfig es un [string, string], el primer elemento de este array será el miembro
     *      a extraer del source, y el segundo será un renombre para el mismo en el resultado.
     * * Si un elemento del keyConfig es un null, se extraeran todos los campo del source, y se fusionaran con el resultado.
     *      es decir, se aplicará un mixin.
     * 
     * @param pairs[].1 - Objeto o source del que se van a extraer los campos.
     * 
     * @example 
     const dataUser = {
        nombre: 'John',
        apellido: 'Doe',
        correos: ['email1@domain.com', 'email2@gmail.com'],
        telefono: '+1234567890'
     };

     const userInfo = {
        id: 123,
        roles: [1, 2, 3],
     };

     * @example <caption> **En caso de null** </caption>
     extractKeys(
                    [null, userInfo],
     );

     // Resultado:
     {
                    nombre: 'John',
                    id: 123,
                    roles: [1, 2, 3],
     }

     @example <caption> **En caso renombre** </caption>
     extractKeys(
                    [['nombre', 'name'], dataUser],
                    ['id', userInfo],
     );

     // Resultado:
     {
                    name: 'John',
                    id: 123,
     }
     */
    static extractKeys = (keyConfig: Array<string> | string, source: Record<string, any>) => {
        let target: Record<string, any> = {};

        if (typeof keyConfig === 'string') if (keyConfig in source) target[keyConfig] = source[keyConfig];

        if (Array.isArray(keyConfig)) {
            for (const extractKey of keyConfig) {
                if (extractKey in source) target[extractKey] = source[extractKey];
            }
        }

        return target;
    };

    /**
     * Excluye las claves presentes en el keyConfig, del objeto source, y luego integra todas las claves
     * en us solo objeto.
     * 
     * @example 
     const dataUser = {
        nombre: 'John',
        apellido: 'Doe',
        correos: ['email1@domain.com', 'email2@gmail.com'],
        telefono: '+1234567890'
     };

     const userInfo = {
        id: 123,
        roles: [1, 2, 3],
     };

     @example <caption> Uso típico </caption>
     exludeKeys(
        [['nombre', 'apellido'], dataUser],
        ['id', userInfo],
     );

     // Resultado:
     {
        // dataUser
        correos: ['email1@domain.com', 'email2@gmail.com'],
        telefono: '+1234567890'
        // userInfo
        roles: [1, 2, 3],
     }

     */
    static excludeKeys = (keyConfig: string | Array<string>, source: Record<string, any>) => {
        let target: Record<string, any> = {};
        let includes = Object.keys(source);
        if (typeof keyConfig === 'string') {
            includes = includes.filter((key) => key !== keyConfig);
        } else {
            includes = includes.filter((key) => !keyConfig?.includes(key));
        }

        Object.assign(target, this.extractKeys(includes, source));
        return target;
    };

    /**
     * @name RecordTrans.operation -
     *
     * @param pairs - `pairs = [keyConfig, source, operation = 'extract'][]`
     *
     * Combina las cuatro funcionalidades de RecordTrans en una sola función.
     * * El `keyConfig` define las configuraciones de los campos que se van a realizar. Para todos los valores de operation,
     *   un `keyConfig = null` significa que se extraen todos los campos de source, sin modificaciones.
     * * El `source` es la data de origen o los campos que se van a manejar.
     * * El `operation` es una cadena de texto que define que operación se va a realizar con el source.
     * * * Para un `operation = 'extract'` el `keyConfig` puede ser un `string | (string | [string, string])[] | null`.
     *     Si se exclude el `operation` en los pairs, se asume por defecto que su valor es `'extract'`
     * * * Para un `operation = 'rename'` el `keyConfig` solamente puede ser un `[string, string][] | null`.
     *
     * * * Para un `operation = 'exclude'` el `keyConfig` solamente puede ser un `string[] | null`.
     *
     */
    static op = (
        ...pairs: Array<
            | [null, Record<string, any>]
            | [Array<string> | string, Record<string, any>, 'extract'?]
            | [Array<Array<string>>, Record<string, any>, 'rename']
            | [string | Array<string>, Record<string, any>, 'exclude']
        >
    ) => {
        const target = {};
        for (const [keyConfig, source, operation] of pairs) {
            if (keyConfig === null) {
                Object.assign(target, source);
                continue;
            }
            if (operation == undefined || operation === 'extract') Object.assign(target, this.extractKeys(keyConfig, source));

            if (operation === 'rename') {
                const isMixed = keyConfig.some((value) => typeof value === 'string');
                if (isMixed) throw new Error('Todos los elementos del keyConfig deben ser [string, string] para la oepración rename');
                Object.assign(target, this.renameKeys(keyConfig as [string, string][], source));
            }

            if (operation === 'exclude') {
                if (Array.isArray(keyConfig)) {
                    const isMixed = keyConfig.some((value) => Array.isArray(value));
                    if (isMixed) throw new Error('Todos los elementos del keyConfig deben ser string para la oepración exclude');
                }
                Object.assign(target, this.excludeKeys(keyConfig, source));
            }
        }
        return target;
    };
}

export class ArrBidHandler<T> {
    private asset: Array<T | [T, T]>;

    constructor(asset: Array<T | [T, T]>) {
        this.asset = asset ?? [];
    }

    get(mode: 'native' | 'inversed' = 'native') {
        if (mode === 'native') return this.asset;

        if (mode === 'inversed') {
            return this.asset.map((value) => {
                if (Array.isArray(value)) return [value[1], value[0]];
                return value;
            });
        }
    }
}

export default RecordTransform;
