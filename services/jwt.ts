import jwt from 'jsonwebtoken';

export class JwtService {
  static  token = async (payload: object) => {
    return jwt.sign(payload, 'JWT', { expiresIn: '1d' });
  };

 
}
