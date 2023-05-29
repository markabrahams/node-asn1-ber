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