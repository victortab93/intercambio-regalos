// src/core/wishlist/wishlist.service.ts
import { ok, err, Result } from '@/lib/result';
import { WishlistRepository } from './wishlist.repository';
import { SaveWishlistSchema } from './wishlist.validators';
import { WishlistErrorCode } from './wishlist.errors';
import type { WishlistItem, SaveWishlistInput } from './wishlist.types';

export const WishlistService = {
  /**
   * Save wishlist items for a user on a specific exchange.
   */
  async save(input: unknown): Promise<Result<{ saved: boolean }>> {
    try {
      const parsed = SaveWishlistSchema.parse(input);
      const { exchangeId, userId, items } = parsed;

      // Optional: prevent empty lists
      if (items.length === 0) {
        return err(`[${WishlistErrorCode.INVALID_ITEMS}] La lista no puede estar vacía`);
      }

      // Step 1: delete existing wishlist
      await WishlistRepository.deleteUserWishlist(exchangeId, userId);

      // Step 2: insert the new items
      await WishlistRepository.insertItems(exchangeId, userId, items);

      return ok({ saved: true });

    } catch (e: any) {
      console.error('WishlistService.save error:', e);
      return err(`[${WishlistErrorCode.INTERNAL}] Error interno al guardar la lista`);
    }
  },

  /**
   * Get a user's wishlist.
   */
  async getUserWishlist(exchangeId: string, userId: string): Promise<Result<WishlistItem[]>> {
    try {
      const result = await WishlistRepository.getByUser(exchangeId, userId);

      return ok(result.rows);

    } catch (e) {
      console.error('WishlistService.getUserWishlist error:', e);
      return err(`[${WishlistErrorCode.INTERNAL}] Error interno al obtener la lista`);
    }
  }
};
