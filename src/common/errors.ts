export class InvalidAsn1Error extends Error {
    public readonly name: string = InvalidAsn1Error.name;
    constructor(message: string) {
        super(message)
    }
}