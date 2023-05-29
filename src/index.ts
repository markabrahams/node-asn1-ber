import Reader from "./ber/reader";
import Writer from "./ber/writer";
import { InvalidAsn1Error } from "./common/errors";
import { BER_ASN1_TYPES } from "./common/asn1.types";

export const Ber = {
    ...BER_ASN1_TYPES,
    InvalidAsn1Error,
    BerReader: Reader,
    BerWriter: Writer,
};

export default Ber;
export const BerReader = Reader;
export const BerWriter = Writer;
