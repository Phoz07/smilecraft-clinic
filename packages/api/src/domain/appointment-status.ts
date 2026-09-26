/**
 * Canonical Appointment Status Registry & Metadata
 *
 * Provides a single, exhaustive definition of all 6 appointment statuses
 * and their presentation metadata (labels, badge styling, descriptions)
 * to prevent drift across Admin and Patient Lookup interfaces.
 */

export const APPOINTMENT_STATUSES = [
	"PENDING",
	"CONFIRMED",
	"IN_TREATMENT",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface StatusMetadata {
	status: AppointmentStatus;
	label: string;
	badgeLabel: string;
	description: string;
	badgeColor: string; // Tailwind color classes for admin badge
	lookupCardBg: string; // Tailwind classes for patient lookup pass
}

export const STATUS_METADATA_REGISTRY: Record<
	AppointmentStatus,
	StatusMetadata
> = {
	PENDING: {
		status: "PENDING",
		label: "รอยืนยัน",
		badgeLabel: "🟡 รอยืนยัน (Pending)",
		description: "ทางคลินิกได้ล็อกช่วงเวลาให้ท่านเรียบร้อยแล้ว รอเคาน์เตอร์โทรยืนยัน",
		badgeColor:
			"bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
		lookupCardBg:
			"bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300",
	},
	CONFIRMED: {
		status: "CONFIRMED",
		label: "ยืนยันแล้ว",
		badgeLabel: "🟢 ยืนยันแล้ว (Confirmed)",
		description:
			"นัดหมายได้รับการยืนยันแล้ว สามารถเดินทางมาเข้ารับบริการตามวันและเวลาที่นัดได้ทันที",
		badgeColor:
			"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
		lookupCardBg:
			"bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300",
	},
	IN_TREATMENT: {
		status: "IN_TREATMENT",
		label: "กำลังรักษา",
		badgeLabel: "🔵 กำลังรักษา (In Treatment)",
		description: "คนไข้อำนวยความสะดวกอยู่ในห้องตรวจกับทันตแพทย์",
		badgeColor:
			"bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
		lookupCardBg:
			"bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300",
	},
	COMPLETED: {
		status: "COMPLETED",
		label: "เสร็จสิ้น",
		badgeLabel: "🟣 เสร็จสิ้น (Completed)",
		description: "การรักษาเสร็จสิ้นสมบูรณ์ ขอให้มีสุขภาพฟันและรอยยิ้มที่สดใส",
		badgeColor:
			"bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
		lookupCardBg:
			"bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300",
	},
	CANCELLED: {
		status: "CANCELLED",
		label: "ยกเลิกแล้ว",
		badgeLabel: "🔴 ยกเลิกแล้ว (Cancelled)",
		description: "นัดหมายนี้ถูกยกเลิกแล้ว และระบบได้ปลดล็อกเวลาว่างคืนสู่ระบบ",
		badgeColor:
			"bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
		lookupCardBg:
			"bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300",
	},
	NO_SHOW: {
		status: "NO_SHOW",
		label: "ไม่มาตามนัด",
		badgeLabel: "⚫ ไม่มาตามนัด (No-show)",
		description: "ไม่พบการเข้ารับบริการตามช่วงเวลานัดหมาย",
		badgeColor:
			"bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
		lookupCardBg:
			"bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300",
	},
};

export function getStatusMetadata(status: string): StatusMetadata {
	if (status in STATUS_METADATA_REGISTRY) {
		return STATUS_METADATA_REGISTRY[status as AppointmentStatus];
	}
	return {
		status: "PENDING",
		label: status,
		badgeLabel: status,
		description: "",
		badgeColor: "bg-muted text-muted-foreground border-border",
		lookupCardBg: "bg-muted text-muted-foreground border-border",
	};
}
