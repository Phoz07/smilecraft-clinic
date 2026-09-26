import { scheduleBlock } from "@smilecraft-clinic/db";
import { z } from "zod";
import { publicProcedure, router } from "../index";

export const scheduleRouter = router({
	addBlock: publicProcedure
		.input(
			z.object({
				dentistId: z.string(),
				date: z.string(),
				startTime: z.string().default("10:00"),
				endTime: z.string().default("20:00"),
				reason: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const blockId = `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
			await ctx.db
				.insert(scheduleBlock)
				.values({
					id: blockId,
					dentistId: input.dentistId,
					date: input.date,
					startTime: input.startTime,
					endTime: input.endTime,
					reason: input.reason || "ทันตแพทย์ติดภารกิจลา (Schedule Block)",
				})
				.execute();

			return { success: true, id: blockId };
		}),
});
