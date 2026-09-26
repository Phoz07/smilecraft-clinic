import { appointment, scheduleBlock } from "@smilecraft-clinic/db";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import {
	addMinutesToTime,
	detectScheduleBlockCollision,
	formatRescheduleAuditNote,
	generateAvailableTimeSlots,
	isWithinOperatingHours,
	parseIsoDate,
	selectAvailableDentist,
	validateRescheduleEligibility,
} from "../domain/appointment-schedule";
import { publicProcedure, router } from "../index";
import { generateBookingCode } from "../utils/booking-code";

export const appointmentRouter = router({
	getAvailableSlots: publicProcedure
		.input(
			z.object({
				serviceId: z.string(),
				date: z.string(), // YYYY-MM-DD
				dentistId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// 1. Get service by ID
			const selectedService = await ctx.db.query.service.findFirst({
				where: { id: input.serviceId },
			});

			if (!selectedService) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "ไม่พบข้อมูลบริการที่เลือก",
				});
			}

			// 2. Validate date format
			try {
				parseIsoDate(input.date);
			} catch (_err) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)",
				});
			}

			// 3. Find eligible dentists for this service
			const dentistServicesList = await ctx.db.query.dentistService.findMany({
				where: { serviceId: input.serviceId },
				with: {
					dentist: {
						with: {
							dutySchedules: true,
						},
					},
				},
			});

			let candidateDentists = dentistServicesList
				.map((ds) => ds.dentist)
				.filter((d): d is NonNullable<typeof d> => !!d && d.isActive);

			if (input.dentistId) {
				candidateDentists = candidateDentists.filter(
					(d) => d.id === input.dentistId,
				);
			}

			// If no eligible dentists, return 0 slots
			if (candidateDentists.length === 0) {
				return {
					date: input.date,
					service: selectedService,
					slots: [],
					eligibleDentistsCount: 0,
				};
			}

			const dentistIds = candidateDentists.map((d) => d.id);

			// 4. Fetch schedule blocks for these dentists on this date
			const blocks = await ctx.db
				.select()
				.from(scheduleBlock)
				.where(
					and(
						eq(scheduleBlock.date, input.date),
						inArray(scheduleBlock.dentistId, dentistIds),
					),
				);

			// 5. Fetch existing non-cancelled appointments for these dentists on this date
			const existingAppointments = await ctx.db
				.select()
				.from(appointment)
				.where(
					and(
						eq(appointment.appointmentDate, input.date),
						ne(appointment.status, "CANCELLED"),
						inArray(appointment.dentistId, dentistIds),
					),
				);

			// 6. Generate slots via pure domain module
			const slots = generateAvailableTimeSlots({
				serviceDurationMinutes: selectedService.durationMinutes,
				date: input.date,
				candidateDentists,
				scheduleBlocks: blocks,
				existingAppointments,
			});

			return {
				date: input.date,
				service: selectedService,
				slots,
				eligibleDentistsCount: candidateDentists.length,
			};
		}),

	create: publicProcedure
		.input(
			z.object({
				serviceId: z.string(),
				dentistId: z.string().optional(),
				date: z.string(), // YYYY-MM-DD
				startTime: z.string(), // "10:00"
				patientName: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
				patientPhone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
				medicalNotes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// 1. Fetch service
			const selectedService = await ctx.db.query.service.findFirst({
				where: { id: input.serviceId },
			});

			if (!selectedService) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "ไม่พบข้อมูลบริการที่เลือก",
				});
			}

			const duration = selectedService.durationMinutes;
			const endTime = addMinutesToTime(input.startTime, duration);

			if (!isWithinOperatingHours(input.startTime, endTime)) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "เวลานัดหมายเกินเวลาทำการคลินิก (ปิด 20:00 น.)",
				});
			}

			// 2. Validate date format
			try {
				parseIsoDate(input.date);
			} catch (_err) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "รูปแบบวันที่ไม่ถูกต้อง",
				});
			}

			// 3. Find eligible dentists
			const dentistServicesList = await ctx.db.query.dentistService.findMany({
				where: { serviceId: input.serviceId },
				with: {
					dentist: {
						with: {
							dutySchedules: true,
						},
					},
				},
			});

			let candidateDentists = dentistServicesList
				.map((ds) => ds.dentist)
				.filter((d): d is NonNullable<typeof d> => !!d && d.isActive);

			if (input.dentistId) {
				candidateDentists = candidateDentists.filter(
					(d) => d.id === input.dentistId,
				);
			}

			if (candidateDentists.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "ไม่มีทันตแพทย์ที่สามารถให้บริการประเภทนี้ตามที่เลือก",
				});
			}

			const dentistIds = candidateDentists.map((d) => d.id);

			// 4. Fetch blocks and appointments
			const blocks = await ctx.db
				.select()
				.from(scheduleBlock)
				.where(
					and(
						eq(scheduleBlock.date, input.date),
						inArray(scheduleBlock.dentistId, dentistIds),
					),
				);

			const existingAppointments = await ctx.db
				.select()
				.from(appointment)
				.where(
					and(
						eq(appointment.appointmentDate, input.date),
						ne(appointment.status, "CANCELLED"),
						inArray(appointment.dentistId, dentistIds),
					),
				);

			// 5. Select available dentist via pure domain module
			const assignedDentist = selectAvailableDentist({
				candidateDentists,
				date: input.date,
				startTime: input.startTime,
				endTime,
				scheduleBlocks: blocks,
				existingAppointments,
			});

			if (!assignedDentist) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "ช่วงเวลานี้มีผู้จองแล้วหรือทันตแพทย์ไม่ว่าง กรุณาเลือกช่วงเวลาอื่น",
				});
			}

			// 6. Generate booking code and insert PENDING appointment (ADR-0001)
			const bookingCode = generateBookingCode(input.date);
			const appointmentId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

			await ctx.db
				.insert(appointment)
				.values({
					id: appointmentId,
					bookingCode,
					patientName: input.patientName.trim(),
					patientPhone: input.patientPhone.trim(),
					medicalNotes: input.medicalNotes?.trim() || null,
					dentistId: assignedDentist.id,
					serviceId: input.serviceId,
					appointmentDate: input.date,
					startTime: input.startTime,
					endTime,
					status: "PENDING",
				})
				.execute();

			// 7. Return created appointment with relations
			const created = await ctx.db.query.appointment.findFirst({
				where: { id: appointmentId },
				with: {
					dentist: true,
					service: true,
				},
			});

			if (!created) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "สร้างนัดหมายไม่สำเร็จ",
				});
			}

			return created;
		}),

	lookup: publicProcedure
		.input(
			z.object({
				phone: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
				bookingCode: z.string().min(1, "กรุณากรอกรหัสการจอง"),
			}),
		)
		.query(async ({ ctx, input }) => {
			const apt = await ctx.db.query.appointment.findFirst({
				where: {
					bookingCode: input.bookingCode.trim().toUpperCase(),
					patientPhone: input.phone.trim(),
				},
				with: {
					dentist: true,
					service: true,
				},
			});

			if (!apt) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "ไม่พบข้อมูลการนัดหมาย กรุณาตรวจสอบรหัสการจองและเบอร์โทรศัพท์",
				});
			}

			return apt;
		}),

	adminList: publicProcedure
		.input(
			z.object({
				date: z.string().optional(),
				dentistId: z.string().optional(),
				status: z
					.enum([
						"ALL",
						"PENDING",
						"CONFIRMED",
						"IN_TREATMENT",
						"COMPLETED",
						"CANCELLED",
						"NO_SHOW",
					])
					.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const whereFilter: Record<string, unknown> = {};
			if (input.date) whereFilter.appointmentDate = input.date;
			if (input.dentistId && input.dentistId !== "ALL")
				whereFilter.dentistId = input.dentistId;
			if (input.status && input.status !== "ALL")
				whereFilter.status = input.status;

			const appointments = await ctx.db.query.appointment.findMany({
				where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined,
				with: {
					dentist: true,
					service: true,
				},
			});

			// Sort by date and startTime
			appointments.sort((a, b) => {
				if (a.appointmentDate !== b.appointmentDate) {
					return a.appointmentDate.localeCompare(b.appointmentDate);
				}
				return a.startTime.localeCompare(b.startTime);
			});

			// Check collision warnings for dentist schedule blocks (ADR-0002)
			const dates = Array.from(
				new Set(appointments.map((a) => a.appointmentDate)),
			);
			const blocks =
				dates.length > 0
					? await ctx.db
							.select()
							.from(scheduleBlock)
							.where(inArray(scheduleBlock.date, dates))
					: [];

			return appointments.map((apt) => {
				const hasScheduleBlockCollision = detectScheduleBlockCollision(
					apt,
					blocks,
				);

				return {
					...apt,
					hasScheduleBlockCollision,
					hasLeaveCollision: hasScheduleBlockCollision, // backward compatibility
				};
			});
		}),

	updateStatus: publicProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum([
					"PENDING",
					"CONFIRMED",
					"IN_TREATMENT",
					"COMPLETED",
					"CANCELLED",
					"NO_SHOW",
				]),
				internalNotes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(appointment)
				.set({
					status: input.status,
					...(input.internalNotes
						? { internalNotes: input.internalNotes }
						: {}),
				})
				.where(eq(appointment.id, input.id))
				.execute();

			return { success: true };
		}),

	reschedule: publicProcedure
		.input(
			z.object({
				id: z.string(),
				newDate: z.string(),
				newStartTime: z.string(),
				newDentistId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.appointment.findFirst({
				where: { id: input.id },
				with: { service: true },
			});

			if (!existing?.service) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "ไม่พบการนัดหมายที่ต้องการเลื่อน",
				});
			}

			const targetDentistId = input.newDentistId || existing.dentistId;
			const duration = existing.service.durationMinutes;
			const newEndTime = addMinutesToTime(input.newStartTime, duration);

			// Validate date format
			try {
				parseIsoDate(input.newDate);
			} catch (_err) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)",
				});
			}

			// Fetch target dentist
			const targetDentist = await ctx.db.query.dentist.findFirst({
				where: { id: targetDentistId },
				with: {
					dutySchedules: true,
					services: true,
				},
			});

			if (!targetDentist?.isActive) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "ไม่พบข้อมูลทันตแพทย์ที่เลือก หรือทันตแพทย์ไม่ได้เปิดให้บริการ",
				});
			}

			// Fetch Schedule Blocks and existing appointments for target dentist on new date
			const blocks = await ctx.db
				.select()
				.from(scheduleBlock)
				.where(
					and(
						eq(scheduleBlock.date, input.newDate),
						eq(scheduleBlock.dentistId, targetDentistId),
					),
				);

			const conflicts = await ctx.db
				.select()
				.from(appointment)
				.where(
					and(
						eq(appointment.appointmentDate, input.newDate),
						eq(appointment.dentistId, targetDentistId),
						ne(appointment.status, "CANCELLED"),
					),
				);

			// Validate eligibility via pure domain module
			const validation = validateRescheduleEligibility({
				targetDentist,
				serviceId: existing.serviceId,
				newDate: input.newDate,
				newStartTime: input.newStartTime,
				newEndTime,
				scheduleBlocks: blocks,
				existingAppointments: conflicts,
				currentAppointmentId: input.id,
			});

			if (!validation.valid) {
				throw new TRPCError({
					code: validation.code,
					message: validation.reason,
				});
			}

			const auditNote = formatRescheduleAuditNote(
				existing,
				input.newDate,
				input.newStartTime,
				newEndTime,
			);
			const internalNotes = existing.internalNotes
				? `${existing.internalNotes} | ${auditNote}`
				: auditNote;

			await ctx.db
				.update(appointment)
				.set({
					dentistId: targetDentistId,
					appointmentDate: input.newDate,
					startTime: input.newStartTime,
					endTime: newEndTime,
					status: "CONFIRMED",
					internalNotes,
				})
				.where(eq(appointment.id, input.id))
				.execute();

			return {
				success: true,
				newDate: input.newDate,
				newStartTime: input.newStartTime,
			};
		}),

	addScheduleBlock: publicProcedure
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
