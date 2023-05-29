import { E_ASN1_TYPES } from '../common/asn1.types';
import { InvalidAsn1Error } from '../common/errors';
import { encodeOctet, mergeObject } from '../common/util';
import { isBoolean, isBuffer, isNumber, isOID, isString } from '../common/validation';

export type NullableNumber = number|null;
export type NullableString = string|null;

export type WriterOptions = {
    size?: number;
    growthFactor?: number;
};

const DEFAULT_OPTIONS: WriterOptions = {
    size: 1024,
    growthFactor: 8,
};

export default class Writer {
    private _buffer: Buffer;
    private size: number;
    private offset: number;
    private sequence: number[];
    private opts: WriterOptions;
    constructor(options: WriterOptions = DEFAULT_OPTIONS) {
        this.opts = mergeObject<WriterOptions>(DEFAULT_OPTIONS, options || {});
        this._buffer = Buffer.alloc(this.opts.size! || DEFAULT_OPTIONS.size!);
        this.size = this._buffer.length;
        this.offset = 0;
        this.sequence = [];
    }

    get buffer():Buffer {
        if (this.sequence.length) {
            throw new InvalidAsn1Error(`${this.sequence.length} unedned sequence(s)`);
        }
        return this._buffer.subarray(0, this.offset);
    }

    private ensure = (length: number): void => {
        if (this.size - this.offset >= length) return;
        let size = this.size * this.opts.growthFactor!;
        if (size - this.offset < length) size += length;
        const buffer = Buffer.alloc(size);
        this._buffer.copy(buffer, 0, 0, this.offset);
        this._buffer = buffer;
        this.size = size;
    }

    private shift = (start: number, length: number, shift: number): void => {
        if (!isNumber(start) || !isNumber(length) || !isNumber(shift)) {
            throw new InvalidAsn1Error(`Invalid shift parameters.`);
        }
        this._buffer.copy(this._buffer, start + shift, start, start + length);
        this.offset += shift;
    }

    public writeByte = (byte?: number): void => {
        if (!isNumber(byte)) {
            throw new InvalidAsn1Error('Argument must be a number.');
        }
        this.ensure(1);
        this._buffer[this.offset++] = byte!;
    }

    public writeInt = (val?: number, tag?: number): void => {
        if (!Number.isInteger(val)) {
            throw new TypeError('Argument must be a valid integer');
        }
        const tagVal = isNumber(tag) ? tag : E_ASN1_TYPES.INTEGER;
        let bytes = [];
        let i = val!;
        while (i < -0x80 || i >= 0x80) {
            bytes.push(i & 0xff);
            i = Math.floor(i / 0x100);
        }
        bytes.push(i & 0xff);

        this.ensure(2 + bytes.length);
        this._buffer[this.offset++] = tagVal!;
        this._buffer[this.offset++] = bytes.length;

        for (let i = bytes.length - 1; i >= 0; i--) {
            this._buffer[this.offset++] = bytes[i];
        }
    }

    public writeNull = (): void => {
        this.writeByte(E_ASN1_TYPES.NULL);
        this.writeByte(0x00);
    }

    public writeEnumeration = (e: number, tag: number): void => {
        if (!isNumber(e)) {
            throw new TypeError('Argument must be a number');
        }
        const tagVal = isNumber(tag) ? tag: E_ASN1_TYPES.ENUMERATION;
        return this.writeInt(e, tagVal);
    }

    public writeBoolean = (b?: boolean, tag?: number): void => {
        if (!isBoolean(b)) {
            throw new TypeError('Argument must be boolean');
        }
        const tagVal = isNumber(tag) ? tag : E_ASN1_TYPES.BOOLEAN;
        this.ensure(3);
        this._buffer[this.offset++] = tagVal!;
        this._buffer[this.offset++] = 0x01;
        this._buffer[this.offset++] = b ? 0xff : 0x00;
    }

