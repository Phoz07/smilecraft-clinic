import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Database } from "./index";
import { relations } from "./relations";

export async function createTestDb(): Promise<Database> {
  const client = createClient({ url: ":memory:" });
  const db = drizzle({ client, relations }) as unknown as Database;

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.resolve(currentDir, "migrations");
  const migrationFolders = fs.readdirSync(migrationsDir).filter((f) => !f.startsWith("."));

  const firstFolder = migrationFolders[0];
  if (firstFolder) {
    const migrationFile = path.join(migrationsDir, firstFolder, "migration.sql");
    const sql = fs.readFileSync(migrationFile, "utf-8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();
      if (trimmed) {
        await client.execute(trimmed);
      }
    }
  }

  return db;
}
