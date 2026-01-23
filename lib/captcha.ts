// lib/captcha.ts
export async function verifyCaptcha(token?: string): Promise<boolean> {
  // TODO: Implement CAPTCHA verification (e.g., with hCaptcha or reCAPTCHA)
  // For now, allow if token is provided or skip if not required
  return true; // Placeholder: always pass
}