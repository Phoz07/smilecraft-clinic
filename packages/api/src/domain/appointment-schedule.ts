/**
 * Appointment Scheduling Pure Domain Module
 *
 * Consolidates all time interval arithmetic, duty schedule matching,
 * schedule block collision detection, and appointment conflict enforcement
 * behind a unified, cohesive domain interface.
 */

// Clinic operating hours & slot constants
export const CLINIC_OPEN_TIME = "10:00";
export const CLINIC_CLOSE_TIME = "20:00";
export const SLOT_GRANULARITY_MINUTES = 30;

export interface DutyScheduleItem {
	dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	isActive: boolean;
}

export interface ScheduleBlockItem {
	id?: string;
	dentistId: string;
	date: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	reason?: string | null;
}

export interface AppointmentConflictItem {
	id?: string;
	dentistId: string;
	appointmentDate: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	status: string;
}

export interface CandidateDentist {
	id: string;
	name: string;
	isActive: boolean;
	dutySchedules: DutyScheduleItem[];
	services?: Array<{ serviceId: string }>;
}

export interface TimeSlotAvailability {
	time: string;
	endTime: string;
	isAvailable: boolean;
	availableDentistIds: string[];
}

export interface DateParts {
	year: number;
	month: number;
	day: number;
	dayOfWeek: number;
}

/**
 * Converts HH:mm string to total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
	const [hours, mins] = timeStr.split(":").map(Number);
	return (hours ?? 0) * 60 + (mins ?? 0);
}

/**
 * Converts total minutes from midnight to HH:mm string.
 */
export function minutesToTime(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60);
	const mins = totalMinutes % 60;
	return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Adds minutes to an HH:mm time string.
 */
export function addMinutesToTime(timeStr: string, minutes: number): string {
	return minutesToTime(timeToMinutes(timeStr) + minutes);
}

/**
 * Checks whether two half-open time intervals [startA, endA) and [startB, endB) overlap.
 */
export function isTimeOverlapping(
	startA: string,
	endA: string,
	startB: string,
	endB: string,
): boolean {
	const startAMin = timeToMinutes(startA);
	const endAMin = timeToMinutes(endA);
	const startBMin = timeToMinutes(startB);
	const endBMin = timeToMinutes(endB);
	return Math.max(startAMin, startBMin) < Math.min(endAMin, endBMin);
}

/**
 * Parses YYYY-MM-DD into numeric year, month, day, and dayOfWeek (0=Sun..6=Sat).
 * Throws an Error if format is invalid.
 */
export function parseIsoDate(isoDate: string): DateParts {
	const [year, month, day] = isoDate.split("-").map(Number);
	if (
		!year ||
		!month ||
		!day ||
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > 31
	) {
		throw new Error(`รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD): ${isoDate}`);
	}
	const dateObj = new Date(year, month - 1, day);
	return {
		year,
		month,
		day,
		dayOfWeek: dateObj.getDay(),
	};
}

/**
 * Validates whether an interval [startTime, endTime] falls fully within clinic operating hours.
 */
export function isWithinOperatingHours(
	startTime: string,
	endTime: string,
): boolean {
	const startMins = timeToMinutes(startTime);
	const endMins = timeToMinutes(endTime);
	const openMins = timeToMinutes(CLINIC_OPEN_TIME);
	const closeMins = timeToMinutes(CLINIC_CLOSE_TIME);
	return startMins >= openMins && endMins <= closeMins && startMins < endMins;
}

/**
 * Checks whether a dentist is on duty for the entire duration of [startTime, endTime] on dayOfWeek.
 */
export function isDentistOnDuty(
	dutySchedules: DutyScheduleItem[],
	dayOfWeek: number,
	startTime: string,
	endTime: string,
): boolean {
	const slotStartMins = timeToMinutes(startTime);
	const slotEndMins = timeToMinutes(endTime);

	return dutySchedules.some(
		(ds) =>
			ds.isActive &&
			ds.dayOfWeek === dayOfWeek &&
			slotStartMins >= timeToMinutes(ds.startTime) &&
			slotEndMins <= timeToMinutes(ds.endTime),
	);
}

/**
 * Checks whether a dentist has an active schedule block overlapping [startTime, endTime] on date.
 */
export function hasScheduleBlockConflict(
	scheduleBlocks: ScheduleBlockItem[],
	dentistId: string,
	date: string,
	startTime: string,
	endTime: string,
): boolean {
	return scheduleBlocks.some(
		(b) =>
			b.dentistId === dentistId &&
			b.date === date &&
			isTimeOverlapping(startTime, endTime, b.startTime, b.endTime),
	);
}

