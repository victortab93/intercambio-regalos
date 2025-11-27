// src/core/exchanges/exchange.types.ts

export interface Exchange {
    id: string;
    owner_id: string;
    name: string;
    event_date: string; // ISO string / DATE::text
    invite_code: string;
    created_at: string;
  }
  
  export interface ExchangeSummary {
    id: string;
    name: string;
    eventDate: string;
    inviteCode: string;
    ownerId: string;
  }
  
  export interface CreateExchangeInput {
    ownerId: string;
    name: string;
    eventDate: string; // 'YYYY-MM-DD'
  }
  