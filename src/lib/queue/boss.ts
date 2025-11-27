// src/lib/queue/boss.ts
import { PgBoss } from "pg-boss";

let boss: PgBoss | null = null;

export default function getBoss() {
  if (!boss) {
    boss = new PgBoss({
      connectionString: process.env.DATABASE_URL!,
      schema: "boss",
    });

    boss.start().catch((err) => {
      console.error("Failed to start pg-boss:", err);
    });
  }

  return boss;
}
