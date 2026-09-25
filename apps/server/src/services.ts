import { createAuth as createConfiguredAuth } from "@smilecraft-clinic/auth";
import { type Database, createDb } from "@smilecraft-clinic/db";

import { ENV } from "./env.server";

export function getDb(): Database {
  return createDb(ENV);
}
export async function createAuth(database?: Database) {
  return createConfiguredAuth(ENV, database ?? (await getDb()));
}
