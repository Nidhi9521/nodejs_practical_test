
import express, { Request, Response,NextFunction} from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';


interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.cookies?.jwt || req.headers['token']) {
  var token;
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else {
    token = req.headers['token'];
  }

  try {
    
    const payload = jwt.verify(token, 'JWT') as UserPayload;
    req.currentUser = payload;
    
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error.message);
    }
  }
  next();
}else{
  res.status(400).send('token not provided');
}
  
};