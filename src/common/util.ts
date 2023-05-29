/**
 * Merges properties from one object to another
 * @WARN: will modify the `to` parameter in-place
 * @param {T} from - source object to inherit from 
 * @param {T} to - destination object to embed properties into 
 * @returns {T} - modified `to` parameter
 */
export const mergeObject = <T extends Object>(from: T, to: T): T => {
    const keys = Object.getOwnPropertyNames(from);
    keys.forEach((key: string) => {
        if (Object.prototype.hasOwnProperty.call(to, key)) return;
        const val = Object.getOwnPropertyDescriptor(from, key);
        Object.defineProperty(to, key, val!);
    });
    return to;
}

export const encodeOctet = (bytes: number[], octet: number): void => {
    if (octet < 128) {
        bytes.push(octet);
    } else if (octet < 16384) {
        bytes.push((octet >>> 7) | 0x80);
        bytes.push(octet & 0x7F);
    } else if (octet < 2097152) {
        bytes.push((octet >>> 14) | 0x80);
        bytes.push(((octet >>> 7) | 0x80) & 0xFF);
        bytes.push(octet & 0x7F);
    } else if (octet < 268435456) {
        bytes.push((octet >>> 21) | 0x80);
        bytes.push(((octet >>> 14) | 0x80) & 0xFF);
        bytes.push(((octet >>> 7) | 0x80) & 0xFF);
        bytes.push(octet & 0x7F);
    } else {
        bytes.push(((octet >>> 28) | 0x80) & 0xFF);
        bytes.push(((octet >>> 21) | 0x80) & 0xFF);
        bytes.push(((octet >>> 14) | 0x80) & 0xFF);
        bytes.push(((octet >>> 7) | 0x80) & 0xFF);
        bytes.push(octet & 0x7F);
    }
}