"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeOctet = exports.mergeObject = void 0;
const mergeObject = (from, to) => {
    const keys = Object.getOwnPropertyNames(from);
    keys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(to, key))
            return;
        const val = Object.getOwnPropertyDescriptor(from, key);
        Object.defineProperty(to, key, val);
    });
    return to;
};
exports.mergeObject = mergeObject;
const encodeOctet = (bytes, octet) => {
    if (octet < 128) {
        bytes.push(octet);
    }
    else if (octet < 16384) {
        bytes.push((octet >>> 7) | 0x80);
        bytes.push(octet & 0x7F);
    }
    else if (octet < 2097152) {
        bytes.push((octet >>> 14) | 0x80);
        bytes.push(((octet >>> 7) | 0x80) & 0xFF);
        bytes.push(octet & 0x7F);
    }
    else if (octet < 268435456) {
        bytes.push((octet >>> 21) | 0x80);
        bytes.push(((octet >>> 14) | 0x80) & 0xFF);
        bytes.push(((octet >>> 7) | 0x80) & 0xFF);
        bytes.push(octet & 0x7F);
    }
    else {
        bytes.push(((octet >>> 28) | 0x80) & 0xFF);
        bytes.push(((octet >>> 21) | 0x80) & 0xFF);
        bytes.push(((octet >>> 14) | 0x80) & 0xFF);
        bytes.push(((octet >>> 7) | 0x80) & 0xFF);
        bytes.push(octet & 0x7F);
    }
};
exports.encodeOctet = encodeOctet;
