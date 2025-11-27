// src/core/wishlist/wishlist.types.ts

export interface WishlistItem {
    id: string;
    exchange_id: string;
    user_id: string;
    title: string;
    description?: string | null;
    url?: string | null;
    price?: number | null;
    created_at: string;
  }
  
  export interface SaveWishlistInput {
    exchangeId: string;
    userId: string;
    items: {
      title: string;
      description?: string;
      url?: string;
      price?: number;
    }[];
  }
  