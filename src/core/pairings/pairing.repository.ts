// src/core/pairings/pairing.repository.ts
import { query } from '@/lib/db';
import type { PairingRun, PairingView } from './pairing.types';

export const PairingRepository = {
  async findActive(exchangeId: string) {
    try {
      return await query<PairingRun>(
        `SELECT id, exchange_id, created_at, is_active
         FROM pairing_runs
         WHERE exchange_id = $1 AND is_active = TRUE`,
        [exchangeId]
      );
    } catch (e) {
      console.error('PairingRepository.findActive error:', e);
      throw new Error('DB_FIND_ACTIVE_PAIRING_FAILED');
    }
  },

  async createRun(exchangeId: string) {
    try {
      return await query<PairingRun>(
        `INSERT INTO pairing_runs (exchange_id, is_active)
         VALUES ($1, TRUE)
         RETURNING id, exchange_id, created_at, is_active`,
        [exchangeId]
      );
    } catch (e) {
      console.error('PairingRepository.createRun error:', e);
      throw new Error('DB_CREATE_PAIRING_RUN_FAILED');
    }
  },

  async savePairs(runId: string, pairs: { giverId: string; receiverId: string }[]) {
    try {
      const queries = pairs.map((p) =>
        query(
          `INSERT INTO pairing_pairs (pairing_run_id, giver_id, receiver_id)
           VALUES ($1, $2, $3)`,
          [runId, p.giverId, p.receiverId]
        )
      );
      await Promise.all(queries);
    } catch (e) {
      console.error('PairingRepository.savePairs error:', e);
      throw new Error('DB_SAVE_PAIRING_PAIRS_FAILED');
    }
  },

  async deleteActive(exchangeId: string) {
    try {
      // Mark runs inactive (not hard delete)
      await query(
        `UPDATE pairing_runs
         SET is_active = FALSE
         WHERE exchange_id = $1 AND is_active = TRUE`,
        [exchangeId]
      );
    } catch (e) {
      console.error('PairingRepository.deleteActive error:', e);
      throw new Error('DB_DELETE_ACTIVE_PAIRING_FAILED');
    }
  },

  async getActiveView(exchangeId: string) {
    try {
      return await query<PairingView>(
        `SELECT 
            g.id AS "giverId",
            g.name AS "giverName",
            r.name AS "receiverName"
         FROM pairing_runs pr
         JOIN pairing_pairs pp ON pp.pairing_run_id = pr.id
         JOIN users g ON g.id = pp.giver_id
         JOIN users r ON r.id = pp.receiver_id
         WHERE pr.exchange_id = $1 AND pr.is_active = TRUE
         ORDER BY g.name ASC`,
        [exchangeId]
      );
    } catch (e) {
      console.error('PairingRepository.getActiveView error:', e);
      throw new Error('DB_GET_ACTIVE_PAIRING_VIEW_FAILED');
    }
  }
};
