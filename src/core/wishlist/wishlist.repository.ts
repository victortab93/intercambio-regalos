// src/core/wishlist/wishlist.repository.ts
import { query } from '@/lib/db';
import type { WishlistItem } from './wishlist.types';

export const WishlistRepository = {
  async deleteUserWishlist(exchangeId: string, userId: string) {
    try {
      await query(
        `DELETE FROM wishlist_items
         WHERE exchange_id = $1 AND user_id = $2`,
        [exchangeId, userId]
      );
    } catch (e) {
      console.error('WishlistRepository.deleteUserWishlist error:', e);
      throw new Error('DB_DELETE_WISHLIST_FAILED');
    }
  },

  async insertItems(
    exchangeId: string,
    userId: string,
    items: { title: string; description?: string; url?: string; price?: number }[]
  ) {
    try {
      const inserts = items.map((item) =>
        query(
          `INSERT INTO wishlist_items (exchange_id, user_id, title, description, url, price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            exchangeId,
            userId,
            item.title.trim(),
            item.description ?? null,
            item.url ?? null,
            item.price ?? null
          ]
        )
      );
      await Promise.all(inserts);
    } catch (e) {
      console.error('WishlistRepository.insertItems error:', e);
      throw new Error('DB_INSERT_WISHLIST_ITEMS_FAILED');
    }
  },

  async getByUser(exchangeId: string, userId: string) {
    try {
      return await query<WishlistItem>(
        `SELECT id,
                exchange_id,
                user_id,
                title,
                description,
                url,
                price,
                created_at
         FROM wishlist_items
         WHERE exchange_id = $1 AND user_id = $2
         ORDER BY created_at ASC`,
        [exchangeId, userId]
      );
    } catch (e) {
      console.error('WishlistRepository.getByUser error:', e);
      throw new Error('DB_GET_WISHLIST_BY_USER_FAILED');
    }
  }
};