    public writeString = (s?: string, tag?: number): void => {
        if (!isString(s)) {
            throw new TypeError('Argument must be a valid string.');
        }
        const tagVal = isNumber(tag) ? tag : E_ASN1_TYPES.OCTET_STRING;
        const length = Buffer.byteLength(s!);
        this.writeByte(tagVal);
        this.writeLength(length);
        if (length) {
            this.ensure(length);
            this._buffer.write(s!, this.offset);
            this.offset += length;
        }
    }

    public writeBuffer = (buffer: Buffer, tag?: number): void => {
        if (!isBuffer(buffer)) {
            throw new TypeError('Argument must be valid buffer');
        }
        if (isNumber(tag)) {
            this.writeByte(tag);
            this.writeLength(buffer.length);
        }

        if (buffer.length > 0) {
            this.ensure(buffer.length);
            buffer.copy(this._buffer, this.offset, 0, buffer.length);
            this.offset += buffer.length;
        }
    }

    public writeStringArray = (string: string[], tag?: number): void => {
        if (!(string instanceof Array)) {
            throw new TypeError('Argument must be an Array[String]');
        }
        string.forEach((s: string) => this.writeString(s, tag));
    }

    public writeOID = (oid: string, tag?: number): void => {
        if (!isString(oid)) {
            throw new TypeError(`Argument must be of type string`);
        }

        const tagVal = isNumber(tag) ? tag : E_ASN1_TYPES.OID;

        if (!isOID(oid)) {
            throw new Error('Argument is not a valid OID string');
        }
        
        const oidNodes: string[] = oid.split('.');
        
        const bytes: number[] = [
            (Number.parseInt(oidNodes[0], 10) * 40 + Number.parseInt(oidNodes[1], 10)),
        ];

        oidNodes.slice(2).forEach((b: string) => encodeOctet(bytes, Number.parseInt(b, 10)));

        this.ensure(2 + bytes.length);

        this.writeByte(tagVal);

        this.writeLength(bytes.length);

        bytes.forEach((v: number) => this.writeByte(v));
    }

    public writeLength = (length: number): void => {
        if (!isNumber(length)) {
            throw new TypeError(`Length must be a number`);
        }
        this.ensure(4);
        if (length <= 0x7f) {
            this._buffer[this.offset++] = length;
        } else if (length <= 0xff) {
            this._buffer[this.offset++] = 0x81;
            this._buffer[this.offset++] = length;
        } else if (length <= 0xffff) {
            this._buffer[this.offset++] = 0x82;
            this._buffer[this.offset++] = length >> 8;
            this._buffer[this.offset++] = length;
        } else if (length <= 0xffffff) {
            this._buffer[this.offset++] = 0x83;
            this._buffer[this.offset++] = length >> 16;
            this._buffer[this.offset++] = length >> 8;
            this._buffer[this.offset++] = length;
        } else {
            throw new InvalidAsn1Error('Length too long (> 4 bytes)');
        }
    }

    public startSequence = (tag?: number): void => {
        const tagVal = isNumber(tag) ? tag : E_ASN1_TYPES.SEQUENCE | E_ASN1_TYPES.CONSTRUCTOR;
        this.writeByte(tagVal);
        this.sequence.push(this.offset);
        this.ensure(3);
        this.offset += 3;
    }

    public endSequence = (): void => {
        const seq = this.sequence.pop();
        const start = seq! + 3;
        const length = this.offset - start;

        if (length <= 0x7f) {
            this.shift(start, length, -2);
            this._buffer[seq!] = length;
        } else if (length <= 0xff) {
            this.shift(start, length, -1);
            this._buffer[seq!] = 0x81;
            this._buffer[seq! + 1] = length;
        } else if (length <= 0xffff) {
            this._buffer[seq!] = 0x82;
            this._buffer[seq! + 1] = length >> 8;
            this._buffer[seq! + 2] = length;
        } else if (length <= 0xffffff) {
            this.shift(start, length, 1);
            this._buffer[seq!] = 0x83;
            this._buffer[seq! + 1] = length >> 16;
            this._buffer[seq! + 2] = length >> 8;
            this._buffer[seq! + 3] = length;
        } else {
            throw new InvalidAsn1Error('Sequence too long');
        }
    }

}