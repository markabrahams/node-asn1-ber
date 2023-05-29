import Reader from "./ber/reader";
import Writer from "./ber/writer";
import { InvalidAsn1Error } from "./common/errors";
import { BER_ASN1_TYPES } from "./common/asn1.types";

module.exports = {
    ...BER_ASN1_TYPES,
    BerReader: Reader,
    BerWriter: Writer,
    InvalidAsn1Error,
};
