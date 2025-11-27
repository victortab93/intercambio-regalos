// src/core/exchanges/exchange.validators.ts
import { z } from 'zod';

export const CreateExchangeSchema = z.object({
  ownerId: z.string().min(1, 'Owner requerido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  eventDate: z
    .string()
    .refine((value) => {
      const d = new Date(value);
      return !Number.isNaN(d.getTime());
    }, 'Fecha inválida (usa formato YYYY-MM-DD)')
});

export const JoinByInviteCodeSchema = z.object({
  userId: z.string().min(1),
  inviteCode: z.string().min(1)
});
