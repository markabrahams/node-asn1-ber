"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asn1_types_1 = require("../common/asn1.types");
const errors_1 = require("../common/errors");
const util_1 = require("../common/util");
const validation_1 = require("../common/validation");
const DEFAULT_OPTIONS = {
    size: 1024,
    growthFactor: 8,
};
class Writer {
    constructor(options = DEFAULT_OPTIONS) {
        this.ensure = (length) => {
            if (this.size - this.offset >= length)
                return;
            let size = this.size * this.opts.growthFactor;
            if (size - this.offset < length)
                size += length;
            const buffer = Buffer.alloc(size);
            this._buffer.copy(buffer, 0, 0, this.offset);
            this._buffer = buffer;
            this.size = size;
        };
        this.shift = (start, length, shift) => {
            if (!(0, validation_1.isNumber)(start) || !(0, validation_1.isNumber)(length) || !(0, validation_1.isNumber)(shift)) {
                throw new errors_1.InvalidAsn1Error(`Invalid shift parameters.`);
            }
            this._buffer.copy(this._buffer, start + shift, start, start + length);
            this.offset += shift;
        };
        this.writeByte = (byte) => {
            if (!(0, validation_1.isNumber)(byte)) {
                throw new errors_1.InvalidAsn1Error('Argument must be a number.');
            }
            this.ensure(1);
            this._buffer[this.offset++] = byte;
        };
        this.writeInt = (val, tag) => {
            if (!Number.isInteger(val)) {
                throw new TypeError('Argument must be a valid integer');
            }
            const tagVal = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.INTEGER;
            let bytes = [];
            let i = val;
            while (i < -0x80 || i >= 0x80) {
                bytes.push(i & 0xff);
                i = Math.floor(i / 0x100);
            }
            bytes.push(i & 0xff);
            this.ensure(2 + bytes.length);
            this._buffer[this.offset++] = tagVal;
            this._buffer[this.offset++] = bytes.length;
            for (let i = bytes.length - 1; i >= 0; i--) {
                this._buffer[this.offset++] = bytes[i];
            }
        };
        this.writeNull = () => {
            this.writeByte(asn1_types_1.E_ASN1_TYPES.NULL);
            this.writeByte(0x00);
        };
        this.writeEnumeration = (e, tag) => {
            if (!(0, validation_1.isNumber)(e)) {
                throw new TypeError('Argument must be a number');
            }
            const tagVal = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.ENUMERATION;
            return this.writeInt(e, tagVal);
        };
        this.writeBoolean = (b, tag) => {
            if (!(0, validation_1.isBoolean)(b)) {
                throw new TypeError('Argument must be boolean');
            }
            const tagVal = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.BOOLEAN;
            this.ensure(3);
            this._buffer[this.offset++] = tagVal;
            this._buffer[this.offset++] = 0x01;
            this._buffer[this.offset++] = b ? 0xff : 0x00;
        };
        this.writeString = (s, tag) => {
            if (!(0, validation_1.isString)(s)) {
                throw new TypeError('Argument must be a valid string.');
            }
            const tagVal = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.OCTET_STRING;
            const length = Buffer.byteLength(s);
            this.writeByte(tagVal);
            this.writeLength(length);
            if (length) {
                this.ensure(length);
                this._buffer.write(s, this.offset);
                this.offset += length;
            }
        };
        this.writeBuffer = (buffer, tag) => {
            if (!(0, validation_1.isBuffer)(buffer)) {
                throw new TypeError('Argument must be valid buffer');
            }
            if ((0, validation_1.isNumber)(tag)) {
                this.writeByte(tag);
                this.writeLength(buffer.length);
            }
            if (buffer.length > 0) {
                this.ensure(buffer.length);
                buffer.copy(this._buffer, this.offset, 0, buffer.length);
                this.offset += buffer.length;
            }
        };
        this.writeStringArray = (string, tag) => {
            if (!(string instanceof Array)) {
                throw new TypeError('Argument must be an Array[String]');
            }
            string.forEach((s) => this.writeString(s, tag));
        };
        this.writeOID = (oid, tag) => {
            if (!(0, validation_1.isString)(oid)) {
                throw new TypeError(`Argument must be of type string`);
            }
            const tagVal = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.OID;
            if (!(0, validation_1.isOID)(oid)) {
                throw new Error('Argument is not a valid OID string');
            }
            const oidNodes = oid.split('.');
            const bytes = [
                (Number.parseInt(oidNodes[0], 10) * 40 + Number.parseInt(oidNodes[1], 10)),
            ];
            oidNodes.slice(2).forEach((b) => (0, util_1.encodeOctet)(bytes, Number.parseInt(b, 10)));
            this.ensure(2 + bytes.length);
            this.writeByte(tagVal);
            this.writeLength(bytes.length);
            bytes.forEach((v) => this.writeByte(v));
        };
        this.writeLength = (length) => {
            if (!(0, validation_1.isNumber)(length)) {
                throw new TypeError(`Length must be a number`);
            }
            this.ensure(4);
            if (length <= 0x7f) {
                this._buffer[this.offset++] = length;
            }
            else if (length <= 0xff) {
                this._buffer[this.offset++] = 0x81;
                this._buffer[this.offset++] = length;
            }
            else if (length <= 0xffff) {
                this._buffer[this.offset++] = 0x82;
                this._buffer[this.offset++] = length >> 8;
                this._buffer[this.offset++] = length;
            }
            else if (length <= 0xffffff) {
                this._buffer[this.offset++] = 0x83;
                this._buffer[this.offset++] = length >> 16;
                this._buffer[this.offset++] = length >> 8;
                this._buffer[this.offset++] = length;
            }
            else {
                throw new errors_1.InvalidAsn1Error('Length too long (> 4 bytes)');
            }
        };
        this.startSequence = (tag) => {
            const tagVal = (0, validation_1.isNumber)(tag) ? tag : asn1_types_1.E_ASN1_TYPES.SEQUENCE | asn1_types_1.E_ASN1_TYPES.CONSTRUCTOR;
            this.writeByte(tagVal);
            this.sequence.push(this.offset);
            this.ensure(3);
            this.offset += 3;
        };
        this.endSequence = () => {
            const seq = this.sequence.pop();
            const start = seq + 3;
            const length = this.offset - start;
            if (length <= 0x7f) {
                this.shift(start, length, -2);
                this._buffer[seq] = length;
            }
            else if (length <= 0xff) {
                this.shift(start, length, -1);
                this._buffer[seq] = 0x81;
                this._buffer[seq + 1] = length;
            }
            else if (length <= 0xffff) {
                this._buffer[seq] = 0x82;
                this._buffer[seq + 1] = length >> 8;
                this._buffer[seq + 2] = length;
            }
            else if (length <= 0xffffff) {
                this.shift(start, length, 1);
                this._buffer[seq] = 0x83;
                this._buffer[seq + 1] = length >> 16;
                this._buffer[seq + 2] = length >> 8;
                this._buffer[seq + 3] = length;
            }
            else {
                throw new errors_1.InvalidAsn1Error('Sequence too long');
            }
        };
        this.opts = (0, util_1.mergeObject)(DEFAULT_OPTIONS, options || {});
        this._buffer = Buffer.alloc(this.opts.size || DEFAULT_OPTIONS.size);
        this.size = this._buffer.length;
        this.offset = 0;
        this.sequence = [];
    }
    get buffer() {
        if (this.sequence.length) {
            throw new errors_1.InvalidAsn1Error(`${this.sequence.length} unedned sequence(s)`);
        }
        return this._buffer.subarray(0, this.offset);
    }
}
exports.default = Writer;
