// src/core/pairings/pairing.validators.ts
import { z } from 'zod';

export const GeneratePairingSchema = z.object({
  exchangeId: z.string().min(1)
});

export const DeletePairingSchema = z.object({
  exchangeId: z.string().min(1)
});
