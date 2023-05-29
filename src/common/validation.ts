export const isNil = <T>(data: T): boolean => {
    return data === null || data === undefined;
};

export const isBuffer = <T>(data: T): boolean => {
    return !isNil(data) && Buffer.isBuffer(data);
};

export const isNumber = <T>(data: T): boolean => {
    return typeof data === 'number' && Number.isFinite(data);
};

export const isBoolean = <T>(data: T): boolean => {
    return typeof data === 'boolean';
}

export const isString = <T>(data: T): boolean => {
    return typeof data === 'string';
}

export const isOID = (data: string): boolean => {
    return /^([0-9]+\.){0,}[0-9]+$/.test(data);
}