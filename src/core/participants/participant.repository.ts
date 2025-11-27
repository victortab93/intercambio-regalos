// src/core/participants/participant.repository.ts
import { query } from '@/lib/db';
import type { Participant } from './participant.types';

export const ParticipantRepository = {
  async add(exchangeId: string, userId: string) {
    try {
      await query(
        `INSERT INTO exchange_participants (exchange_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (exchange_id, user_id) DO NOTHING`,
        [exchangeId, userId]
      );
    } catch (e) {
      console.error('ParticipantRepository.add error:', e);
      throw new Error('DB_ADD_PARTICIPANT_FAILED');
    }
  },

  async listByExchange(exchangeId: string) {
    try {
      return await query<Participant>(
        `SELECT u.id,
                u.name,
                u.email,
                ep.joined_at
         FROM exchange_participants ep
         JOIN users u ON u.id = ep.user_id
         WHERE ep.exchange_id = $1
         ORDER BY u.name ASC`,
        [exchangeId]
      );
    } catch (e) {
      console.error('ParticipantRepository.listByExchange error:', e);
      throw new Error('DB_LIST_PARTICIPANTS_FAILED');
    }
  },

  async isParticipant(exchangeId: string, userId: string) {
    try {
      return await query(
        `SELECT 1
         FROM exchange_participants
         WHERE exchange_id = $1 AND user_id = $2`,
        [exchangeId, userId]
      );
    } catch (e) {
      console.error('ParticipantRepository.isParticipant error:', e);
      throw new Error('DB_CHECK_PARTICIPANT_FAILED');
    }
  },

  async count(exchangeId: string) {
    try {
      return await query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM exchange_participants
         WHERE exchange_id = $1`,
        [exchangeId]
      );
    } catch (e) {
      console.error('ParticipantRepository.count error:', e);
      throw new Error('DB_COUNT_PARTICIPANTS_FAILED');
    }
  }
};
