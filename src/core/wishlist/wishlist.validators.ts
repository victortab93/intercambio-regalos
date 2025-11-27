// src/core/wishlist/wishlist.validators.ts
import { z } from 'zod';

export const WishlistItemSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  url: z.string().url().optional(),
  price: z.number().min(0).optional()
});

export const SaveWishlistSchema = z.object({
  exchangeId: z.string().min(1),
  userId: z.string().min(1),
  items: z.array(WishlistItemSchema)
});
