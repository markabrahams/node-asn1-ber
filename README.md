
This is a fork of the [node-asn1][node-asn1] project.  There has been little
work on that project over the years and there are a number of outstanding
issues and pull requests.

This fork attempts to address those issues and pull requests.

Please refer to the original project for documentation until this file is
updated.

[node-asn1]: https://github.com/mcavage/node-asn1







# asn1-ber

This module provides the ability to generate and parse ASN.1 BER objects.

This module is installed using [node package manager (npm)][npm]:

    npm install asn1-ber

It is loaded using the `require()` function:

    var asn1 = require("asn1-ber")

A reader or writer can then be created to read or write objects:



**TODO Write some more examples here**



[nodejs]: http://nodejs.org "Node.js"
[npm]: https://npmjs.org/ "npm"

# Constants

The following sections describe constants exported and used by this module.

## asn1.Ber

This object contains constants which can be used wherever a `tag` parameter
is required.  For example, the `asn1.BerWriter.writeBoolean()` method requires
a `tag` parameter, in this method any of the following contsants or a number
can be used, e.g.:

	writer.writeBoolean(true, asn1.Ber.Boolean)

The following constants are defined in this object:

 * `EOC`
 * `Boolean`
 * `Integer`
 * `BitString`
 * `OctetString`
 * `Null`
 * `OID`
 * `ObjectDescriptor`
 * `External`
 * `Real`
 * `Enumeration`
 * `PDV`
 * `Utf8String`
 * `RelativeOID`
 * `Sequence`
 * `Set`
 * `NumericString`
 * `PrintableString`
 * `T61String`
 * `VideotexString`
 * `IA5String`
 * `UTCTime`
 * `GeneralizedTime`
 * `GraphicString`
 * `VisibleString`
 * `GeneralString`
 * `UniversalString`
 * `CharacterString`
 * `BMPString`
 * `Constructor`
 * `Context`

# Using This Module

## Writing Objects

### new asn1.BerWriter([options])



### writer.startSequence(tag)



### writer.endSequence()



### writer.writeBoolean(b, tag)



### writer.writeBuffer(buf, tag)



### writer.writeByte(b)



### writer.writeEnumeration(i, tag)



### writer.writeInt(i, tag)



### writer.writeNull()



### writer.writeOID(s, tag)



### writer.writeString(s, tag)



### writer.writeStringArray(strings)



## Reading Objects

### new asn1.BerReader(buffer)



### reader.readByte(peek)



### reader.peek()



### reader.readLength(offset)



### reader.readSequence(tag)



### reader.readInt()



### reader.readBoolean()



### reader.readEnumeration()



### reader.readString(tag, retbuf)



### reader.readOID(tag)



# Changes

## Version 1.0.0 - 03/02/2013

 * Initial release (clone of the [asn1][asn1] repository)

[asn1]: https://github.com/mcavage/node-asn1

# License

Copyright (c) 2011 Mark Cavage <mcavage@gmail.com>

Copyright (c) 2017 Stephen Vickers <stephen.vickers.sv@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
