import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome com pelo menos 2 caracteres.')
    .max(100, 'Use no máximo 100 caracteres.'),

  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .max(254, 'Use no máximo 254 caracteres.')
    .pipe(z.email('Informe um e-mail válido.')),

  message: z
    .string()
    .trim()
    .min(10, 'Escreva uma mensagem com pelo menos 10 caracteres.')
    .max(2000, 'Use no máximo 2.000 caracteres.'),
})