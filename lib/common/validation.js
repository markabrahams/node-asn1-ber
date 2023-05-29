"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOID = exports.isString = exports.isBoolean = exports.isNumber = exports.isBuffer = exports.isNil = void 0;
const isNil = (data) => {
    return data === null || data === undefined;
};
exports.isNil = isNil;
const isBuffer = (data) => {
    return !(0, exports.isNil)(data) && Buffer.isBuffer(data);
};
exports.isBuffer = isBuffer;
const isNumber = (data) => {
    return typeof data === 'number' && Number.isFinite(data);
};
exports.isNumber = isNumber;
const isBoolean = (data) => {
    return typeof data === 'boolean';
};
exports.isBoolean = isBoolean;
const isString = (data) => {
    return typeof data === 'string';
};
exports.isString = isString;
const isOID = (data) => {
    return /^([0-9]+\.){0,}[0-9]+$/.test(data);
};
exports.isOID = isOID;
