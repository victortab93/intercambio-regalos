// src/core/participants/participant.validators.ts
import { z } from 'zod';

export const AddParticipantSchema = z.object({
  exchangeId: z.string().min(1),
  userId: z.string().min(1)
});

export const GetParticipantsSchema = z.object({
  exchangeId: z.string().min(1)
});
