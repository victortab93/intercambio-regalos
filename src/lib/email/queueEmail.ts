// src/lib/email/queueEmail.ts
import getBoss from "@/lib/queue/boss";

export async function queueEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const boss = getBoss();

  await boss.publish("send-email", {
    to,
    subject,
    html,
  });
}
