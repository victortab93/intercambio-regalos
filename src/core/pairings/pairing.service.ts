// src/core/pairings/pairing.service.ts
import { ok, err, Result } from '@/lib/result';
import { ParticipantService } from '@/core/participants/participant.service';
import { shuffleArray } from '@/lib/utils';
import { PairingRepository } from './pairing.repository';
import { GeneratePairingSchema, DeletePairingSchema } from './pairing.validators';
import { PairingErrorCode } from './pairing.errors';
import type { PairingView } from './pairing.types';

export const PairingService = {

  /**
   * Generate a new pairing for an exchange.
   */
  async generate(input: unknown): Promise<Result<{ created: boolean }>> {
    try {
      const { exchangeId } = GeneratePairingSchema.parse(input);

      // Check existing pairing
      const active = await PairingRepository.findActive(exchangeId);
      if (active.rows.length > 0) {
        return err(`[${PairingErrorCode.ACTIVE_EXISTS}] Ya existe un emparejamiento activo`);
      }

      // Fetch participants
      const participantsResult = await ParticipantService.list(exchangeId);
      if (!participantsResult.ok) return err(participantsResult.error);

      const participants = participantsResult.value;
      if (participants.length < 2) {
        return err(
          `[${PairingErrorCode.NOT_ENOUGH_PARTICIPANTS}] Mínimo 2 participantes`
        );
      }

      // Shuffle participants
      const shuffled = shuffleArray(participants);

      // Build pairs: each gives to the next, last gives to first
      const pairs = shuffled.map((giver, idx) => {
        const receiver = shuffled[(idx + 1) % shuffled.length];
        return {
          giverId: giver.id,
          receiverId: receiver.id
        };
      });

      // Create run
      const run = await PairingRepository.createRun(exchangeId);
      const runId = run.rows[0].id;

      // Save pairs
      await PairingRepository.savePairs(runId, pairs);

      return ok({ created: true });

    } catch (e) {
      console.error('PairingService.generate error:', e);
      return err(`[${PairingErrorCode.INTERNAL}] Error interno al generar emparejamiento`);
    }
  },

  /**
   * Delete current pairing.
   */
  async delete(input: unknown): Promise<Result<{ deleted: boolean }>> {
    try {
      const { exchangeId } = DeletePairingSchema.parse(input);

      await PairingRepository.deleteActive(exchangeId);

      return ok({ deleted: true });

    } catch (e) {
      console.error('PairingService.delete error:', e);
      return err(`[${PairingErrorCode.INTERNAL}] Error interno al eliminar emparejamiento`);
    }
  },

  /**
   * Return the active pairing view.
   */
  async getActive(exchangeId: string): Promise<Result<PairingView[]>> {
    try {
      const result = await PairingRepository.getActiveView(exchangeId);
      return ok(result.rows);
    } catch (e) {
      console.error('PairingService.getActive error:', e);
      return err(`[${PairingErrorCode.INTERNAL}] Error interno al obtener emparejamiento`);
    }
  }
};
