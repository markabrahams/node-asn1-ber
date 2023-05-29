/// <reference types="node" />
export type NullableNumber = number | null;
export type NullableString = string | null;
export type WriterOptions = {
    size?: number;
    growthFactor?: number;
};
export default class Writer {
    private _buffer;
    private size;
    private offset;
    private sequence;
    private opts;
    constructor(options?: WriterOptions);
    get buffer(): Buffer;
    private ensure;
    private shift;
    writeByte: (byte?: number) => void;
    writeInt: (val?: number, tag?: number) => void;
    writeNull: () => void;
    writeEnumeration: (e: number, tag: number) => void;
    writeBoolean: (b?: boolean, tag?: number) => void;
    writeString: (s?: string, tag?: number) => void;
    writeBuffer: (buffer: Buffer, tag?: number) => void;
    writeStringArray: (string: string[], tag?: number) => void;
    writeOID: (oid: string, tag?: number) => void;
    writeLength: (length: number) => void;
    startSequence: (tag?: number) => void;
    endSequence: () => void;
}