/**
 * Checks whether a dentist has an existing active (non-cancelled) appointment overlapping [startTime, endTime] on date.
 */
export function hasAppointmentConflict(
	existingAppointments: AppointmentConflictItem[],
	dentistId: string,
	date: string,
	startTime: string,
	endTime: string,
	excludeAppointmentId?: string,
): boolean {
	return existingAppointments.some(
		(apt) =>
			apt.dentistId === dentistId &&
			apt.appointmentDate === date &&
			apt.status !== "CANCELLED" &&
			(excludeAppointmentId ? apt.id !== excludeAppointmentId : true) &&
			isTimeOverlapping(startTime, endTime, apt.startTime, apt.endTime),
	);
}

/**
 * Comprehensive check for whether a single dentist can accept an appointment at [startTime, endTime].
 */
export function isDentistSlotAvailable(params: {
	dentist: CandidateDentist;
	dayOfWeek: number;
	date: string;
	startTime: string;
	endTime: string;
	scheduleBlocks: ScheduleBlockItem[];
	existingAppointments: AppointmentConflictItem[];
	excludeAppointmentId?: string;
}): boolean {
	const {
		dentist,
		dayOfWeek,
		date,
		startTime,
		endTime,
		scheduleBlocks,
		existingAppointments,
		excludeAppointmentId,
	} = params;

	if (!dentist.isActive) return false;

	// 1. Must be on duty for the entire duration
	if (!isDentistOnDuty(dentist.dutySchedules, dayOfWeek, startTime, endTime)) {
		return false;
	}

	// 2. Must not overlap any schedule block (ADR-0002)
	if (
		hasScheduleBlockConflict(
			scheduleBlocks,
			dentist.id,
			date,
			startTime,
			endTime,
		)
	) {
		return false;
	}

	// 3. Must not conflict with any non-cancelled appointment (ADR-0001)
	if (
		hasAppointmentConflict(
			existingAppointments,
			dentist.id,
			date,
			startTime,
			endTime,
			excludeAppointmentId,
		)
	) {
		return false;
	}

	return true;
}

/**
 * Generates all discrete operational time slots between 10:00 and 20:00,
 * tagged with availability and eligible dentists.
 */
export function generateAvailableTimeSlots(params: {
	serviceDurationMinutes: number;
	date: string;
	candidateDentists: CandidateDentist[];
	scheduleBlocks: ScheduleBlockItem[];
	existingAppointments: AppointmentConflictItem[];
}): TimeSlotAvailability[] {
	const {
		serviceDurationMinutes,
		date,
		candidateDentists,
		scheduleBlocks,
		existingAppointments,
	} = params;

	const { dayOfWeek } = parseIsoDate(date);
	const startLimit = timeToMinutes(CLINIC_OPEN_TIME);
	const endLimit = timeToMinutes(CLINIC_CLOSE_TIME) - serviceDurationMinutes;

	const slots: TimeSlotAvailability[] = [];

	for (let min = startLimit; min <= endLimit; min += SLOT_GRANULARITY_MINUTES) {
		const slotStartTime = minutesToTime(min);
		const slotEndTime = addMinutesToTime(slotStartTime, serviceDurationMinutes);

		const availableDentistIds: string[] = [];

		for (const dentist of candidateDentists) {
			if (
				isDentistSlotAvailable({
					dentist,
					dayOfWeek,
					date,
					startTime: slotStartTime,
					endTime: slotEndTime,
					scheduleBlocks,
					existingAppointments,
				})
			) {
				availableDentistIds.push(dentist.id);
			}
		}

		slots.push({
			time: slotStartTime,
			endTime: slotEndTime,
			isAvailable: availableDentistIds.length > 0,
			availableDentistIds,
		});
	}

	return slots;
}

/**
 * Selects the first available candidate dentist who is free for the given slot.
 * Returns the dentist ID or null if all candidates have conflicts.
 */
export function selectAvailableDentist(params: {
	candidateDentists: CandidateDentist[];
	date: string;
	startTime: string;
	endTime: string;
	scheduleBlocks: ScheduleBlockItem[];
	existingAppointments: AppointmentConflictItem[];
}): CandidateDentist | null {
	const {
		candidateDentists,
		date,
		startTime,
		endTime,
		scheduleBlocks,
		existingAppointments,
	} = params;
	const { dayOfWeek } = parseIsoDate(date);

	for (const dentist of candidateDentists) {
		if (
			isDentistSlotAvailable({
				dentist,
				dayOfWeek,
				date,
				startTime,
				endTime,
				scheduleBlocks,
				existingAppointments,
			})
		) {
			return dentist;
		}
	}

	return null;
}

