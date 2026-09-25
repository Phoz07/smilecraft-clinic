import { publicProcedure, router } from "../index";

export const serviceRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.service.findMany({
      where: { isActive: true },
    });
  }),
});
