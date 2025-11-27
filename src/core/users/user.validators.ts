// src/core/users/user.validators.ts
import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
  invite: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
  invite: z.string().optional()
});

export const GoogleAuthSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  googleId: z.string().min(2),
  invite: z.string().optional()
});
