import { resetDemoData } from "@smilecraft-clinic/db";
import { publicProcedure, router } from "../index";

export const demoRouter = router({
  reset: publicProcedure.mutation(async ({ ctx }) => {
    return await resetDemoData(ctx.db);
  }),
});
