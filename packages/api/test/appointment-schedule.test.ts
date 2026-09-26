import { describe, expect, it } from "bun:test";
import {
	addMinutesToTime,
	type CandidateDentist,
	CLINIC_CLOSE_TIME,
	CLINIC_OPEN_TIME,
	detectScheduleBlockCollision,
	generateAvailableTimeSlots,
	isDentistOnDuty,
	isTimeOverlapping,
	isWithinOperatingHours,
	minutesToTime,
	parseIsoDate,
	selectAvailableDentist,
	timeToMinutes,
	validateRescheduleEligibility,
} from "../src/domain/appointment-schedule";

describe("Domain: AppointmentSchedule Pure Module", () => {
	// Mock dentists matching clinic specification
	const drMay: CandidateDentist = {
		id: "dentist_may",
		name: "ทพญ. เมษา สุขเกษม",
		isActive: true,
		dutySchedules: [
			{ dayOfWeek: 1, startTime: "10:00", endTime: "20:00", isActive: true }, // Mon
			{ dayOfWeek: 3, startTime: "10:00", endTime: "20:00", isActive: true }, // Wed
			{ dayOfWeek: 5, startTime: "10:00", endTime: "20:00", isActive: true }, // Fri
			{ dayOfWeek: 6, startTime: "10:00", endTime: "20:00", isActive: true }, // Sat
		],
		services: [
			{ serviceId: "service_scaling" },
			{ serviceId: "service_whitening" },
		],
	};

	const drChanon: CandidateDentist = {
		id: "dentist_chanon",
		name: "ทพ. ชานนท์ วงศ์สว่าง",
		isActive: true,
		dutySchedules: [
			{ dayOfWeek: 0, startTime: "10:00", endTime: "20:00", isActive: true }, // Sun
			{ dayOfWeek: 2, startTime: "10:00", endTime: "20:00", isActive: true }, // Tue
			{ dayOfWeek: 4, startTime: "10:00", endTime: "20:00", isActive: true }, // Thu
		],
		services: [
			{ serviceId: "service_scaling" },
			{ serviceId: "service_ortho_consult" },
			{ serviceId: "service_ortho_appliance" },
		],
	};

	describe("1. Time Interval & Arithmetic", () => {
		it("converts HH:mm to minutes and back accurately", () => {
			expect(timeToMinutes("10:00")).toBe(600);
			expect(timeToMinutes("14:30")).toBe(870);
			expect(timeToMinutes("20:00")).toBe(1200);
			expect(minutesToTime(600)).toBe("10:00");
			expect(minutesToTime(870)).toBe("14:30");
			expect(minutesToTime(1200)).toBe("20:00");
		});

		it("adds minutes correctly across durations", () => {
			expect(addMinutesToTime("10:00", 30)).toBe("10:30");
			expect(addMinutesToTime("10:00", 60)).toBe("11:00");
			expect(addMinutesToTime("19:30", 30)).toBe("20:00");
		});

		it("detects half-open interval overlap correctly for 30m and 60m", () => {
			// Overlapping cases
			expect(isTimeOverlapping("10:00", "11:00", "10:30", "11:30")).toBe(true);
			expect(isTimeOverlapping("10:00", "10:30", "10:00", "10:30")).toBe(true);
			expect(isTimeOverlapping("10:00", "11:00", "10:15", "10:45")).toBe(true);

			// Adjacent non-overlapping cases (half-open [start, end))
			expect(isTimeOverlapping("10:00", "10:30", "10:30", "11:00")).toBe(false);
			expect(isTimeOverlapping("10:30", "11:00", "10:00", "10:30")).toBe(false);
			expect(isTimeOverlapping("10:00", "11:00", "11:00", "12:00")).toBe(false);
		});

		it("parses ISO date and extracts correct day-of-week", () => {
			// 2026-09-25 was Friday (dayOfWeek: 5)
			const parts = parseIsoDate("2026-09-25");
			expect(parts.year).toBe(2026);
			expect(parts.month).toBe(9);
			expect(parts.day).toBe(25);
			expect(parts.dayOfWeek).toBe(5);

			// 2026-09-26 was Saturday (dayOfWeek: 6)
			expect(parseIsoDate("2026-09-26").dayOfWeek).toBe(6);
			// 2026-09-27 was Sunday (dayOfWeek: 0)
			expect(parseIsoDate("2026-09-27").dayOfWeek).toBe(0);
		});
	});

	describe("2. Clinic Boundary & Operating Hours", () => {
		it("defines correct clinic operating constants", () => {
			expect(CLINIC_OPEN_TIME).toBe("10:00");
			expect(CLINIC_CLOSE_TIME).toBe("20:00");
		});

		it("validates intervals within clinic operating hours (10:00 - 20:00)", () => {
			expect(isWithinOperatingHours("10:00", "10:30")).toBe(true);
			expect(isWithinOperatingHours("10:00", "11:00")).toBe(true);
			expect(isWithinOperatingHours("19:00", "20:00")).toBe(true);
			expect(isWithinOperatingHours("19:30", "20:00")).toBe(true);

			// Out of bounds
			expect(isWithinOperatingHours("09:30", "10:30")).toBe(false);
			expect(isWithinOperatingHours("19:30", "20:30")).toBe(false);
			expect(isWithinOperatingHours("20:00", "20:30")).toBe(false);
			expect(isWithinOperatingHours("11:00", "10:00")).toBe(false); // inverted
		});
	});

	describe("3. Duty Schedule Day-of-Week Matching", () => {
		it("correctly identifies Dr. May's duty days (Mon, Wed, Fri, Sat)", () => {
			// Friday (5) at 10:00-11:00 -> on duty
			expect(isDentistOnDuty(drMay.dutySchedules, 5, "10:00", "11:00")).toBe(
				true,
			);
			// Saturday (6) at 19:00-20:00 -> on duty
			expect(isDentistOnDuty(drMay.dutySchedules, 6, "19:00", "20:00")).toBe(
				true,
			);
			// Sunday (0) -> NOT on duty
			expect(isDentistOnDuty(drMay.dutySchedules, 0, "10:00", "11:00")).toBe(
				false,
			);
			// Tuesday (2) -> NOT on duty
			expect(isDentistOnDuty(drMay.dutySchedules, 2, "10:00", "11:00")).toBe(
				false,
			);
		});

		it("correctly identifies Dr. Chanon's duty days (Tue, Thu, Sun)", () => {
			// Sunday (0) -> on duty
			expect(isDentistOnDuty(drChanon.dutySchedules, 0, "10:00", "11:00")).toBe(
				true,
			);
			// Tuesday (2) -> on duty
			expect(isDentistOnDuty(drChanon.dutySchedules, 2, "14:00", "15:00")).toBe(
				true,
			);
			// Friday (5) -> NOT on duty
			expect(isDentistOnDuty(drChanon.dutySchedules, 5, "10:00", "11:00")).toBe(
				false,
			);
		});
	});

	describe("4. Time Slot Generation & Granularity", () => {
		it("generates slots up to 19:30 for 30m services and 19:00 for 60m services", () => {
			// 2026-09-25 is Friday: Dr. May on duty
			const slots30 = generateAvailableTimeSlots({
				serviceDurationMinutes: 30,
				date: "2026-09-25",
				candidateDentists: [drMay],
				scheduleBlocks: [],
				existingAppointments: [],
			});

			expect(slots30.length).toBe(20); // (20:00 - 10:00) / 0.5 = 20 slots
			expect(slots30[0]?.time).toBe("10:00");
			expect(slots30[0]?.endTime).toBe("10:30");
			expect(slots30[slots30.length - 1]?.time).toBe("19:30");
			expect(slots30[slots30.length - 1]?.endTime).toBe("20:00");
			expect(slots30.every((s) => s.isAvailable)).toBe(true);

			const slots60 = generateAvailableTimeSlots({
				serviceDurationMinutes: 60,
				date: "2026-09-25",
				candidateDentists: [drMay],
				scheduleBlocks: [],
				existingAppointments: [],
			});

			expect(slots60.length).toBe(19); // from 10:00 to 19:00 with 30m steps
			expect(slots60[0]?.time).toBe("10:00");
			expect(slots60[0]?.endTime).toBe("11:00");
			expect(slots60[slots60.length - 1]?.time).toBe("19:00");
			expect(slots60[slots60.length - 1]?.endTime).toBe("20:00");
		});

		it("marks slots unavailable when overlapping with existing appointment or schedule block", () => {
			const slots = generateAvailableTimeSlots({
				serviceDurationMinutes: 60,
				date: "2026-09-25",
				candidateDentists: [drMay],
				scheduleBlocks: [
					{
						dentistId: "dentist_may",
						date: "2026-09-25",
						startTime: "14:00",
						endTime: "16:00",
					},
				],
				existingAppointments: [
					{
						dentistId: "dentist_may",
						appointmentDate: "2026-09-25",
						startTime: "10:30",
						endTime: "11:30",
						status: "CONFIRMED",
					},
				],
			});

			// 10:00-11:00 overlaps with 10:30-11:30 -> unavailable
			const slot1000 = slots.find((s) => s.time === "10:00");
			expect(slot1000?.isAvailable).toBe(false);

			// 10:30-11:30 overlaps with 10:30-11:30 -> unavailable
			const slot1030 = slots.find((s) => s.time === "10:30");
			expect(slot1030?.isAvailable).toBe(false);

			// 11:30-12:30 is adjacent -> available!
			const slot1130 = slots.find((s) => s.time === "11:30");
			expect(slot1130?.isAvailable).toBe(true);

			// 14:00-15:00 and 15:00-16:00 are blocked by schedule block -> unavailable
			expect(slots.find((s) => s.time === "14:00")?.isAvailable).toBe(false);
			expect(slots.find((s) => s.time === "14:30")?.isAvailable).toBe(false);
			expect(slots.find((s) => s.time === "15:00")?.isAvailable).toBe(false);

			// 16:00-17:00 is free -> available!
			expect(slots.find((s) => s.time === "16:00")?.isAvailable).toBe(true);
		});

		it("selects the first available candidate dentist without conflicts", () => {
			// On Friday 2026-09-25: Dr. May on duty, Dr. Chanon off-duty
			const selected = selectAvailableDentist({
				candidateDentists: [drChanon, drMay],
				date: "2026-09-25",
				startTime: "10:00",
				endTime: "10:30",
				scheduleBlocks: [],
				existingAppointments: [],
			});
			expect(selected?.id).toBe("dentist_may");

			// If Dr. May is occupied, returns null
			const none = selectAvailableDentist({
				candidateDentists: [drMay],
				date: "2026-09-25",
				startTime: "10:00",
				endTime: "10:30",
				scheduleBlocks: [],
				existingAppointments: [
					{
						dentistId: "dentist_may",
						appointmentDate: "2026-09-25",
						startTime: "10:00",
						endTime: "10:30",
						status: "PENDING",
					},
				],
			});
			expect(none).toBeNull();
		});
	});

	describe("5. Schedule Block Collision Detection (ADR-0002)", () => {
		it("flags collision on active appointments overlapping with schedule block", () => {
			const blocks = [
				{
					dentistId: "dentist_may",
					date: "2026-09-25",
					startTime: "13:00",
					endTime: "16:00",
				},
			];

			const conflictingApt = {
				dentistId: "dentist_may",
				appointmentDate: "2026-09-25",
				startTime: "14:00",
				endTime: "15:00",
				status: "CONFIRMED",
			};

			const nonConflictingApt = {
				dentistId: "dentist_may",
				appointmentDate: "2026-09-25",
				startTime: "10:00",
				endTime: "11:00",
				status: "CONFIRMED",
			};

			const cancelledApt = {
				dentistId: "dentist_may",
				appointmentDate: "2026-09-25",
				startTime: "14:00",
				endTime: "15:00",
				status: "CANCELLED",
			};

			expect(detectScheduleBlockCollision(conflictingApt, blocks)).toBe(true);
			expect(detectScheduleBlockCollision(nonConflictingApt, blocks)).toBe(
				false,
			);
			expect(detectScheduleBlockCollision(cancelledApt, blocks)).toBe(false);
		});
	});

	describe("6. Reschedule Eligibility Validation", () => {
		it("rejects reschedule when target dentist has schedule block overlap", () => {
			const result = validateRescheduleEligibility({
				targetDentist: drMay,
				serviceId: "service_whitening",
				newDate: "2026-09-25", // Friday (on duty)
				newStartTime: "14:00",
				newEndTime: "15:00",
				scheduleBlocks: [
					{
						dentistId: "dentist_may",
						date: "2026-09-25",
						startTime: "13:00",
						endTime: "16:00",
					},
				],
				existingAppointments: [],
				currentAppointmentId: "apt_123",
			});

			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.code).toBe("CONFLICT");
				expect(result.reason).toContain("Schedule Block");
			}
		});

		it("rejects reschedule when target dentist is off-duty", () => {
			const result = validateRescheduleEligibility({
				targetDentist: drMay,
				serviceId: "service_whitening",
				newDate: "2026-09-27", // Sunday -> Dr. May off-duty
				newStartTime: "14:00",
				newEndTime: "15:00",
				scheduleBlocks: [],
				existingAppointments: [],
				currentAppointmentId: "apt_123",
			});

			expect(result.valid).toBe(false);
			if (!result.valid) {
				expect(result.code).toBe("CONFLICT");
				expect(result.reason).toBe(
					"ทันตแพทย์ไม่มีตารางปฏิบัติงานในวันหรือช่วงเวลาดังกล่าว",
				);
			}
		});

		it("approves reschedule when target dentist is free on new date/time", () => {
			const result = validateRescheduleEligibility({
				targetDentist: drMay,
				serviceId: "service_whitening",
				newDate: "2026-09-25", // Friday (on duty)
				newStartTime: "16:00",
				newEndTime: "17:00",
				scheduleBlocks: [
					{
						dentistId: "dentist_may",
						date: "2026-09-25",
						startTime: "13:00",
						endTime: "16:00",
					},
				],
				existingAppointments: [],
				currentAppointmentId: "apt_123",
			});

			expect(result.valid).toBe(true);
		});
	});
});
