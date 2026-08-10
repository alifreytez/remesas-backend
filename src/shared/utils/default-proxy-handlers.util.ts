export const QueryProviderHandler: ProxyHandler<any> = {
    get: (target: any, property: string | symbol) => {
        if (typeof property === 'symbol') {
            return Reflect.get(target, property);
        }

        if (Object.prototype.hasOwnProperty.call(target, property)) {
            const val = Reflect.get(target, property);
            return Array.isArray(val) ? val[1] : val;
        }

        const prop = property.replace(/Model$/, '');
        if (!Object.prototype.hasOwnProperty.call(target, prop)) {
            return null;
        }

        const val = Reflect.get(target, prop);
        return Array.isArray(val) ? val[0] : val;
    },
};
