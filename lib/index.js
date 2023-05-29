"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BerWriter = exports.BerReader = exports.Ber = void 0;
const reader_1 = __importDefault(require("./ber/reader"));
const writer_1 = __importDefault(require("./ber/writer"));
const errors_1 = require("./common/errors");
const asn1_types_1 = require("./common/asn1.types");
exports.Ber = {
    InvalidAsn1Error: errors_1.InvalidAsn1Error,
    E_ASN1_TYPES: asn1_types_1.E_ASN1_TYPES,
    BerReader: reader_1.default,
    BerWriter: writer_1.default,
};
exports.default = exports.Ber;
exports.BerReader = reader_1.default;
exports.BerWriter = writer_1.default;
