import Reader from "./ber/reader";
import Writer from "./ber/writer";
import { InvalidAsn1Error } from "./common/errors";
import { E_ASN1_TYPES } from "./common/asn1.types";

export const Ber = {
    InvalidAsn1Error,
    E_ASN1_TYPES,
    BerReader: Reader,
    BerWriter: Writer,
};

export default Ber;
export const BerReader = Reader;
export const BerWriter = Writer;
