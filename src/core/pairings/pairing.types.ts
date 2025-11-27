// src/core/pairings/pairing.types.ts

export interface PairingRun {
    id: string;
    exchange_id: string;
    created_at: string;
    is_active: boolean;
  }
  
  export interface PairingPair {
    giver_id: string;
    receiver_id: string;
  }
  
  export interface PairingView {
    giverId: string;
    giverName: string;
    receiverId: string;
    receiverName: string;
    receiverEmail: string;
  }
  

  