"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asn1_types_1 = require("../common/asn1.types");
const errors_1 = require("../common/errors");
const validation_1 = require("../common/validation");
class Reader {
    constructor(data) {
        this.readTag = (tag) => {
            const byte = this.peek();
            if ((0, validation_1.isNil)(byte))
                return null;
            if (!(0, validation_1.isNil)(tag) && byte !== tag) {
                throw new errors_1.InvalidAsn1Error(`Expected 0x${tag === null || tag === void 0 ? void 0 : tag.toString(16)}, got 0x${byte === null || byte === void 0 ? void 0 : byte.toString(16)}`);
            }
            const expectedSize = this.readLength(this._offset + 1);
            if ((0, validation_1.isNil)(expectedSize))
                return null;
            if (this._length === 0) {
                throw new errors_1.InvalidAsn1Error('Zero-length integer not supported');
            }
            if (this.length > this._size - expectedSize)
                return null;
            this._offset = expectedSize;
            let value = this._buffer.readInt8(this._offset++);
            for (let i = 1; i < this.length; i++) {
                value *= 256;
                value += this._buffer[this._offset++];
            }
            if (!Number.isSafeInteger(value)) {
                throw new errors_1.InvalidAsn1Error('Integer not respresentable as Javascript number.');
            }
            return value;
        };
        this.readByte = (peek) => {
            if (this.remain < 1)
                return null;
            const byte = this._buffer[this.offset] & 0xff;
            if (!peek)
                this._offset++;
            return byte;
        };
        this.peek = () => this.readByte(true);
        this.readLength = (offset) => {
            offset = (0, validation_1.isNil)(offset) ? this._offset : offset;
            if (offset >= this._size)
                return null;
            let size = this._buffer[offset++] & 0xff;
            if ((0, validation_1.isNil)(size))
                return null;
            if ((size & 0x80) === 0x80) {
                size &= 0x7f;
                if (size === 0) {
                    throw new errors_1.InvalidAsn1Error('Indefinite length not supported');
                }
                if (this._size - offset < size)
                    return null;
                this._length = 0;
                for (let i = 0; i < size; i++) {
                    this._length *= 256;
                    this._length += (this._buffer[offset++] & 0xff);
                }
            }
            else {
                this._length = size;
            }
            return offset;
        };
        this.readSequence = (tag) => {
            const sequence = this.peek();
            if ((0, validation_1.isNil)(sequence))
                return null;
            if (!(0, validation_1.isNil)(tag) && tag !== sequence) {
                throw new errors_1.InvalidAsn1Error(`Expected 0x${tag === null || tag === void 0 ? void 0 : tag.toString(16)}, got 0x${sequence === null || sequence === void 0 ? void 0 : sequence.toString(16)}`);
            }
            const size = this.readLength(this._offset + 1);
            if ((0, validation_1.isNil)(size))
                return null;
            this._offset = size;
            return sequence;
        };
        this.readInt = (tag) => this.readTag(tag);
        this.readBoolean = (tag) => {
            const tagValue = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.BOOLEAN;
            return (this.readTag(tagValue) === 0 ? false : true);
        };
        this.readEnumeration = (tag) => {
            return !(0, validation_1.isNumber)(tag)
                ? this.readTag(asn1_types_1.E_ASN1_TYPES.ENUMERATION)
                : this.readTag(tag);
        };
        this.readString = (tag, returnBuffer) => {
            const tagValue = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.OCTET_STRING;
            const byte = this.peek();
            if ((0, validation_1.isNil)(byte))
                return null;
            if (byte !== tagValue) {
                throw new errors_1.InvalidAsn1Error(`Expected 0x${tagValue === null || tagValue === void 0 ? void 0 : tagValue.toString(16)}, got 0x${byte === null || byte === void 0 ? void 0 : byte.toString(16)}`);
            }
            const expectedSize = this.readLength(this._offset + 1);
            if ((0, validation_1.isNil)(expectedSize))
                return null;
            if (this.length > this._size - expectedSize)
                return null;
            this._offset = expectedSize;
            if (this.length === 0) {
                return returnBuffer ? Buffer.alloc(0) : '';
            }
            const str = this._buffer.subarray(this.offset, this.offset + this.length);
            this._offset += this.length;
            return returnBuffer ? str : str.toString('utf-8');
        };
        this.readOID = (tag) => {
            const tagValue = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.OID;
            const stringOrBuffer = this.readString(tagValue, true);
            if ((0, validation_1.isNil)(stringOrBuffer))
                return null;
            const values = [];
            let value = 0;
            let byte;
            for (let i = 0; i < stringOrBuffer.length; i++) {
                byte = stringOrBuffer[i] & 0xff;
                value <<= 7;
                value += byte & 0x7f;
                if ((byte & 0x80) === 0) {
                    values.push(value >>> 0);
                    value = 0;
                }
            }
            value = values.shift();
            values.unshift(value % 40);
            values.unshift((value / 40) >> 0);
            return values.join('.');
        };
        this.readBitString = (tag) => {
            let tagValue = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.BIT_STRING;
            const byte = this.peek();
            if ((0, validation_1.isNil)(byte))
                return null;
            if (byte !== tagValue) {
                throw new errors_1.InvalidAsn1Error(`Expected 0x${tagValue === null || tagValue === void 0 ? void 0 : tagValue.toString(16)}, got 0x${byte === null || byte === void 0 ? void 0 : byte.toString(16)}`);
            }
            const expectedSize = this.readLength(this._offset + 1);
            if ((0, validation_1.isNil)(expectedSize))
                return null;
            if (this.length > this._size - expectedSize)
                return null;
            this._offset = expectedSize;
            if (this.length === 0)
                return '';
            const ignoredBits = this._buffer[this._offset++];
            const bitStringOctets = this._buffer.subarray(this._offset, this._offset + this.length - 1);
            const bitString = (Number.parseInt(bitStringOctets.toString('hex'), 16).toString(2)).padStart(bitStringOctets.length * 8, '0');
            this._offset += this.length - 1;
            return bitString.substring(0, bitString.length - ignoredBits);
        };
        if (!(0, validation_1.isBuffer)(data)) {
            throw new TypeError('data must be a node buffer');
        }
        this._buffer = data;
        this._size = data.length;
        this._length = 0;
        this._offset = 0;
    }
    get length() { return this._length; }
    get offset() { return this._offset; }
    get remain() { return this._size - this._offset; }
    get buffer() { return this._buffer.subarray(this.offset); }
}
exports.default = Reader;
