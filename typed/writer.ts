import { CustomErrors } from "./errors";
import { ASN1 } from "./dataTypes";
import { buffer } from "stream/consumers";

const InvalidAsn1Error = CustomErrors.InvalidAsn1Error;

export class Writer{

    private _size = 0;

    private _offset = 0;

    private _options = {
        size: 1024,
        growthFactor: 8
    };

    private _seq = [] as any[];
    constructor(
        private options?: any
    ){
        this._options = {...this._options, ...options};
        this._size = this._options.size;
    }

    private _buf = Buffer.alloc(this._options.size || 1024);;

    get buffer(): Buffer{
        if(this._seq.length){
            throw InvalidAsn1Error(this._seq.length + ' unended sequence(s)');
        }

        return (this._buf.slice(0, this._offset))
    }

    _ensure(len: number){
        if (this._size - this._offset < len) {
            let sz = this._size * this._options.growthFactor;
            if (sz - this._offset < len)
                sz += len;

            let buf = Buffer.alloc(sz);

            this._buf.copy(buf, 0, 0, this._offset);
            this._buf = buf;
            this._size = sz;
        }
    }

    _shift(start: number, len: number, shift: number){
        this._buf.copy(this._buf, start + shift, start, start + len);
        this._offset += shift;
    }

    writeByte(byteToWrite: number): void{
        this._ensure(1);       

        this._buf[this._offset++] = byteToWrite;
    }

    writeLength(lengthToWrite: number): void{
        this._ensure(4);

        if (lengthToWrite <= 0x7f) {
            this._buf[this._offset++] = lengthToWrite;
        } else if (lengthToWrite <= 0xff) {
            this._buf[this._offset++] = 0x81;
            this._buf[this._offset++] = lengthToWrite;
        } else if (lengthToWrite <= 0xffff) {
            this._buf[this._offset++] = 0x82;
            this._buf[this._offset++] = lengthToWrite >> 8;
            this._buf[this._offset++] = lengthToWrite;
        } else if (lengthToWrite <= 0xffffff) {
            this._buf[this._offset++] = 0x83;
            this._buf[this._offset++] = lengthToWrite >> 16;
            this._buf[this._offset++] = lengthToWrite >> 8;
            this._buf[this._offset++] = lengthToWrite;
        } else {
            throw InvalidAsn1Error('Length too long (> 4 bytes)');
        }
    }

    writeInt(intToWrite: number, tag?: number): void{
        if(!Number.isInteger(intToWrite)){
            throw new TypeError("Argument must be an integer")
        }

        if(!tag){
            tag = ASN1.Integer;
        }

        let bytes = [] as number[];

        while(intToWrite < -0x80 || intToWrite >= 0x80){
            bytes.push(intToWrite & 0xff);
            intToWrite = Math.floor(intToWrite / 0x100);
        }

        bytes.push(intToWrite & 0xff);

        this._ensure(2 + bytes.length);

        this._buf[this._offset++] = tag;

        this._buf[this._offset++] = bytes.length;

        while(bytes.length){
            this._buf[this._offset++] = bytes.pop()!;
        }
    }

    writeNull(){
        this.writeByte(ASN1.Null);
        this.writeByte(0x00);
    }

    writeEnumeration(enumToAdd: number): void{
        const tag = ASN1.Enumeration;

        return this.writeInt(enumToAdd, tag);
    }

    writeBoolean(boolToAdd: boolean): void{
        this._ensure(3);
        this._buf[this._offset++] = ASN1.Boolean;
        this._buf[this._offset++] = 0x01;
        this._buf[this._offset++] = boolToAdd ? 0xff : 0x00;
    }

    writeString(stringToAdd: string, tag?: number): void{
        const length = Buffer.byteLength(stringToAdd);

        if(!tag){
            tag = ASN1.OctetString;
        }

        this.writeByte(tag);

        this.writeLength(length);

        if(length){
            this._ensure(length);

            this._buf.write(stringToAdd, this._offset);

            this._offset += length;
        }
    }

    writeBuffer(bufferToAdd: Buffer, tag?: number): void{
        if (tag) {
            this.writeByte(tag);
            this.writeLength(bufferToAdd.length);
        }

        if ( bufferToAdd.length > 0 ) {
            this._ensure(bufferToAdd.length);
            bufferToAdd.copy(this._buf, this._offset, 0, bufferToAdd.length);
            this._offset += bufferToAdd.length;
        }
    }

    writeStringArray(stringsToAdd: string[], tag?: number): void{
        stringsToAdd.forEach((stringToAdd) => {
            this.writeString(stringToAdd, tag)
        })
    }

    writeOID(oidString: string, tag?: number){
        if(!tag){
            tag = ASN1.OID;
        }

        if (!/^([0-9]+\.){0,}[0-9]+$/.test(oidString))
                throw new Error('argument is not a valid OID string');

        function encodeOctet(bytes: number[], octet: number) {
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

        const tmp = oidString.split('.');
        var bytes = [] as number[];
        bytes.push(parseInt(tmp[0], 10) * 40 + parseInt(tmp[1], 10));
        tmp.slice(2).forEach(function(b) {
            encodeOctet(bytes, parseInt(b, 10));
        });

        this._ensure(2 + bytes.length);
        this.writeByte(tag);
        this.writeLength(bytes.length);
        const self = this;
        bytes.forEach(function(b) {
            self.writeByte(b);
        });
    }

    startSequence(tag?: number){
        if(!tag){
            tag = ASN1.Sequence | ASN1.Constructor
        }

        this.writeByte(tag);

        this._seq.push(this._offset);

        this._ensure(3);

        this._offset += 3;
    }

    endSequence(){
        var seq = this._seq.pop();
        var start = seq + 3;
        var len = this._offset - start;

        if (len <= 0x7f) {
            this._shift(start, len, -2);
            this._buf[seq] = len;
        } else if (len <= 0xff) {
            this._shift(start, len, -1);
            this._buf[seq] = 0x81;
            this._buf[seq + 1] = len;
        } else if (len <= 0xffff) {
            this._buf[seq] = 0x82;
            this._buf[seq + 1] = len >> 8;
            this._buf[seq + 2] = len;
        } else if (len <= 0xffffff) {
            this._shift(start, len, 1);
            this._buf[seq] = 0x83;
            this._buf[seq + 1] = len >> 16;
            this._buf[seq + 2] = len >> 8;
            this._buf[seq + 3] = len;
        } else {
            throw InvalidAsn1Error('Sequence too long');
        }
    }
}