"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reader_1 = __importDefault(require("./ber/reader"));
const writer_1 = __importDefault(require("./ber/writer"));
const errors_1 = require("./common/errors");
const asn1_types_1 = require("./common/asn1.types");
module.exports = Object.assign(Object.assign({}, asn1_types_1.BER_ASN1_TYPES), { BerReader: reader_1.default, BerWriter: writer_1.default, InvalidAsn1Error: errors_1.InvalidAsn1Error });
