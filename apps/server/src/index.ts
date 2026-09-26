import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@smilecraft-clinic/api/routers/index";
import { resetDemoData } from "@smilecraft-clinic/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { createContext } from "./context";
import { ENV } from "./env.server";
import { createAuth, getDb } from "./services";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin) => {
			if (!origin) return ENV.CORS_ORIGIN;
			if (
				origin === ENV.CORS_ORIGIN ||
				origin.endsWith(".workers.dev") ||
				origin.startsWith("http://localhost:") ||
				origin.startsWith("https://localhost:")
			) {
				return origin;
			}
			return ENV.CORS_ORIGIN;
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", async (c) =>
	(await createAuth()).handler(c.req.raw),
);

app.post("/api/demo/reset", async (c) => {
	const db = await getDb();
	const result = await resetDemoData(db);
	return c.json(result);
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
