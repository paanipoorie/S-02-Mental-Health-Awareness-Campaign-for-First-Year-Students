import type { Request, Response, NextFunction } from 'express';
import { authService, type RegisterInput, type LoginInput } from '../services/auth.service.js';
import { AuthError } from '../services/auth.service.js';
import { Role } from '@campus-peer-support/shared-types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterInput = {
        universityEmail: req.body.universityEmail,
        password: req.body.password,
        role: req.body.role,
      };

      const result = await authService.register(input);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            role: result.user.role,
            isVerifiedMentor: result.user.isVerifiedMentor,
          },
          anonymousIdentity: result.anonymousIdentity,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = {
        universityEmail: req.body.universityEmail,
        password: req.body.password,
      };

      const result = await authService.login(input);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            role: result.user.role,
            isVerifiedMentor: result.user.isVerifiedMentor,
          },
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken ?? req.body.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken ?? req.body.refreshToken;

      if (!refreshToken) {
        throw new AuthError('Refresh token required', 'REFRESH_TOKEN_REQUIRED', 401);
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthError('Authentication required', 'MISSING_AUTH', 401);
      }

      const result = await authService.me(req.user.userId);

      let responseData: Record<string, unknown>;

      if (result.role === Role.STUDENT) {
        responseData = {
          role: result.role,
          anonymousDisplayName: result.anonymousIdentity?.displayName ?? null,
          avatarSeed: result.anonymousIdentity?.avatarSeed ?? null,
        };
      } else if (result.role === Role.MENTOR || result.role === Role.ADMIN) {
        responseData = {
          role: result.role,
          isVerifiedMentor: result.isVerifiedMentor,
        };
      } else {
        responseData = {
          role: result.role,
        };
      }

      res.status(200).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
