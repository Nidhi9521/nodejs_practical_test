import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    statusCode: number = 400;
    serializeErrors() {
        return [{
            success:false,
            page:0,
            total:0,
            message: this.message,
            data:'Not Found',
        }]
    }
}