import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authorizeMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'UNAUTHORIZED', statusCode: 401 });
  }

  try {
    const secret = process.env.JWT_SECRET || 'changeme';
    const decoded = jwt.verify(token, secret);
    // Attach user info to request if needed
    (req as any).user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
}
