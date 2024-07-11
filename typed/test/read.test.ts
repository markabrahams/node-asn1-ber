import { describe, it } from "node:test";
import { equal } from "node:assert";
import * as asn1 from '../index'
const BerReader = asn1.BerReader;

describe("Reader", function() {
    describe("readByte()", function(){
        it("can read a value", function(){
            const reader =  new BerReader(Buffer.from([0xde]))

            equal(reader.readByte(), 0xde);
        })
    })

	describe("readInt()", function() {
		it("can read zero", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0x00]))
			equal(reader.readInt(2), 0)
			equal(reader.length, 1)
		})

		it("can read a 1 byte positive integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0x01]))
			equal(reader.readInt(2), 1)
			equal(reader.length, 1)
		})

		it("can read a 1 byte positive integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0x34]))
			equal(reader.readInt(2), 52)
			equal(reader.length, 1)
		})

		it("can read a 1 byte positive integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0x7f]))
			equal(reader.readInt(2), 127)
			equal(reader.length, 1)
		})

		it("can read a 2 byte positive integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x02, 0x00, 0x80]))
			equal(reader.readInt(2), 128)
			equal(reader.length, 2)
		})

		it("can read a 2 byte positive integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x02, 0x7e, 0xde]))
			equal(reader.readInt(2), 0x7ede)
			equal(reader.length, 2)
		})

		it("can read a 2 byte positive integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x02, 0x7f, 0xff]))
			equal(reader.readInt(2), 32767)
			equal(reader.length, 2)
		})

		it("can read a 3 byte positive integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x03, 0x00, 0x80, 0x00]))
			equal(reader.readInt(2), 32768)
			equal(reader.length, 3)
		})

		it("can read a 3 byte positive integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x03, 0x7e, 0xde, 0x03]))
			equal(reader.readInt(2), 8314371)
			equal(reader.length, 3)
		})

		it("can read a 3 byte positive integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x03, 0x7e, 0xde, 0x03]))
			equal(reader.readInt(2), 0x7ede03)
			equal(reader.length, 0x03)
		})

		it("can read a 4 byte positive integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x04, 0x00, 0x80, 0x00, 0x00]))
			equal(reader.readInt(2), 8388608)
			equal(reader.length, 4)
		})

		it("can read a 4 byte positive integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x04, 0x7e, 0xde, 0x03, 0x01]))
			equal(reader.readInt(2), 2128478977)
			equal(reader.length, 4)
		})

		it("can read a 4 byte positive integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x04, 0x7f, 0xff, 0xff, 0xff]))
			equal(reader.readInt(2), 2147483647)
			equal(reader.length, 4)
		})

		it("can read a 5 byte positive integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x05, 0x00, 0x80, 0x00, 0x00, 0x00]))
			equal(reader.readInt(2), 2147483648)
			equal(reader.length, 5)
		})

		it("can read a 5 byte positive integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x05, 0x00, 0x8b, 0xde, 0x03, 0x01]))
			equal(reader.readInt(2), 2346582785)
			equal(reader.length, 5)
		})

		it("can read a 5 byte positive integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x05, 0x00, 0xff, 0xff, 0xff, 0xff]))
			equal(reader.readInt(2), 4294967295)
			equal(reader.length, 5)
		})

		it("can read a 1 byte negative integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0x80]))
			equal(reader.readInt(2), -128)
			equal(reader.length, 1)
		})

		it("can read a 1 byte negative integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0xdc]))
			equal(reader.readInt(2), -36)
			equal(reader.length, 1)
		})

		it("can read a 1 byte negative integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x01, 0xff]))
			equal(reader.readInt(2), -1)
			equal(reader.length, 1)
		})

		it("can read a 2 byte negative integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x02, 0x80, 0x00]))
			equal(reader.readInt(2), -32768)
			equal(reader.length, 2)
		})

		it("can read a 2 byte negative integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x02, 0xc0, 0x4e]))
			equal(reader.readInt(2), -16306)
			equal(reader.length, 2)
		})

		it("can read a 2 byte negative integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x02, 0xff, 0x7f]))
			equal(reader.readInt(2), -129)
			equal(reader.length, 2)
		})

		it("can read a 3 byte negative integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x03, 0x80, 0x00, 0x00]))
			equal(reader.readInt(2), -8388608)
			equal(reader.length, 3)
		})

		it("can read a 3 byte negative integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x03, 0xff, 0x00, 0x19]))
			equal(reader.readInt(2), -65511)
			equal(reader.length, 3)
		})

		it("can read a 3 byte negative integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x03, 0xff, 0x7f, 0xff]))
			equal(reader.readInt(2), -32769)
			equal(reader.length, 3)
		})

		it("can read a 4 byte negative integer - lowest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x04, 0x80, 0x00, 0x00, 0x00]))
			equal(reader.readInt(2), -2147483648)
			equal(reader.length, 4)
		})

		it("can read a 4 byte negative integer - middle", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x04, 0x91, 0x7c, 0x22, 0x1f]))
			equal(reader.readInt(2), -1854135777)
			equal(reader.length, 4)
		})

		it("can read a 4 byte negative integer - highest", function() {
			const reader = new BerReader(Buffer.from([0x02, 0x04, 0xff, 0x7f, 0xff, 0xff]))
			equal(reader.readInt(2), -8388609)
			equal(reader.length, 4)
		})
	})

	describe("readBoolean()", function() {
		it("can read a true value", function() {
			const reader = new BerReader(Buffer.from([0x01, 0x01, 0xff]))
			equal(reader.readBoolean(), true)
			equal(reader.length, 0x01)
		})

		it("can read a false value", function() {
			const reader = new BerReader(Buffer.from([0x01, 0x01, 0x00]))
			equal(reader.readBoolean(), false)
			equal(reader.length, 0x01)
		})
	})

    describe("readEnumeration()", function() {
		it("can read a value", function() {
			const reader = new BerReader(Buffer.from([0x0a, 0x01, 0x20]))
			equal(reader.readEnumeration(), 0x20, 'wrong value')
			equal(reader.length, 0x01, 'wrong length')
		})
	})

	describe("readOID()", function() {
		it("does not convert to unsigned", function() {
			// Make sure 2887117176 is NOT converted to -1407850120
			const buffer = Buffer.from([6, 18, 43, 6, 1, 4, 1, 245, 12, 1, 1, 5, 1, 1, 19, 138, 224, 215, 210, 120])
			const reader = new BerReader(buffer)
			equal(reader.readOID(), "1.3.6.1.4.1.14988.1.1.5.1.1.19.2887117176")
			equal(reader.length, 18)
		})
	})

	describe("readString()", function() {
		it("can read a value", function() {
			var string = 'cn=foo,ou=unit,o=test'
			var buffer = Buffer.alloc(string.length + 2)
			buffer[0] = 0x04
			buffer[1] = Buffer.byteLength(string)
			buffer.write(string, 2)

			const reader = new BerReader(buffer)
			equal(reader.readString(), string)
			equal(reader.length, string.length)
		})
	})

	describe("readSequence()", function() {
		it("can read a sequence", function() {
			const reader = new BerReader(Buffer.from([0x30, 0x03, 0x01, 0x01, 0xff]))
			equal(reader.readSequence(), 0x30)
			equal(reader.length, 0x03)
			equal(reader.readBoolean(), true)
			equal(reader.length, 0x01)
		})
	})

	describe("readBitString()", function() {
		it("can read a bit string", function() {
			const reader = new BerReader(Buffer.from([0x03, 0x07, 0x04, 0x0a, 0x3b, 0x5f, 0x29, 0x1c, 0xd0]))
			equal(reader.readBitString(), '00001010001110110101111100101001000111001101')
			equal(reader.length, 7)
		})
	})
    
    describe("complex sequences", function() {
		it("are processed correctly", function() {
			var buffer = Buffer.alloc(14);

			// An anonymous LDAP v3 BIND request
			buffer[0]  = 0x30 // Sequence
			buffer[1]  = 12   // len
			buffer[2]  = 0x02 // ASN.1 Integer
			buffer[3]  = 1    // len
			buffer[4]  = 0x04 // msgid (make up 4)
			buffer[5]  = 0x60 // Bind Request
			buffer[6]  = 7    // len
			buffer[7]  = 0x02 // ASN.1 Integer
			buffer[8]  = 1    // len
			buffer[9]  = 0x03 // v3
			buffer[10] = 0x04 // String (bind dn)
			buffer[11] = 0    // len
			buffer[12] = 0x80 // ContextSpecific (choice)
			buffer[13] = 0    // simple bind

			var reader = new BerReader(buffer)
			equal(reader.readSequence(), 48)
			equal(reader.length, 12)
			equal(reader.readInt(2), 4)
			equal(reader.readSequence(), 96)
			equal(reader.length, 7)
			equal(reader.readInt(2), 3)
			equal(reader.readString(), "")
			equal(reader.length, 0)
			equal(reader.readByte(), 0x80)
			equal(reader.readByte(), 0)
			equal(null, reader.readByte())
		})
	})

    describe("long strings", function() {
		it("can be parsed", function() {
			const buffer = Buffer.alloc(256)
			const string = "2;649;CN=Red Hat CS 71GA Demo,O=Red Hat CS 71GA Demo,C=US;"
					+ "CN=RHCS Agent - admin01,UID=admin01,O=redhat,C=US [1] This is "
					+ "Teena Vradmin's description."
			buffer[0] = 0x04
			buffer[1] = 0x81
			buffer[2] = 0x94
			buffer.write(string, 3)

			const reader = new BerReader(buffer.slice(0, 3 + string.length));
			equal(reader.readString(), string)
		})
	})
})