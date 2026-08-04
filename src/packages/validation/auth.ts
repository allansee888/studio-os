import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
}).refine(
  (data) => !!(data.identifier || data.email || data.username),
  {
    message: "Email or username is required",
    path: ["identifier"],
  }
);

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
