/// <reference types="node" />
export type NullableNumber = number | null;
export type NullableString = string | null;
export default class Reader {
    private _buffer;
    private _size;
    private _length;
    private _offset;
    constructor(data: Buffer);
    get length(): number;
    get offset(): number;
    get remain(): number;
    get buffer(): Buffer;
    private readTag;
    readByte: (peek?: boolean) => NullableNumber;
    peek: () => NullableNumber;
    readLength: (offset: number) => NullableNumber;
    readSequence: (tag?: number) => NullableNumber;
    readInt: (tag?: number) => NullableNumber;
    readBoolean: (tag?: number) => boolean;
    readEnumeration: (tag?: number) => NullableNumber;
    readString: (tag?: number, returnBuffer?: boolean) => NullableString | Buffer;
    readOID: (tag?: number) => NullableString;
    readBitString: (tag?: number) => NullableString;
}
