
var assert = require('assert');

var ASN1 = require('./types');
var errors = require('./errors');


///--- Globals

var InvalidAsn1Error = errors.InvalidAsn1Error;



///--- API

function Reader(data) {
	if (!data || !Buffer.isBuffer(data))
		throw new TypeError('data must be a node Buffer');

	this._buf = data;
	this._size = data.length;

	// These hold the "current" state
	this._len = 0;
	this._offset = 0;
}

Object.defineProperty(Reader.prototype, 'length', {
	enumerable: true,
	get: function () { return (this._len); }
});

Object.defineProperty(Reader.prototype, 'offset', {
	enumerable: true,
	get: function () { return (this._offset); }
});

Object.defineProperty(Reader.prototype, 'remain', {
	get: function () { return (this._size - this._offset); }
});

Object.defineProperty(Reader.prototype, 'buffer', {
	get: function () { return (this._buf.slice(this._offset)); }
});


/**
 * Reads a single byte and advances offset; you can pass in `true` to make this
 * a "peek" operation (i.e., get the byte, but don't advance the offset).
 *
 * @param {Boolean} peek true means don't move offset.
 * @return {Number} the next byte, null if not enough data.
 */
Reader.prototype.readByte = function(peek) {
	if (this._size - this._offset < 1)
		return null;

	var b = this._buf[this._offset] & 0xff;

	if (!peek)
		this._offset += 1;

	return b;
};


Reader.prototype.peek = function() {
	return this.readByte(true);
};


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
Reader.prototype.readLength = function(offset) {
	if (offset === undefined)
		offset = this._offset;

	if (offset >= this._size)
		return null;

	var lenB = this._buf[offset++] & 0xff;
	if (lenB === null)
		return null;

	if ((lenB & 0x80) == 0x80) {
		lenB &= 0x7f;

		if (lenB == 0)
			throw InvalidAsn1Error('Indefinite length not supported');

		// Caused problems for node-net-snmp issue #172
		// if (lenB > 4)
		// 	throw InvalidAsn1Error('encoding too long');

		if (this._size - offset < lenB)
			return null;

		this._len = 0;
		for (var i = 0; i < lenB; i++) {
			this._len *= 256;
			this._len += (this._buf[offset++] & 0xff);
		}

	} else {
		// Wasn't a variable length
		this._len = lenB;
	}

	return offset;
};


/**
 * Parses the next sequence in this BER buffer.
 *
 * To get the length of the sequence, call `Reader.length`.
 *
 * @return {Number} the sequence's tag.
 */
Reader.prototype.readSequence = function(tag) {
	var seq = this.peek();
	if (seq === null)
		return null;
	if (tag !== undefined && tag !== seq)
		throw InvalidAsn1Error('Expected 0x' + tag.toString(16) +
															': got 0x' + seq.toString(16));

	var o = this.readLength(this._offset + 1); // stored in `length`
	if (o === null)
		return null;

	this._offset = o;
	return seq;
};


Reader.prototype.readInt = function(tag) {
	// if (typeof(tag) !== 'number')
	// 	tag = ASN1.Integer;

	return this._readTag(tag);
};


Reader.prototype.readBoolean = function(tag) {
	if (typeof(tag) !== 'number')
		tag = ASN1.Boolean;

	return (this._readTag(tag) === 0 ? false : true);
};


Reader.prototype.readEnumeration = function(tag) {
	if (typeof(tag) !== 'number')
		tag = ASN1.Enumeration;

	return this._readTag(tag);
};


Reader.prototype.readString = function(tag, retbuf) {
	if (!tag)
		tag = ASN1.OctetString;

	var b = this.peek();
	if (b === null)
		return null;

	if (b !== tag)
		throw InvalidAsn1Error('Expected 0x' + tag.toString(16) +
															': got 0x' + b.toString(16));

	var o = this.readLength(this._offset + 1); // stored in `length`

	if (o === null)
		return null;

	if (this.length > this._size - o)
		return null;

	this._offset = o;

	if (this.length === 0)
		return retbuf ? Buffer.alloc(0) : '';

	var str = this._buf.slice(this._offset, this._offset + this.length);
	this._offset += this.length;

	return retbuf ? str : str.toString('utf8');
};

Reader.prototype.readOID = function(tag) {
	if (!tag)
		tag = ASN1.OID;

	var b = this.readString(tag, true);
	if (b === null)
		return null;

	var values = [];
	var value = 0;

	for (var i = 0; i < b.length; i++) {
		var byte = b[i] & 0xff;

		value <<= 7;
		value += byte & 0x7f;
		if ((byte & 0x80) == 0) {
			values.push(value >>> 0);
			value = 0;
		}
	}

	value = values.shift();
	values.unshift(value % 40);
	values.unshift((value / 40) >> 0);

	return values.join('.');
};

Reader.prototype.readBitString = function(tag) {
	if (!tag)
		tag = ASN1.BitString;

	var b = this.peek();
	if (b === null)
		return null;

	if (b !== tag)
		throw InvalidAsn1Error('Expected 0x' + tag.toString(16) +
															': got 0x' + b.toString(16));

	var o = this.readLength(this._offset + 1);

	if (o === null)
		return null;

	if (this.length > this._size - o)
		return null;

	this._offset = o;

	if (this.length === 0)
		return '';

	var ignoredBits = this._buf[this._offset++];

	var bitStringOctets = this._buf.slice(this._offset, this._offset + this.length - 1);
	var bitString = (parseInt(bitStringOctets.toString('hex'), 16).toString(2)).padStart(bitStringOctets.length * 8, '0');
	this._offset += this.length - 1;

	return bitString.substring(0, bitString.length - ignoredBits);
};

Reader.prototype._readTag = function(tag) {
	// assert.ok(tag !== undefined);

	var b = this.peek();

	if (b === null)
		return null;

	if (tag !== undefined && b !== tag)
		throw InvalidAsn1Error('Expected 0x' + tag.toString(16) +
															': got 0x' + b.toString(16));

	var o = this.readLength(this._offset + 1); // stored in `length`
	if (o === null)
		return null;

	if (this.length === 0)
		throw InvalidAsn1Error('Zero-length integer');

	if (this.length > this._size - o)
		return null;
	this._offset = o;

	var value = this._buf.readInt8(this._offset++);
	for (var i = 1; i < this.length; i++) {
		value *= 256;
		value += this._buf[this._offset++];
	}

	if ( ! Number.isSafeInteger(value) )
		throw InvalidAsn1Error('Integer not representable as javascript number');

	return value;
};



///--- Exported API

module.exports = Reader;
