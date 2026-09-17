import { Resend } from "resend";

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "contato@goiasfa.com.br";

let client: Resend | null = null;

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}
