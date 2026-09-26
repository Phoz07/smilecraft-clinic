import { protectedProcedure, publicProcedure, router } from "../index";
import { appointmentRouter } from "./appointment";
import { demoRouter } from "./demo";
import { dentistRouter } from "./dentist";
import { scheduleRouter } from "./schedule";
import { serviceRouter } from "./service";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	demo: demoRouter,
	dentists: dentistRouter,
	services: serviceRouter,
	schedules: scheduleRouter,
	appointments: appointmentRouter,
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
});
export type AppRouter = typeof appRouter;
