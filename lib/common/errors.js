"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAsn1Error = void 0;
class InvalidAsn1Error extends Error {
    constructor(message) {
        super(message);
        this.name = InvalidAsn1Error.name;
    }
}
exports.InvalidAsn1Error = InvalidAsn1Error;
