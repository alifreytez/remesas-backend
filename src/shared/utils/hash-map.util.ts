import crypto from 'crypto';

/**
 * Crea un mapa que puede tener claves multidimencionales(arrays),
 * que se convierten en hash para indizarlas. Todas las claves del map estan en base64.
 *
 */

export class HashMap<I extends Array<any>, O> {
    protected dataMap: Map<string, O>;
    protected algorithm: string;

    protected serializeObject = (key: I) => {
        return crypto.createHash(this.algorithm).update(JSON.stringify(key)).digest('base64');
    };

    /**
     *
     * @param algorithm - Algoritmo de serialización para las claves del map
     * @param dataValues - Valores a colocar al inicializar el map
     */
    constructor(algorithm = 'md5', dataValues?: Array<[I, O]>) {
        this.algorithm = algorithm;
        this.dataMap = new Map();

        if (Array.isArray(dataValues) && dataValues.length > 0) {
            for (const [key, value] of dataValues) this.set(key, value);
        }
    }

    /**
     * Añade un nuevo par de clave: valor
     * a través del algoritmo antes seleccionado.
     */
    public set = (key: I, value: O) => {
        const hashKey = this.serializeObject(key);
        this.dataMap.set(hashKey, value);
        return this;
    };

    /**
     * Obtiene el valor asociado a una clave (conjunto de claves)
     * determinada, si no obtiene nada, se ejecuta el interceptor catchNonKey
     */
    public get = (...key: I): O | undefined => {
        const hashKey = this.serializeObject(key);
        return this.dataMap.get(hashKey);
    };
}
