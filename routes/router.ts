import express, { Request, Response, Router } from 'express';
import TestDatabase from '../database/database';
import { verifyToken } from '../middleware/current-user';
import { validateRequest } from '../middleware/validate-request';
import { Validation } from '../validator/validator';

const router = Router();

router.get('/',);

router.post('/login',Validation.loginValidation,validateRequest,TestDatabase.login);
router.post('/account/:token',TestDatabase.loginToken);
router.get('/cuisine',verifyToken,TestDatabase.getCuisine);
router.post('/preference',Validation.preferenceValidation,validateRequest,verifyToken,TestDatabase.setPreference);
router.get('/resturant/get',verifyToken,TestDatabase.getResturant);

export default router;