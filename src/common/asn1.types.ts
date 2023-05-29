/**
 * -- A List of ASN1 Data Types --
 * Any value with out-of-order OR new order is marked with a note comment
 * @WARN: Before chaning or re-ordering, keep the values in mind
 */
export enum E_ASN1_TYPES {
    EOC = 0,
    BOOLEAN,
    INTEGER,
    BIT_STRING,
    OCTET_STRING,
    NULL,
    OID,
    OBJECT_DESCRIPTOR,
    EXTERNAL,
    REAL,
    ENUMERATION,
    PDV,
    UTF8_STRING,
    RELATIVE_OID,
    // @NOTE: Order change
    SEQUENCE = 16,
    SET,
    NUMERIC_STRING,
    PRINTABLE_STRING,
    T61_STRING,
    VIDEO_TEXT_STRING,
    IA5_STRING,
    UTC_TIME,
    GENERALIZED_TIME,
    GRAPHIC_STRING,
    VISIBLE_STRING,
    // @NOTE: Order change
    GENERAL_STRING = 28,
    UNIVERSAL_STRING,
    CHARATER_STRING,
    BMP_STRING,
    CONSTRUCTOR,
    // @NOTE: order change
    CONTEXT = 128,

}

export type BER_ASN1_TYPES = {[key: string]: E_ASN1_TYPES };

export const BER_ASN1_TYPES: BER_ASN1_TYPES = {
    EOC: 0,
    Boolean: 1,
    Integer: 2,
    BitString: 3,
    OctetString: 4,
    Null: 5,
    OID: 6,
    ObjectDescriptor: 7,
    External: 8,
    Real: 9,
    Enumeration: 10,
    PDV: 11,
    Utf8String: 12,
    RelativeOID: 13,
    Sequence: 16,
    Set: 17,
    NumericString: 18,
    PrintableString: 19,
    T61String: 20,
    VideotexString: 21,
    IA5String: 22,
    UTCTime: 23,
    GeneralizedTime: 24,
    GraphicString: 25,
    VisibleString: 26,
    GeneralString: 28,
    UniversalString: 29,
    CharacterString: 30,
    BMPString: 31,
    Constructor: 32,
    Context: 128,
}