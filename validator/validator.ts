import { body, check, oneOf } from 'express-validator';

export class Validation {
    static loginValidation = [
        body('email').isEmail().withMessage('email must be valid'),
    ];
    static preferenceValidation = [
        body('cuisineId').isArray().withMessage('cuisine must be provided'),
        body('priceRange').isArray().withMessage('price must be provided'),
    ];
}