/**
 * Validates whether a reschedule request can be safely committed.
 * Returns null on success, or a descriptive Thai error message on rejection.
 */
export function validateRescheduleEligibility(params: {
	targetDentist: CandidateDentist;
	serviceId: string;
	newDate: string;
	newStartTime: string;
	newEndTime: string;
	scheduleBlocks: ScheduleBlockItem[];
	existingAppointments: AppointmentConflictItem[];
	currentAppointmentId: string;
}):
	| { valid: true }
	| { valid: false; reason: string; code: "BAD_REQUEST" | "CONFLICT" } {
	const {
		targetDentist,
		serviceId,
		newDate,
		newStartTime,
		newEndTime,
		scheduleBlocks,
		existingAppointments,
		currentAppointmentId,
	} = params;

	// 1. Operating hours validation
	if (!isWithinOperatingHours(newStartTime, newEndTime)) {
		return {
			valid: false,
			reason: `เวลานัดหมายต้องอยู่ระหว่างเวลาเปิดทำการ (${CLINIC_OPEN_TIME} - ${CLINIC_CLOSE_TIME} น.)`,
			code: "BAD_REQUEST",
		};
	}

	// 2. Active dentist validation
	if (!targetDentist.isActive) {
		return {
			valid: false,
			reason: "ไม่พบข้อมูลทันตแพทย์ที่เลือก หรือทันตแพทย์ไม่ได้เปิดให้บริการ",
			code: "BAD_REQUEST",
		};
	}

	// 3. Service capability check
	if (
		targetDentist.services &&
		!targetDentist.services.some((s) => s.serviceId === serviceId)
	) {
		return {
			valid: false,
			reason: "ทันตแพทย์ท่านนี้ไม่ได้รับให้บริการประเภทนี้",
			code: "BAD_REQUEST",
		};
	}

	// 4. Duty schedule check
	const { dayOfWeek } = parseIsoDate(newDate);
	if (
		!isDentistOnDuty(
			targetDentist.dutySchedules,
			dayOfWeek,
			newStartTime,
			newEndTime,
		)
	) {
		return {
			valid: false,
			reason: "ทันตแพทย์ไม่มีตารางปฏิบัติงานในวันหรือช่วงเวลาดังกล่าว",
			code: "CONFLICT",
		};
	}

	// 5. Schedule block collision check (ADR-0002)
	if (
		hasScheduleBlockConflict(
			scheduleBlocks,
			targetDentist.id,
			newDate,
			newStartTime,
			newEndTime,
		)
	) {
		return {
			valid: false,
			reason: "ช่วงเวลาใหม่ที่เลือกตรงกับช่วงเวลาที่ทันตแพทย์ติดภารกิจลา (Schedule Block)",
			code: "CONFLICT",
		};
	}

	// 6. Appointment overlap conflict check (ADR-0001)
	if (
		hasAppointmentConflict(
			existingAppointments,
			targetDentist.id,
			newDate,
			newStartTime,
			newEndTime,
			currentAppointmentId,
		)
	) {
		return {
			valid: false,
			reason: "ช่วงเวลาใหม่ที่เลือกมีผู้จองแล้ว กรุณาเลือกช่วงเวลาอื่น",
			code: "CONFLICT",
		};
	}

	return { valid: true };
}

/**
 * Checks whether an appointment has a collision with any dentist schedule block.
 * Implements ADR-0002 collision detection for admin counter warnings.
 */
export function detectScheduleBlockCollision(
	appointment: AppointmentConflictItem,
	scheduleBlocks: ScheduleBlockItem[],
): boolean {
	if (appointment.status === "CANCELLED") return false;

	return scheduleBlocks.some(
		(b) =>
			b.dentistId === appointment.dentistId &&
			b.date === appointment.appointmentDate &&
			isTimeOverlapping(
				appointment.startTime,
				appointment.endTime,
				b.startTime,
				b.endTime,
			),
	);
}

/**
 * Standard audit trail formatting for rescheduled appointments.
 */
export function formatRescheduleAuditNote(
	existing: { appointmentDate: string; startTime: string; endTime: string },
	newDate: string,
	newStartTime: string,
	newEndTime: string,
): string {
	return `เลื่อนนัดจาก ${existing.appointmentDate} (${existing.startTime}-${existing.endTime}) เป็น ${newDate} (${newStartTime}-${newEndTime})`;
}
