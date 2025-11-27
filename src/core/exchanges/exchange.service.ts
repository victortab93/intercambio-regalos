// src/core/exchanges/exchange.service.ts
import { ok, err, Result } from '@/lib/result';
import { randomId } from '@/lib/utils';
import { ExchangeRepository } from './exchange.repository';
import { CreateExchangeSchema, JoinByInviteCodeSchema } from './exchange.validators';
import { ExchangeErrorCode } from './exchange.errors';
import type { ExchangeSummary } from './exchange.types';

export const ExchangeService = {
  /**
   * Crea un intercambio nuevo para un owner.
   */
  async create(input: unknown): Promise<Result<ExchangeSummary>> {
    try {
      const parsed = CreateExchangeSchema.parse(input);
      const { ownerId, name, eventDate } = parsed;

      // Fecha no puede ser en el pasado (a menos que quieras permitirlo)
      const event = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(event.getTime())) {
        return err(`[${ExchangeErrorCode.INVALID_DATE}] Fecha inválida`);
      }

      if (event < today) {
        return err(
          `[${ExchangeErrorCode.INVALID_DATE}] La fecha debe ser hoy o en el futuro`
        );
      }

      // Generar invite_code único
      let inviteCode: string;
      let exists = true;
      let attempts = 0;

      do {
        inviteCode = randomId(8); // ej: 'a1b2c3d4'
        const existing = await ExchangeRepository.findByInviteCode(inviteCode);
        exists = existing.rows.length > 0;
        attempts++;
        if (attempts > 10) {
          console.error('Too many attempts generating unique invite code');
          return err(`[${ExchangeErrorCode.INTERNAL}] No se pudo generar código de invitación`);
        }
      } while (exists);

      const created = await ExchangeRepository.create(ownerId, name, eventDate, inviteCode);
      const ex = created.rows[0];

      const summary: ExchangeSummary = {
        id: ex.id,
        name: ex.name,
        inviteCode: ex.invite_code,
        eventDate: ex.event_date,
        ownerId: ex.owner_id
      };

      return ok(summary);
    } catch (e) {
      console.error('ExchangeService.create error:', e);
      return err(`[${ExchangeErrorCode.INTERNAL}] Error interno al crear intercambio`);
    }
  },

  /**
   * Devuelve un intercambio por id
   */
  async getById(id: string): Promise<Result<ExchangeSummary>> {
    try {
      const result = await ExchangeRepository.findById(id);
      if (result.rows.length === 0) {
        return err(`[${ExchangeErrorCode.NOT_FOUND}] Intercambio no encontrado`);
      }

      const ex = result.rows[0];

      const summary: ExchangeSummary = {
        id: ex.id,
        name: ex.name,
        inviteCode: ex.invite_code,
        eventDate: ex.event_date,
        ownerId: ex.owner_id
      };

      return ok(summary);
    } catch (e) {
      console.error('ExchangeService.getById error:', e);
      return err(`[${ExchangeErrorCode.INTERNAL}] Error interno al obtener intercambio`);
    }
  },

  /**
   * Lista intercambios de un owner concreto
   */
  async listByOwner(ownerId: string): Promise<Result<ExchangeSummary[]>> {
    try {
      const result = await ExchangeRepository.listByOwner(ownerId);
      return ok(result.rows);
    } catch (e) {
      console.error('ExchangeService.listByOwner error:', e);
      return err(`[${ExchangeErrorCode.INTERNAL}] Error interno al listar intercambios`);
    }
  },

  /**
   * Une a un usuario a un intercambio dado un inviteCode.
   * Usado desde UserService durante login/signup con ?invite=CODE
   */
  async joinByInviteCode(
    userId: string,
    inviteCode: string
  ): Promise<Result<{ exchangeId: string } | null>> {
    try {
      const parsed = JoinByInviteCodeSchema.parse({ userId, inviteCode });

      const result = await ExchangeRepository.findByInviteCode(parsed.inviteCode);
      if (result.rows.length === 0) {
        // No lanzamos error fuerte: simplemente no hay nada que unir.
        return ok(null);
      }

      const ex = result.rows[0];

      await ExchangeRepository.addParticipant(ex.id, parsed.userId);

      return ok({ exchangeId: ex.id });
    } catch (e) {
      console.error('ExchangeService.joinByInviteCode error:', e);
      return err(
        `[${ExchangeErrorCode.INTERNAL}] Error interno al unirse al intercambio`
      );
    }
  },

  // Add inside ExchangeService

  async getByInviteCode(inviteCode: string) {
    try {
      const result = await ExchangeRepository.findByInviteCode(inviteCode);

      if (result.rows.length === 0) {
        return ok(null);
      }

      const ex = result.rows[0];

      return ok({
        id: ex.id,
        name: ex.name,
        inviteCode: ex.invite_code,
        eventDate: ex.event_date,
        ownerId: ex.owner_id
      });

    } catch (error) {
      console.error('ExchangeService.getByInviteCode error:', error);
      return err('[EXCHANGE_INTERNAL_ERROR] Error interno al obtener invitación');
    }
  }

};
