import { off } from "process";
import { CustomErrors } from "./errors";
import { ASN1 } from "./dataTypes";

const InvalidAsn1Error = CustomErrors.InvalidAsn1Error;

export class Reader{
    private _buf: Buffer = Buffer.from([]);
    private _len: number = 0;
    private _offset: number = 0;
    private _size: number = 0;
    public length: number;
    public offset: number;
    public remain: number;
    public buffer: Buffer;    

    constructor(
        private data: Buffer,
    ){
        this._buf = this.data

        this._len = data.length;

        this._size = data.length;

        this.length = this._len;

        this.offset = this._offset;

        this.remain = this._size - this._offset;

        this.buffer = this._buf.slice(this._size - this._offset);
    }



    /**
     * Reads a single byte and advances offset; you can pass in `true` to make this
     * a "peek" operation (i.e., get the byte, but don't advance the offset).
     *
     * @param {Boolean} peek true means don't move offset.
     * @return {Number} the next byte, null if not enough data.
     */

    readByte(peek?: boolean): number | null{
        if(this._size - this._offset < 1){
            return null
        }

        let buff = this._buf[this._offset] & 0xff;

        if(!peek){
            this._offset += 1;
        }

        return buff;
    }

    peek(){
        return this.readByte(true);
    }

    /**
     * Reads a (potentially) variable length off the BER buffer.  This call is
     * not really meant to be called directly, as callers have to manipulate
     * the internal buffer afterwards.
     *
     * As a result of this call, you can call `Reader.length`, until the
     * next thing called that does a readLength.
     *
     * @return {Number} the amount of offset to advance the buffer.
     * @throws {InvalidAsn1Error} on bad ASN.1
     */
    readLength(offset?: number): number | null{
        if(!offset){
            offset = this._offset;
        }

        if(offset >= this._size){
            return null
        }

        let lenB = this._buf[offset++] & 0xff;

        if(lenB == null){
            return null;
        }

        if((lenB & 0x80) == 0x80){
            lenB &= 0x7f;

            if(lenB == 0){
                throw InvalidAsn1Error('Indefinite length not supported');
            }

            if(this._size - offset < lenB){
                return null
            }

            this._len = 0;

            for(let i = 0; i < lenB; i++){
                this._len *= 256;

                this._len += (this._buf[offset++] & 0xff);
            }
        } else {
            this._len = lenB;
        }
        this.length = this._len;
        return offset;
    }

    /**
     * Parses the next sequence in this BER buffer.
     *
     * To get the length of the sequence, call `Reader.length`.
     *
     * @return {Number} the sequence's tag.
     */
    readSequence(tag?: number): number | null{
        const seq = this.peek();

        if(seq === null){
            return null
        }

        if(tag !== undefined && tag !== seq){
            throw InvalidAsn1Error(
                'Expected 0x' + tag.toString(16) + ': got 0x' + seq.toString(16))
        }

        const newOffset = this.readLength(this._offset + 1);

        if(newOffset === null){
            return null
        }

        this._offset = newOffset;

        return seq;
    }

    private _readTag(tag: number): number | null {
        const value = this.peek();

        if(value === null){
            return null;
        }

        if(tag !== undefined && value !== tag){
            throw InvalidAsn1Error(
                'Expected 0x' + tag.toString(16) + ': got 0x' + value.toString(16)
            );
        }

        const newOffset = this.readLength(this._offset + 1);


        if(newOffset === null){
            return null;
        }

        if(this.length === 0){
            throw InvalidAsn1Error('Zero-length integer');
        }

        if (this.length > this._size - newOffset){
            return null;
        }


        this._offset = newOffset;

        let valueToReturn = this._buf.readInt8(this._offset++);
        
        for(let i = 1; i < this.length; i++){
            valueToReturn *= 256;
            valueToReturn += this._buf[this._offset++];
        }

        if(!Number.isSafeInteger(valueToReturn)){
            throw InvalidAsn1Error('Integer not representable as javascript number');
        }

        return valueToReturn;
    }

    readInt(tag: number): number | null{

        return this._readTag(tag);
    }

    readBoolean(): boolean | null{
        const tag = ASN1.Boolean;
        return !(this._readTag(tag) === 0);
    }

    readEnumeration(): number | null{
        const tag = ASN1.Enumeration;

        return this._readTag(tag);
    }

    readString(retBuf?: boolean, tag?: number): string | Buffer | null{
        if(!tag){
            tag = ASN1.OctetString;
        }

        const buff = this.peek();
        if (buff === null)
            return null;

        if (buff !== tag)
            throw InvalidAsn1Error(
                'Expected 0x' + tag.toString(16) + ': got 0x' + buff.toString(16)
            );

        const newOffset = this.readLength(this._offset + 1); // stored in `length`

        if (newOffset === null)
            return null;

        if (this.length > this._size - newOffset)
            return null;

        this._offset = newOffset;

        if (this.length === 0)
            return retBuf ? Buffer.alloc(0) : '';

        var str = this._buf.slice(this._offset, this._offset + this.length);
        this._offset += this.length;

        return retBuf ? str : str.toString('utf8');
    }

    readOID(): string | null{
        const tag = ASN1.OID;

        const buff = this.readString(true, ASN1.OID);

        if(buff === null){
            return null;
        }

        if(!Buffer.isBuffer(buff)){
            return null;
        }

        const values = [] as number[]
        let value = 0;

        for(let i = 0; i < buff.length; i++){
            const byte = 0xff & buff[i];

            value <<= 7;

            value += byte & 0x7f;

            if((byte & 0x80) == 0){
                values.push(value >>> 0);

                value = 0;
            }
        }

        if(values.length === 0){
            return null
        }

        value = values.shift()!;

        values.unshift(value % 40);

        values.unshift((value / 40) >> 0);

        return values.join('.');
    }

    readBitString(){
        const tag = ASN1.BitString;

        const buff = this.peek();

        if(buff === null){
            return null
        }

        if(buff !== tag){
            throw InvalidAsn1Error(
                'Expected 0x' + tag.toString(16) + ': got 0x' + buff.toString(16)
            );
        }

        const newOffset = this.readLength(this._offset + 1);

        if(newOffset === null){
            return null;
        }

        if(this.length > this._size - newOffset){
            return null;
        }

        this._offset = newOffset;

        if(this.length === 0){
            return '';
        }

        const ignoredBits = this._buf[this._offset++];

        const bitStringOctets = this._buf.slice(this._offset, this._offset + this.length - 1);

        const bitString = (parseInt(bitStringOctets.toString('hex'), 16).toString(2)).padStart(bitStringOctets.length * 8, '0');

        return bitString.substring(0, bitString.length - ignoredBits);
    }
}