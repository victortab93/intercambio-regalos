// src/core/participants/participant.types.ts

export interface Participant {
    id: string;       // user_id
    name: string;
    email: string;
    joined_at: string;
  }
  
  export interface AddParticipantInput {
    exchangeId: string;
    userId: string;
  }
  