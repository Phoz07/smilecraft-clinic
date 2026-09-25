import { publicProcedure, router } from "../index";

export const dentistRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.dentist.findMany({
      where: { isActive: true },
      with: {
        services: true,
        dutySchedules: true,
      },
    });
  }),
});
