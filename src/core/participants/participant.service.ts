// src/core/participants/participant.service.ts
import { ok, err, Result } from '@/lib/result';
import { ParticipantRepository } from './participant.repository';
import { AddParticipantSchema, GetParticipantsSchema } from './participant.validators';
import { ParticipantErrorCode } from './participant.errors';
import type { Participant } from './participant.types';

export const ParticipantService = {
  
  /**
   * Añadir participante a un intercambio.
   */
  async add(input: unknown): Promise<Result<{ added: boolean }>> {
    try {
      const parsed = AddParticipantSchema.parse(input);
      const { exchangeId, userId } = parsed;

      // Check if already participant
      const exists = await ParticipantRepository.isParticipant(exchangeId, userId);

      if (exists.rows.length > 0) {
        return ok({ added: false }); // already inside
      }

      await ParticipantRepository.add(exchangeId, userId);

      return ok({ added: true });

    } catch (e) {
      console.error('ParticipantService.add error:', e);
      return err(`[${ParticipantErrorCode.INTERNAL}] Error interno al añadir participante`);
    }
  },

  /**
   * Obtiene la lista completa de participantes.
   */
  async list(exchangeId: string): Promise<Result<Participant[]>> {
    try {
      const parsed = GetParticipantsSchema.parse({ exchangeId });

      const result = await ParticipantRepository.listByExchange(parsed.exchangeId);

      return ok(result.rows);

    } catch (e) {
      console.error('ParticipantService.list error:', e);
      return err(`[${ParticipantErrorCode.INTERNAL}] Error interno al listar participantes`);
    }
  },

  /**
   * Verifica si un usuario pertenece al intercambio.
   */
  async isParticipant(exchangeId: string, userId: string): Promise<Result<boolean>> {
    try {
      const parsed = AddParticipantSchema.parse({ exchangeId, userId });

      const result = await ParticipantRepository.isParticipant(
        parsed.exchangeId,
        parsed.userId
      );

      return ok(result.rows.length > 0);

    } catch (e) {
      console.error('ParticipantService.isParticipant error:', e);
      return err(`[${ParticipantErrorCode.INTERNAL}] Error interno al validar participante`);
    }
  },

  /**
   * Cuenta los participantes de un intercambio.
   */
  async count(exchangeId: string): Promise<Result<number>> {
    try {
      const parsed = GetParticipantsSchema.parse({ exchangeId });

      const result = await ParticipantRepository.count(parsed.exchangeId);
      const count = Number(result.rows[0].count);

      return ok(count);

    } catch (e) {
      console.error('ParticipantService.count error:', e);
      return err(`[${ParticipantErrorCode.INTERNAL}] Error interno al contar participantes`);
    }
  }
};
