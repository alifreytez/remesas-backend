export const parseJSON = <T = any>(entity: T): T => {
    if (entity === undefined) return undefined as any;
    return JSON.parse(JSON.stringify(entity));
};

export const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};
