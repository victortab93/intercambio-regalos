// src/core/users/user.repository.ts
import { query } from '@/lib/db';
import type { CreateUserInput, User } from './user.types';

export const UserRepository = {
  async findByEmail(email: string) {
    try {
      return await query<User>(
        `SELECT id, name, email, password_hash, google_id, created_at
         FROM users
         WHERE email = $1`,
        [email.trim().toLowerCase()]
      );
    } catch (e) {
      console.error('UserRepository.findByEmail error:', e);
      throw new Error('DB_FIND_EMAIL_FAILED');
    }
  },

  async findById(id: string) {
    try {
      return await query<User>(
        `SELECT id, name, email, password_hash, google_id, created_at
         FROM users
         WHERE id = $1`,
        [id]
      );
    } catch (e) {
      console.error('UserRepository.findById error:', e);
      throw new Error('DB_FIND_ID_FAILED');
    }
  },

  async create(input: CreateUserInput) {
    try {
      const { name, email, password_hash, google_id } = input;

      return await query<User>(
        `INSERT INTO users (name, email, password_hash, google_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, created_at`,
        [name.trim(), email.trim().toLowerCase(), password_hash, google_id]
      );
    } catch (e) {
      console.error('UserRepository.create error:', e);
      throw new Error('DB_CREATE_USER_FAILED');
    }
  },

  async updateGoogleId(email: string, googleId: string) {
    try {
      return await query<User>(
        `UPDATE users
         SET google_id = $1
         WHERE email = $2
         RETURNING id, name, email, created_at`,
        [googleId, email.trim().toLowerCase()]
      );
    } catch (e) {
      console.error('UserRepository.updateGoogleId error:', e);
      throw new Error('DB_UPDATE_GOOGLE_FAILED');
    }
  }
};
