// src/core/users/user.service.ts
import bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { ok, err, Result } from '@/lib/result';
import { signSession, SessionPayload } from '@/lib/auth';
import { ExchangeService } from '@/core/exchanges/exchange.service';
import {
  SignupSchema,
  LoginSchema,
  GoogleAuthSchema
} from './user.validators';
import { UserErrorCode } from './user.errors';
import type { AuthUser } from './user.types';

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

export const UserService = {
  /**
   * SIGNUP
   */
  async signup(input: unknown): Promise<Result<{ token: string; user: AuthUser }>> {
    try {
      const { name, email, password, invite } = SignupSchema.parse(input);

      const existing = await UserRepository.findByEmail(email);
      if (existing.rows.length > 0) {
        return err(`[${UserErrorCode.EMAIL_EXISTS}] El correo ya está registrado`);
      }

      const hash = await bcrypt.hash(password, 12);

      const created = await UserRepository.create({
        name,
        email,
        password_hash: hash
      });

      const user = created.rows[0];

      const payload: SessionPayload = {
        sub: user.id,
        email: user.email,
        name: user.name
      };

      const token = signSession(payload);

      if (invite) {
        await ExchangeService.joinByInviteCode(user.id, invite);
      }

      return ok({ token, user });

    } catch (e: any) {
      console.error('UserService.signup error:', e);
      return err(`[${UserErrorCode.INTERNAL}] Error interno`);
    }
  },

  /**
   * LOGIN
   */
  async login(input: unknown): Promise<Result<{ token: string; user: AuthUser }>> {
    try {
      const { email, password, invite } = LoginSchema.parse(input);

      const found = await UserRepository.findByEmail(email);
      if (found.rows.length === 0) {
        return err(`[${UserErrorCode.INVALID_CREDENTIALS}] Credenciales incorrectas`);
      }

      const user = found.rows[0];

      if (!user.password_hash) {
        return err('Tu cuenta usa Google. Inicia sesión con Google.');
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return err(`[${UserErrorCode.INVALID_CREDENTIALS}] Credenciales incorrectas`);
      }

      const payload: SessionPayload = {
        sub: user.id,
        email: user.email,
        name: user.name
      };

      const token = signSession(payload);

      if (invite) {
        await ExchangeService.joinByInviteCode(user.id, invite);
      }

      return ok({ token, user });

    } catch (e) {
      console.error('UserService.login error:', e);
      return err(`[${UserErrorCode.INTERNAL}] Error interno`);
    }
  },

  /**
   * GOOGLE LOGIN / SIGNUP
   */
  async loginWithGoogle(input: unknown): Promise<Result<{ token: string; user: AuthUser }>> {
    try {
      const { name, email, googleId, invite } = GoogleAuthSchema.parse(input);

      const found = await UserRepository.findByEmail(email);

      let user;

      if (found.rows.length === 0) {
        const created = await UserRepository.create({
          name,
          email,
          google_id: googleId
        });
        user = created.rows[0];
      } else {
        const existing = found.rows[0];

        if (!existing.google_id) {
          const updated = await UserRepository.updateGoogleId(email, googleId);
          user = updated.rows[0];
        } else {
          user = existing;
        }
      }

      const payload: SessionPayload = {
        sub: user.id,
        email: user.email,
        name: user.name
      };

      const token = signSession(payload);

      if (invite) {
        await ExchangeService.joinByInviteCode(user.id, invite);
      }

      return ok({ token, user });

    } catch (e) {
      console.error('UserService.loginWithGoogle error:', e);
      return err(`[${UserErrorCode.INVALID_GOOGLE_DATA}] Error con Google`);
    }
  }
};
