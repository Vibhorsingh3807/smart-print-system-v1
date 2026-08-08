import jwt, { SignOptions } from 'jsonwebtoken';
import { CONFIG } from '../config/index.js';
import { Role } from '../types/enums.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role | string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: CONFIG.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, CONFIG.JWT_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, CONFIG.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, CONFIG.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, CONFIG.JWT_REFRESH_SECRET) as TokenPayload;
};
