import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AuditLog } from '../models/System';

export const logAudit = (action: string, getDetails: (req: AuthRequest) => string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Let the route complete first
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const email = req.user ? req.user.email : 'Anonymous/System';
          const userId = req.user ? req.user._id : undefined;
          const details = getDetails(req);
          const ipAddress = req.ip || req.socket.remoteAddress;

          await AuditLog.create({
            user: userId,
            email,
            action,
            details,
            ipAddress
          });
        } catch (error) {
          console.error('Failed to write audit log:', error);
        }
      }
    });

    next();
  };
};
