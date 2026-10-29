import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z.email("Informe um e-mail válido.")
        .max(255, "O e-mail deve ter no máximo 255 caracteres."),
    ),

  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .refine(
      (password) => Buffer.byteLength(password, "utf-8") <= 72,
      "A senha deve ter pelo menos 72 bytes.",
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),

    password: z
      .string()
      .min(1, "Informe sua senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;
