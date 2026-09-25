import type { Session } from "@smilecraft-clinic/auth";
import type { Database } from "@smilecraft-clinic/db";

export type Context = {
  session: Session | null;
  db: Database;
};
