import Reader from "./ber/reader";
import Writer from "./ber/writer";
import { InvalidAsn1Error } from "./common/errors";
import { E_ASN1_TYPES } from "./common/asn1.types";
export declare const Ber: {
    InvalidAsn1Error: typeof InvalidAsn1Error;
    E_ASN1_TYPES: typeof E_ASN1_TYPES;
    BerReader: typeof Reader;
    BerWriter: typeof Writer;
};
export default Ber;
export declare const BerReader: typeof Reader;
export declare const BerWriter: typeof Writer;
