// src/workers/email-worker.ts
import getBoss from "@/lib/queue/boss";
import { sendEmail } from "@/lib/email/sendEmail";

(async () => {
  const boss = getBoss();

  console.log("📨 Email Worker started...");

  await boss.work("send-email", async (job) => {
    try {
      const { to, subject, html } = (job as any)?.data;

      console.log(`📧 Sending email to ${to}`);

      const res = await sendEmail({ to, subject, html });

      if (!res.ok) throw new Error(res.error);

      console.log(`✅ Email sent to ${to}`);
    } catch (err) {
      console.error("❌ Worker email failed:", err);
      throw err; // pg-boss reintenta automático
    }
  });
})();
