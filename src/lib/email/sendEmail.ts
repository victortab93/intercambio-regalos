// src/lib/email/sendEmail.ts
import { transporter } from "./transporter";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: `"GiftExchange" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    return { ok: true };
  } catch (err: any) {
    console.error("❌ Email error:", err);
    return { ok: false, error: err.message };
  }
}
