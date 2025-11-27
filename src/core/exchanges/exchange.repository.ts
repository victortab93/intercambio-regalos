// src/core/exchanges/exchange.repository.ts
import { query } from '@/lib/db';
import type { Exchange, ExchangeSummary } from './exchange.types';

export const ExchangeRepository = {
  async create(ownerId: string, name: string, eventDate: string, inviteCode: string) {
    try {
      return await query<Exchange>(
        `INSERT INTO exchanges (owner_id, name, event_date, invite_code)
         VALUES ($1, $2, $3, $4)
         RETURNING id, owner_id, name, event_date::text AS event_date,
                   invite_code, created_at`,
        [ownerId, name.trim(), eventDate, inviteCode]
      );
    } catch (e) {
      console.error('ExchangeRepository.create error:', e);
      throw new Error('DB_CREATE_EXCHANGE_FAILED');
    }
  },

  async findById(id: string) {
    try {
      return await query<Exchange>(
        `SELECT id,
                owner_id,
                name,
                event_date::text AS event_date,
                invite_code,
                created_at
         FROM exchanges
         WHERE id = $1`,
        [id]
      );
    } catch (e) {
      console.error('ExchangeRepository.findById error:', e);
      throw new Error('DB_FIND_EXCHANGE_BY_ID_FAILED');
    }
  },

  async findByInviteCode(inviteCode: string) {
    try {
      return await query<Exchange>(
        `SELECT id,
                owner_id,
                name,
                event_date::text AS event_date,
                invite_code,
                created_at
         FROM exchanges
         WHERE invite_code = $1`,
        [inviteCode]
      );
    } catch (e) {
      console.error('ExchangeRepository.findByInviteCode error:', e);
      throw new Error('DB_FIND_EXCHANGE_BY_CODE_FAILED');
    }
  },

  async listByOwner(ownerId: string) {
    try {
      return await query<ExchangeSummary>(
        `SELECT id,
                name,
                event_date::text AS "eventDate",
                invite_code AS "inviteCode",
                owner_id AS "ownerId"
         FROM exchanges
         WHERE owner_id = $1
         ORDER BY created_at DESC`,
        [ownerId]
      );
    } catch (e) {
      console.error('ExchangeRepository.listByOwner error:', e);
      throw new Error('DB_LIST_EXCHANGES_BY_OWNER_FAILED');
    }
  },

  async addParticipant(exchangeId: string, userId: string) {
    try {
      await query(
        `INSERT INTO exchange_participants (exchange_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (exchange_id, user_id) DO NOTHING`,
        [exchangeId, userId]
      );
    } catch (e) {
      console.error('ExchangeRepository.addParticipant error:', e);
      throw new Error('DB_ADD_PARTICIPANT_FAILED');
    }
  }
};
