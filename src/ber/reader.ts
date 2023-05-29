import { E_ASN1_TYPES } from '../common/asn1.types';
import { InvalidAsn1Error } from "../common/errors";
import { isBuffer, isNil, isNumber } from '../common/validation';

export type NullableNumber = number|null;
export type NullableString = string|null;

export default class Reader {
    private _buffer: Buffer;
    private _size: number;
    // @NOTE: holders current state
    private _length: number;
    private _offset: number;
    constructor(data: Buffer) {
        if (!isBuffer(data)) {
            throw new TypeError('data must be a node buffer');
        }
        this._buffer = data;
        this._size = data.length;
        this._length = 0;
        this._offset = 0;
    }

    get length(): number { return this._length; }
    get offset(): number { return this._offset; }
    get remain(): number { return this._size - this._offset; }
    get buffer(): Buffer { return this._buffer.subarray(this.offset); }

    private readTag = (tag?: number): NullableNumber => {
        const byte = this.peek();

        if (isNil(byte)) return null;
        
        if (!isNil(tag) && byte !== tag) {
            throw new InvalidAsn1Error(`Expected 0x${tag?.toString(16)}, got 0x${byte?.toString(16)}`);
        }

        const expectedSize = this.readLength(this._offset + 1);
        
        if (isNil(expectedSize)) return null;

        if (this._length === 0) {
            throw new InvalidAsn1Error('Zero-length integer not supported');
        }
        
        if (this.length > this._size - expectedSize!) return null;
        
        this._offset = expectedSize!;

        let value = this._buffer.readInt8(this._offset++);

        for (let i = 1; i < this.length; i++) {
            value *= 256;
            value += this._buffer[this._offset++];
        }

        if (!Number.isSafeInteger(value)) {
            throw new InvalidAsn1Error('Integer not respresentable as Javascript number.');
        }
        return value;
    }

    public readByte = (peek?: boolean): NullableNumber => {
        if (this.remain < 1) return null;
        const byte = this._buffer[this.offset] & 0xff;
        if (!peek) this._offset++;
        return byte;
    }

    public peek = (): NullableNumber => this.readByte(true);

    public readLength = (offset: number): NullableNumber => {
        offset = isNil(offset) ? this._offset : offset;

        if (offset >= this._size) return null;
        
        let size = this._buffer[offset++] & 0xff;

        if (isNil(size)) return null;

        if ((size & 0x80) === 0x80) {
            size &= 0x7f;

            if (size === 0) {
                throw new InvalidAsn1Error('Indefinite length not supported');
            }

            if (this._size - offset < size) return null;

            this._length = 0;

            for (let i = 0; i < size; i++) {
                this._length *= 256;
                this._length += (this._buffer[offset++] & 0xff);
            }
        } else {
            this._length = size;
        }

        return offset;
    }

    public readSequence = (tag?: number): NullableNumber => {
        const sequence = this.peek();

        if (isNil(sequence)) return null;

        if (!isNil(tag) && tag !== sequence) {
            throw new InvalidAsn1Error(`Expected 0x${tag?.toString(16)}, got 0x${sequence?.toString(16)}`);
        }

        const size = this.readLength(this._offset + 1);

        if (isNil(size)) return null;
        
        this._offset = (size as number);

        return sequence;
    }

    public readInt = (tag?: number): NullableNumber => this.readTag(tag);

    public readBoolean = (tag?: number): boolean => {
        const tagValue = isNumber(tag) ? tag : E_ASN1_TYPES.BOOLEAN;
        return (this.readTag(tagValue) === 0 ? false : true);
    }

    public readEnumeration = (tag?: number): NullableNumber => {
        return !isNumber(tag)
        ? this.readTag(E_ASN1_TYPES.ENUMERATION)
        : this.readTag(tag);
    }

    public readString = (tag?: number, returnBuffer?: boolean): NullableString|Buffer => {
        const tagValue = isNumber(tag) ? tag : E_ASN1_TYPES.OCTET_STRING;
        const byte = this.peek();
        if (isNil(byte)) return null;
        if (byte !== tagValue) {
            throw new InvalidAsn1Error(`Expected 0x${tagValue?.toString(16)}, got 0x${byte?.toString(16)}`);
        }

        const expectedSize = this.readLength(this._offset + 1);
        if (isNil(expectedSize)) return null;

        if (this.length > this._size - expectedSize!) return null;

        this._offset = expectedSize!;

        if (this.length === 0) {
            return returnBuffer ? Buffer.alloc(0): '';
        }
        const str = this._buffer.subarray(this.offset, this.offset + this.length);
        this._offset += this.length;
        return returnBuffer ? str : str.toString('utf-8');
    }

    public readOID = (tag?: number): NullableString => {
        const tagValue = isNumber(tag) ? tag : E_ASN1_TYPES.OID;
        const stringOrBuffer = this.readString(tagValue!, true);
        if (isNil(stringOrBuffer)) return null;
        const values = [];
        let value = 0;
        let byte: number;
        for (let i = 0; i < stringOrBuffer!.length; i++) {
            byte = (stringOrBuffer as Buffer)[i] & 0xff;
            value <<= 7;
            value += byte & 0x7f;
            if ((byte & 0x80) === 0) {
                values.push(value >>> 0);
                value = 0;
            }
        }

        value = values.shift()!;
        values.unshift(value % 40);
        values.unshift((value / 40) >> 0);
        return values.join('.');
    }

    public readBitString = (tag?: number): NullableString => {
        let tagValue = isNumber(tag) ? tag : E_ASN1_TYPES.BIT_STRING;

        const byte = this.peek();

        if (isNil(byte)) return null;

        if (byte !== tagValue) {
            throw new InvalidAsn1Error(`Expected 0x${tagValue?.toString(16)}, got 0x${byte?.toString(16)}`);
        }
        const expectedSize = this.readLength(this._offset + 1);
        if (isNil(expectedSize)) return null;
        if (this.length > this._size - expectedSize!) return null;

        this._offset = expectedSize!;

        if (this.length === 0) return '';
        
        const ignoredBits = this._buffer[this._offset++];
        const bitStringOctets = this._buffer.subarray(this._offset, this._offset + this.length  - 1);
        const bitString = (Number.parseInt( bitStringOctets.toString('hex'), 16).toString(2)).padStart(bitStringOctets.length * 8, '0');
        this._offset += this.length - 1;

        return bitString.substring(0, bitString.length - ignoredBits);
    }
}