"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	ExternalLink,
	Filter,
	LayoutGrid,
	List,
	Phone,
	Plus,
	RefreshCw,
	Search,
	ShieldAlert,
	Sparkles,
	Stethoscope,
	User,
	X,
	XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatThaiDate } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

type AppointmentStatus =
	| "ALL"
	| "PENDING"
	| "CONFIRMED"
	| "IN_TREATMENT"
	| "COMPLETED"
	| "CANCELLED"
	| "NO_SHOW";

export default function AdminPage() {
	const queryClient = useQueryClient();
	const [selectedDate, setSelectedDate] = useState("2026-09-25");
	const [selectedDentistId, setSelectedDentistId] = useState<string>("ALL");
	const [selectedStatus, setSelectedStatus] =
		useState<AppointmentStatus>("ALL");
	const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
	const [searchKeyword, setSearchKeyword] = useState("");

	// Modals state
	const [rescheduleTarget, setRescheduleTarget] = useState<any | null>(null);
	const [rescheduleDate, setRescheduleDate] = useState("2026-09-26");
	const [rescheduleTime, setRescheduleTime] = useState<string | null>(null);
	const [isScheduleBlockModalOpen, setIsScheduleBlockModalOpen] =
		useState(false);

	// Schedule Block Form state (ADR-0002)
	const [blockDentistId, setBlockDentistId] = useState("dentist_may");
	const [blockDate, setBlockDate] = useState("2026-09-25");
	const [blockStartTime, setBlockStartTime] = useState("10:00");
	const [blockEndTime, setBlockEndTime] = useState("20:00");
	const [blockReason, setBlockReason] = useState("ติดภารกิจสัมมนาวิชาการ");

	// Queries
	const dentistsQuery = useQuery(trpc.dentists.list.queryOptions());
	const appointmentsQuery = useQuery(
		trpc.appointments.adminList.queryOptions({
			date: selectedDate,
			dentistId: selectedDentistId,
			status: selectedStatus,
		}),
	);

	// Reschedule Slots Query
	const rescheduleSlotsQuery = useQuery(
		trpc.appointments.getAvailableSlots.queryOptions(
			{
				serviceId: rescheduleTarget?.serviceId || "",
				date: rescheduleDate,
				dentistId: rescheduleTarget?.dentistId,
			},
			{
				enabled: !!rescheduleTarget && !!rescheduleDate,
			},
		),
	);

	// Mutations
	const updateStatusMutation = useMutation(
		trpc.appointments.updateStatus.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("อัปเดตสถานะนัดหมายสำเร็จ");
			},
			onError: (err) => {
				toast.error("อัปเดตไม่สำเร็จ", { description: err.message });
			},
		}),
	);

	const rescheduleMutation = useMutation(
		trpc.appointments.reschedule.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries();
				toast.success("เลื่อนเวลานัดหมายสำเร็จ!", {
					description: `ย้ายไปวันที่ ${data.newDate} เวลา ${data.newStartTime} น. (ปรับเป็นยืนยันแล้ว)`,
				});
				setRescheduleTarget(null);
				setRescheduleTime(null);
			},
			onError: (err) => {
				toast.error("เลื่อนนัดไม่สำเร็จ", { description: err.message });
			},
		}),
	);

	const addBlockMutation = useMutation(
		trpc.appointments.addScheduleBlock.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("บันทึก Schedule Block เรียบร้อย!", {
					description:
						"ระบบได้ทำการ Soft Block ปิดรับจองใหม่ และแจ้งเตือนหากมีคิวเดิมซ้อนทับ",
				});
				setIsScheduleBlockModalOpen(false);
			},
			onError: (err) => {
				toast.error("บันทึกไม่สำเร็จ", { description: err.message });
			},
		}),
	);

	const handleUpdateStatus = (
		id: string,
		status:
			| "PENDING"
			| "CONFIRMED"
			| "IN_TREATMENT"
			| "COMPLETED"
			| "CANCELLED"
			| "NO_SHOW",
		notes?: string,
	) => {
		updateStatusMutation.mutate({
			id,
			status,
			internalNotes: notes,
		});
	};

	const handleConfirmReschedule = () => {
		if (!rescheduleTarget || !rescheduleTime) {
			toast.error("กรุณาเลือกช่วงเวลาใหม่");
			return;
		}
		rescheduleMutation.mutate({
			id: rescheduleTarget.id,
			newDate: rescheduleDate,
			newStartTime: rescheduleTime,
		});
	};

	const handleAddScheduleBlock = (e: React.FormEvent) => {
		e.preventDefault();
		addBlockMutation.mutate({
			dentistId: blockDentistId,
			date: blockDate,
			startTime: blockStartTime,
			endTime: blockEndTime,
			reason: blockReason,
		});
	};

	// Filter by search keyword on client
	const filteredAppointments = useMemo(() => {
		if (!appointmentsQuery.data) return [];
		if (!searchKeyword.trim()) return appointmentsQuery.data;
		const kw = searchKeyword.toLowerCase();
		return appointmentsQuery.data.filter(
			(a) =>
				a.patientName.toLowerCase().includes(kw) ||
				a.patientPhone.includes(kw) ||
				a.bookingCode.toLowerCase().includes(kw),
		);
	}, [appointmentsQuery.data, searchKeyword]);

	// Metrics summary
	const metrics = useMemo(() => {
		const list = appointmentsQuery.data || [];
		return {
			total: list.length,
			pending: list.filter((a) => a.status === "PENDING").length,
			confirmed: list.filter((a) => a.status === "CONFIRMED").length,
			inTreatment: list.filter((a) => a.status === "IN_TREATMENT").length,
			completed: list.filter((a) => a.status === "COMPLETED").length,
			cancelled: list.filter((a) => a.status === "CANCELLED").length,
		};
	}, [appointmentsQuery.data]);

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return {
					label: "รอยืนยัน",
					color:
						"bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
				};
			case "CONFIRMED":
				return {
					label: "ยืนยันแล้ว",
					color:
						"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
				};
			case "IN_TREATMENT":
				return {
					label: "กำลังรักษา",
					color:
						"bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
				};
			case "COMPLETED":
				return {
					label: "เสร็จสิ้น",
					color:
						"bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
				};
			case "CANCELLED":
				return {
					label: "ยกเลิกแล้ว",
					color:
						"bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
				};
			case "NO_SHOW":
				return {
					label: "ไม่มาตามนัด",
					color:
						"bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
				};
			default:
				return {
					label: status,
					color: "bg-muted text-muted-foreground border-border",
				};
		}
	};

	return (
		<div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8 dark:bg-slate-950/40">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Top Header */}
				<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<div>
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
								<Stethoscope className="h-4 w-4" />
							</div>
							<h1 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">
								ตารางนัดหมายและจัดการคิวเคาน์เตอร์ (Admin Dashboard)
							</h1>
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Smile Craft Dental Clinic • ตรวจสอบสถานะการรักษา โทรคอนเฟิร์มคิว
							และจัดการตารางงานประจำวัน
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={() => setIsScheduleBlockModalOpen(true)}
							className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 font-semibold text-white text-xs shadow-xs transition-colors hover:bg-amber-600"
						>
							<Calendar className="h-3.5 w-3.5" />
							<span>จัดการตารางเวร & Schedule Block</span>
						</button>

						<button
							onClick={() => queryClient.invalidateQueries()}
							className="flex cursor-pointer items-center gap-1.5 rounded-xl border bg-background px-3 py-2 font-medium text-foreground text-xs shadow-2xs transition-colors hover:bg-accent"
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${appointmentsQuery.isFetching ? "animate-spin" : ""}`}
							/>
							<span>รีเฟรชข้อมูล</span>
						</button>

						{/* View Mode Toggle */}
						<div className="flex items-center rounded-xl border bg-muted p-1">
							<button
								onClick={() => setViewMode("list")}
								className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-xs transition-all ${
									viewMode === "list"
										? "bg-background font-semibold text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<List className="h-3.5 w-3.5" />
								<span>มุมมองรายการ</span>
							</button>
							<button
								onClick={() => setViewMode("calendar")}
								className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-xs transition-all ${
									viewMode === "calendar"
										? "bg-background font-semibold text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<LayoutGrid className="h-3.5 w-3.5" />
								<span>ไทม์ไลน์รายชั่วโมง</span>
							</button>
						</div>
					</div>
				</div>

				{/* Metric Cards Ribbon */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
					<div className="space-y-1 rounded-xl border bg-card p-3.5 shadow-2xs">
						<span className="text-[11px] text-muted-foreground">ทั้งหมดวันนี้</span>
						<div className="font-bold text-foreground text-xl">
							{metrics.total}
						</div>
					</div>
					<div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-800 dark:bg-amber-950/30">
						<span className="font-medium text-[11px] text-amber-800 dark:text-amber-300">
							🟡 รอยืนยัน
						</span>
						<div className="font-bold text-amber-900 text-xl dark:text-amber-200">
							{metrics.pending}
						</div>
					</div>
					<div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/30">
						<span className="font-medium text-[11px] text-emerald-800 dark:text-emerald-300">
							🟢 ยืนยันแล้ว
						</span>
						<div className="font-bold text-emerald-900 text-xl dark:text-emerald-200">
							{metrics.confirmed}
						</div>
					</div>
					<div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 dark:border-blue-800 dark:bg-blue-950/30">
						<span className="font-medium text-[11px] text-blue-800 dark:text-blue-300">
							🔵 กำลังรักษา
						</span>
						<div className="font-bold text-blue-900 text-xl dark:text-blue-200">
							{metrics.inTreatment}
						</div>
					</div>
					<div className="space-y-1 rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 dark:border-purple-800 dark:bg-purple-950/30">
						<span className="font-medium text-[11px] text-purple-800 dark:text-purple-300">
							🟣 เสร็จสิ้น
						</span>
						<div className="font-bold text-purple-900 text-xl dark:text-purple-200">
							{metrics.completed}
						</div>
					</div>
					<div className="space-y-1 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-800 dark:bg-rose-950/30">
						<span className="font-medium text-[11px] text-rose-800 dark:text-rose-300">
							🔴 ยกเลิกแล้ว
						</span>
						<div className="font-bold text-rose-900 text-xl dark:text-rose-200">
							{metrics.cancelled}
						</div>
					</div>
				</div>

				{/* Filter Controls Card */}
				<div className="space-y-4 rounded-2xl border bg-card p-4 shadow-2xs sm:p-5">
					<div className="flex flex-wrap items-center justify-between gap-4">
						{/* Quick Dates */}
						<div className="flex flex-wrap items-center gap-2">
							<span className="mr-1 font-semibold text-muted-foreground text-xs">
								เลือกวันที่:
							</span>
							<button
								onClick={() => setSelectedDate("2026-09-25")}
								className={`cursor-pointer rounded-xl border px-3 py-1.5 font-medium text-xs transition-colors ${
									selectedDate === "2026-09-25"
										? "border-[#560BAD] bg-[#560BAD] font-semibold text-white shadow-xs"
										: "border-border hover:bg-muted"
								}`}
							>
								วันนี้ (25 ก.ย.)
							</button>
							<button
								onClick={() => setSelectedDate("2026-09-26")}
								className={`cursor-pointer rounded-xl border px-3 py-1.5 font-medium text-xs transition-colors ${
									selectedDate === "2026-09-26"
										? "border-[#560BAD] bg-[#560BAD] font-semibold text-white shadow-xs"
										: "border-border hover:bg-muted"
								}`}
							>
								เสาร์ (26 ก.ย.)
							</button>
							<button
								onClick={() => setSelectedDate("2026-09-27")}
								className={`cursor-pointer rounded-xl border px-3 py-1.5 font-medium text-xs transition-colors ${
									selectedDate === "2026-09-27"
										? "border-[#560BAD] bg-[#560BAD] font-semibold text-white shadow-xs"
										: "border-border hover:bg-muted"
								}`}
							>
								อาทิตย์ (27 ก.ย.)
							</button>
							<input
								type="date"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								className="rounded-xl border bg-background px-2.5 py-1 text-foreground text-xs"
							/>
						</div>

						{/* Dentist Filter */}
						<div className="flex items-center gap-2">
							<span className="font-semibold text-muted-foreground text-xs">
								ทันตแพทย์:
							</span>
							<select
								value={selectedDentistId}
								onChange={(e) => setSelectedDentistId(e.target.value)}
								className="rounded-xl border bg-background px-3 py-1.5 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-[#560BAD]"
							>
								<option value="ALL">ทันตแพทย์ทั้งหมด</option>
								{dentistsQuery.data?.map((d) => (
									<option key={d.id} value={d.id}>
										{d.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-4 border-t pt-3">
						{/* Status Pills */}
						<div className="flex flex-wrap items-center gap-1.5 text-xs">
							<span className="mr-1 font-semibold text-muted-foreground">
								สถานะ:
							</span>
							{(
								[
									["ALL", "ทั้งหมด"],
									["PENDING", "🟡 รอยืนยัน"],
									["CONFIRMED", "🟢 ยืนยันแล้ว"],
									["IN_TREATMENT", "🔵 กำลังรักษา"],
									["COMPLETED", "🟣 เสร็จสิ้น"],
									["CANCELLED", "🔴 ยกเลิก"],
								] as const
							).map(([st, label]) => (
								<button
									key={st}
									onClick={() => setSelectedStatus(st as AppointmentStatus)}
									className={`cursor-pointer rounded-lg px-2.5 py-1 transition-colors ${
										selectedStatus === st
											? "bg-slate-900 font-semibold text-white shadow-2xs dark:bg-slate-100 dark:text-slate-900"
											: "text-muted-foreground hover:bg-muted"
									}`}
								>
									{label}
								</button>
							))}
						</div>

						{/* Patient Search Input */}
						<div className="relative w-full sm:w-64">
							<Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
							<input
								type="text"
								placeholder="ค้นหาชื่อ, เบอร์โทร, รหัสจอง..."
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
								className="w-full rounded-xl border bg-background py-1.5 pr-3 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-[#560BAD]"
							/>
						</div>
					</div>
				</div>

				{/* VIEW 1: LIST VIEW */}
				{viewMode === "list" && (
					<div className="space-y-3">
						{appointmentsQuery.isLoading && (
							<div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
								กำลังโหลดรายการนัดหมาย...
							</div>
						)}

						{!appointmentsQuery.isLoading &&
							filteredAppointments.length === 0 && (
								<div className="space-y-2 rounded-2xl border bg-card p-12 text-center text-muted-foreground">
									<AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
									<p className="font-medium text-foreground">
										ไม่พบนัดหมายตามเงื่อนไขที่เลือก
									</p>
									<p className="text-xs">กรุณาปรับตัวกรองวันที่หรือสถานะ</p>
								</div>
							)}

						{filteredAppointments.map((apt) => {
							const badge = getStatusBadge(apt.status);
							return (
								<div
									key={apt.id}
									className="space-y-3 rounded-2xl border bg-card p-4 shadow-2xs transition-shadow hover:shadow-xs sm:p-5"
								>
									{/* Leave Collision Warning Banner (ADR-0002) */}
									{apt.hasLeaveCollision && (
										<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-100/90 p-3 text-amber-950 text-xs dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-200">
											<div className="flex items-center gap-2">
												<AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
												<span className="font-bold">
													⚠️ แพทย์ติดภารกิจลา / กรุณาติดต่อคนไข้เพื่อเลื่อนนัดหมาย
												</span>
											</div>
											<button
												onClick={() => {
													setRescheduleTarget(apt);
													setRescheduleDate(apt.appointmentDate);
													setRescheduleTime(null);
												}}
												className="cursor-pointer rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-amber-700"
											>
												🗓️ ดำเนินการเลื่อนนัดทันที
											</button>
										</div>
									)}

									<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
										<div className="flex items-center gap-3">
											<div className="shrink-0 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 font-bold font-mono text-[#480CA8] text-sm dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200">
												{apt.startTime} – {apt.endTime}
											</div>

											<div>
												<div className="flex items-center gap-2">
													<h3 className="font-bold text-base text-foreground">
														{apt.patientName}
													</h3>
													<span
														className={`rounded-full border px-2 py-0.5 font-semibold text-[11px] ${badge.color}`}
													>
														{badge.label}
													</span>
												</div>
												<div className="mt-0.5 flex items-center gap-3 text-muted-foreground text-xs">
													<span className="font-mono text-[11px]">
														{apt.bookingCode}
													</span>
													<span>•</span>
													<a
														href={`tel:${apt.patientPhone}`}
														className="flex items-center gap-1 text-[#560BAD] hover:underline"
													>
														<Phone className="h-3 w-3" />
														{apt.patientPhone}
													</a>
												</div>
											</div>
										</div>

										<div className="text-right text-xs sm:border-l sm:pl-4">
											<span className="text-muted-foreground">แพทย์ผู้ตรวจ:</span>
											<p className="font-medium text-foreground">
												{apt.dentist?.name}
											</p>
											<p className="font-semibold text-[#560BAD] dark:text-purple-300">
												{apt.service?.name} ({apt.service?.durationMinutes} นาที)
											</p>
										</div>
									</div>

									{/* Medical History & Allergies Warning Box */}
									{apt.medicalNotes && (
										<div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-rose-900 text-xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
											<ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
											<div>
												<span className="font-bold">
													ข้อมูลสุขภาพ / ประวัติแพ้ยา:{" "}
												</span>
												<span>{apt.medicalNotes}</span>
											</div>
										</div>
									)}

									{/* Internal Notes / Audit History */}
									{apt.internalNotes && (
										<div className="rounded-lg bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
											<span className="font-medium">บันทึกภายใน:</span>{" "}
											{apt.internalNotes}
										</div>
									)}

									{/* Operational Action Buttons */}
									<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-medium text-muted-foreground">
												จัดการ:
											</span>

											{apt.status === "PENDING" && (
												<>
													<button
														onClick={() =>
															handleUpdateStatus(apt.id, "CONFIRMED")
														}
														className="cursor-pointer rounded-lg bg-emerald-600 px-2.5 py-1 font-medium text-white transition-colors hover:bg-emerald-700"
													>
														🟢 ยืนยันนัด (Confirm)
													</button>
													<button
														onClick={() =>
															handleUpdateStatus(apt.id, "CANCELLED")
														}
														className="cursor-pointer rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-700 transition-colors hover:bg-rose-100"
													>
														🔴 ยกเลิก (ปลดล็อก Slot)
													</button>
												</>
											)}

											{apt.status === "CONFIRMED" && (
												<>
													<button
														onClick={() =>
															handleUpdateStatus(apt.id, "IN_TREATMENT")
														}
														className="cursor-pointer rounded-lg bg-blue-600 px-2.5 py-1 font-medium text-white transition-colors hover:bg-blue-700"
													>
														🔵 เข้าห้องตรวจ (In Treatment)
													</button>
													<button
														onClick={() =>
															handleUpdateStatus(apt.id, "NO_SHOW")
														}
														className="cursor-pointer rounded-lg border bg-slate-100 px-2.5 py-1 text-slate-800 transition-colors hover:bg-slate-200"
													>
														⚫ ไม่มาตามนัด (No-show)
													</button>
													<button
														onClick={() =>
															handleUpdateStatus(apt.id, "CANCELLED")
														}
														className="cursor-pointer rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-700 transition-colors hover:bg-rose-100"
													>
														🔴 ยกเลิก (ปลดล็อก Slot)
													</button>
												</>
											)}

											{apt.status === "IN_TREATMENT" && (
												<button
													onClick={() =>
														handleUpdateStatus(apt.id, "COMPLETED")
													}
													className="cursor-pointer rounded-lg bg-purple-600 px-3 py-1 font-medium text-white transition-colors hover:bg-purple-700"
												>
													🟣 เสร็จสิ้นการรักษา (Complete)
												</button>
											)}

											{apt.status !== "CANCELLED" &&
												apt.status !== "COMPLETED" && (
													<button
														onClick={() => {
															setRescheduleTarget(apt);
															setRescheduleDate(apt.appointmentDate);
															setRescheduleTime(null);
														}}
														className="cursor-pointer rounded-lg border bg-slate-100 px-2.5 py-1 font-medium text-foreground transition-colors hover:bg-slate-200 dark:bg-slate-800"
													>
														🗓️ เลื่อนนัดหมาย
													</button>
												)}

											{(apt.status === "COMPLETED" ||
												apt.status === "CANCELLED" ||
												apt.status === "NO_SHOW") && (
												<span className="text-muted-foreground text-xs italic">
													สิ้นสุดกระบวนการแล้ว
												</span>
											)}
										</div>

										<a
											href={`tel:${apt.patientPhone}`}
											className="inline-flex items-center gap-1.5 font-medium text-[#560BAD] hover:underline"
										>
											<Phone className="h-3.5 w-3.5" />
											<span>โทร {apt.patientPhone}</span>
										</a>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* VIEW 2: HOURLY CALENDAR TIMELINE VIEW */}
				{viewMode === "calendar" && (
					<div className="space-y-4 rounded-2xl border bg-card p-4 shadow-2xs sm:p-6">
						<div className="flex items-center justify-between border-b pb-3">
							<h2 className="font-bold text-base text-foreground">
								ไทม์ไลน์รายชั่วโมงประจำวัน: {formatThaiDate(selectedDate)}
							</h2>
							<span className="text-muted-foreground text-xs">
								เวลาทำการ 10:00 – 20:00 น.
							</span>
						</div>

						<div className="space-y-2">
							{Array.from({ length: 10 }).map((_, idx) => {
								const hour = 10 + idx;
								const hourStr = `${String(hour).padStart(2, "0")}:00`;

								// Appointments starting in this hour
								const matchingApts = filteredAppointments.filter((a) => {
									const [h] = a.startTime.split(":").map(Number);
									return h === hour;
								});

								return (
									<div
										key={hourStr}
										className="flex flex-col items-start gap-3 rounded-xl border bg-background/50 p-3 transition-colors hover:bg-accent/20 sm:flex-row sm:items-center"
									>
										<div className="w-20 shrink-0 font-bold font-mono text-muted-foreground text-sm">
											{hourStr}
										</div>

										<div className="flex w-full flex-1 flex-wrap gap-2">
											{matchingApts.length === 0 ? (
												<span className="py-1 text-muted-foreground/50 text-xs italic">
													ไม่มีคิวนัดหมายในช่วงเวลานี้
												</span>
											) : (
												matchingApts.map((a) => {
													const badge = getStatusBadge(a.status);
													const isCollision =
														a.hasScheduleBlockCollision || a.hasLeaveCollision;
													return (
														<div
															key={a.id}
															className={`flex min-w-[260px] flex-1 flex-col justify-between gap-2 rounded-xl border p-2.5 text-xs sm:flex-row sm:items-center ${
																isCollision
																	? "border-amber-400 bg-amber-100/90 shadow-xs dark:border-amber-600 dark:bg-amber-950/70"
																	: a.status === "PENDING"
																		? "border-amber-300 bg-amber-50/80 dark:bg-amber-950/40"
																		: a.status === "CONFIRMED"
																			? "border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40"
																			: "border-border bg-muted/60"
															}`}
														>
															<div>
																<div className="flex items-center gap-1.5 font-bold text-foreground">
																	<span>{a.patientName}</span>
																	<span className="font-mono text-[10px] text-muted-foreground">
																		({a.startTime}-{a.endTime})
																	</span>
																</div>
																<div className="text-[11px] text-muted-foreground">
																	{a.service?.name} • {a.dentist?.name}
																</div>
																{isCollision && (
																	<div className="mt-1 flex items-center gap-1 font-bold text-[11px] text-amber-800 dark:text-amber-300">
																		<AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
																		<span>
																			⚠️ ทันตแพทย์ติดภารกิจลา (Schedule Block)
																		</span>
																	</div>
																)}
															</div>
															<div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
																{isCollision && (
																	<button
																		onClick={() => {
																			setRescheduleTarget(a);
																			setRescheduleDate(a.appointmentDate);
																		}}
																		className="cursor-pointer rounded-lg bg-amber-600 px-2 py-0.5 font-medium text-[10px] text-white hover:bg-amber-700"
																	>
																		เลื่อนนัด
																	</button>
																)}
																<span
																	className={`rounded-full border px-2 py-0.5 font-semibold text-[10px] ${badge.color}`}
																>
																	{badge.label}
																</span>
															</div>
														</div>
													);
												})
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* MODAL 1: RESCHEDULE APPOINTMENT DIALOG */}
				{rescheduleTarget && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<div className="fade-in zoom-in-95 w-full max-w-lg animate-in space-y-5 rounded-3xl border bg-card p-6 shadow-xl duration-200">
							<div className="flex items-center justify-between border-b pb-3">
								<h3 className="flex items-center gap-2 font-bold text-foreground text-lg">
									<Calendar className="h-5 w-5 text-[#560BAD]" />
									<span>เลื่อนเวลานัดหมาย (Reschedule)</span>
								</h3>
								<button
									onClick={() => setRescheduleTarget(null)}
									className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							{/* Existing Info */}
							<div className="space-y-1 rounded-xl bg-muted/40 p-3.5 text-xs">
								<div>
									<span className="text-muted-foreground">คนไข้: </span>
									<span className="font-bold text-foreground">
										{rescheduleTarget.patientName}
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">บริการ: </span>
									<span>
										{rescheduleTarget.service?.name} (
										{rescheduleTarget.service?.durationMinutes} นาที)
									</span>
								</div>
								<div>
									<span className="text-muted-foreground">แพทย์ผู้ตรวจ: </span>
									<span>{rescheduleTarget.dentist?.name}</span>
								</div>
								<div>
									<span className="text-muted-foreground">เวลานัดเดิม: </span>
									<span className="font-semibold text-rose-600 line-through">
										{rescheduleTarget.appointmentDate} เวลา{" "}
										{rescheduleTarget.startTime} น.
									</span>
								</div>
							</div>

							{/* Select New Date */}
							<div className="space-y-2">
								<label className="block font-semibold text-foreground text-xs">
									เลือกวันนัดหมายใหม่
								</label>
								<input
									type="date"
									value={rescheduleDate}
									onChange={(e) => {
										setRescheduleDate(e.target.value);
										setRescheduleTime(null);
									}}
									className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
								/>
							</div>

							{/* Select New Time Slot */}
							<div className="space-y-2">
								<label className="block font-semibold text-foreground text-xs">
									เลือกช่วงเวลาว่างใหม่ ({rescheduleTarget.service?.durationMinutes}{" "}
									นาที)
								</label>

								{rescheduleSlotsQuery.isFetching ? (
									<p className="animate-pulse text-muted-foreground text-xs">
										กำลังโหลดช่วงเวลาว่าง...
									</p>
								) : (
									<div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto p-1">
										{rescheduleSlotsQuery.data?.slots.map((s) => {
											const isSelected = rescheduleTime === s.time;
											return (
												<button
													key={s.time}
													type="button"
													disabled={!s.isAvailable}
													onClick={() => setRescheduleTime(s.time)}
													className={`cursor-pointer rounded-lg border p-2 font-mono text-xs transition-all ${
														isSelected
															? "border-[#560BAD] bg-[#560BAD] font-bold text-white"
															: s.isAvailable
																? "text-foreground hover:border-[#560BAD] hover:bg-purple-50 dark:hover:bg-purple-950/40"
																: "cursor-not-allowed bg-muted/40 line-through opacity-40"
													}`}
												>
													{s.time}
												</button>
											);
										})}
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-2.5 border-t pt-3">
								<button
									type="button"
									onClick={() => setRescheduleTarget(null)}
									className="cursor-pointer rounded-xl border px-4 py-2 font-medium text-xs hover:bg-muted"
								>
									ยกเลิก
								</button>
								<button
									type="button"
									disabled={!rescheduleTime || rescheduleMutation.isPending}
									onClick={handleConfirmReschedule}
									className="cursor-pointer rounded-xl bg-[#560BAD] px-5 py-2 font-semibold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8] disabled:opacity-50"
								>
									{rescheduleMutation.isPending
										? "กำลังบันทึก..."
										: "ยืนยันการเลื่อนนัด"}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* MODAL 2: DUTY SCHEDULE & SCHEDULE BLOCK MANAGEMENT */}
				{isScheduleBlockModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
						<div className="fade-in zoom-in-95 w-full max-w-xl animate-in space-y-5 rounded-3xl border bg-card p-6 shadow-xl duration-200">
							<div className="flex items-center justify-between border-b pb-3">
								<h3 className="flex items-center gap-2 font-bold text-foreground text-lg">
									<Calendar className="h-5 w-5 text-amber-500" />
									<span>จัดการตารางเวร & บันทึก Schedule Block</span>
								</h3>
								<button
									onClick={() => setIsScheduleBlockModalOpen(false)}
									className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							{/* Standard Duty Schedules Summary */}
							<div className="space-y-2">
								<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									ตารางเวรปกติประจำสัปดาห์
								</h4>
								<div className="grid gap-3 text-xs sm:grid-cols-2">
									<div className="space-y-1 rounded-xl border bg-muted/30 p-3">
										<p className="font-bold text-foreground">
											ทพญ. เมย์ สไมล์คราฟต์
										</p>
										<p className="font-medium text-[#560BAD] dark:text-purple-400">
											ทั่วไป & ฟอกสีฟัน
										</p>
										<p className="text-muted-foreground">
											เข้าเวร: จันทร์, พุธ, ศุกร์, เสาร์
										</p>
										<p className="text-[11px] text-muted-foreground">
											เวลา 10:00 – 20:00 น.
										</p>
									</div>
									<div className="space-y-1 rounded-xl border bg-muted/30 p-3">
										<p className="font-bold text-foreground">
											ทพ. ชนน เดนทัลแคร์
										</p>
										<p className="font-medium text-[#560BAD] dark:text-purple-400">
											จัดฟัน & ขูดหินปูน
										</p>
										<p className="text-muted-foreground">
											เข้าเวร: อังคาร, พฤหัส, อาทิตย์
										</p>
										<p className="text-[11px] text-muted-foreground">
											เวลา 10:00 – 20:00 น.
										</p>
									</div>
								</div>
							</div>

							{/* Add Schedule Block Form */}
							<form
								onSubmit={handleAddScheduleBlock}
								className="space-y-4 border-t pt-2"
							>
								<div className="flex items-center justify-between">
									<h4 className="font-semibold text-foreground text-xs">
										บันทึกช่วงเวลาบล็อกเวร (Schedule Block)
									</h4>
									<span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-300">
										ADR-0002 Soft Block
									</span>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<div>
										<label className="mb-1 block text-muted-foreground text-xs">
											เลือกทันตแพทย์
										</label>
										<select
											value={blockDentistId}
											onChange={(e) => setBlockDentistId(e.target.value)}
											className="w-full rounded-xl border bg-background px-3 py-2 text-xs"
										>
											{dentistsQuery.data?.map((d) => (
												<option key={d.id} value={d.id}>
													{d.name}
												</option>
											))}
										</select>
									</div>

									<div>
										<label className="mb-1 block text-muted-foreground text-xs">
											วันที่
										</label>
										<input
											type="date"
											value={blockDate}
											onChange={(e) => setBlockDate(e.target.value)}
											className="w-full rounded-xl border bg-background px-3 py-2 text-xs"
										/>
									</div>

									<div>
										<label className="mb-1 block text-muted-foreground text-xs">
											ตั้งแต่เวลา
										</label>
										<input
											type="time"
											value={blockStartTime}
											onChange={(e) => setBlockStartTime(e.target.value)}
											className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-xs"
										/>
									</div>

									<div>
										<label className="mb-1 block text-muted-foreground text-xs">
											ถึงเวลา
										</label>
										<input
											type="time"
											value={blockEndTime}
											onChange={(e) => setBlockEndTime(e.target.value)}
											className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-xs"
										/>
									</div>

									<div className="sm:col-span-2">
										<label className="mb-1 block text-muted-foreground text-xs">
											เหตุผล / หมายเหตุ
										</label>
										<input
											type="text"
											placeholder="เช่น ติดสัมมนาวิชาการ, ธุระเร่งด่วน, พักเบรกยูนิตทำฟัน"
											value={blockReason}
											onChange={(e) => setBlockReason(e.target.value)}
											className="w-full rounded-xl border bg-background px-3 py-2 text-xs"
										/>
									</div>
								</div>

								<p className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-muted-foreground dark:border-amber-900/60 dark:bg-amber-950/40">
									ℹ️ ระบบจะปิดรับจองหน้าบ้านสำหรับทันตแพทย์ท่านนี้ในวันและเวลาดังกล่าวทันที
									และหากมีนัดหมายเดิมของคนไข้อยู่ จะขึ้นป้ายเตือน ⚠️ ให้เคาน์เตอร์โทรแจ้งเลื่อนนัด
								</p>

								<div className="flex items-center justify-end gap-2.5 pt-2">
									<button
										type="button"
										onClick={() => setIsScheduleBlockModalOpen(false)}
										className="cursor-pointer rounded-xl border px-4 py-2 font-medium text-xs hover:bg-muted"
									>
										ปิด
									</button>
									<button
										type="submit"
										disabled={addBlockMutation.isPending}
										className="cursor-pointer rounded-xl bg-amber-600 px-5 py-2 font-semibold text-white text-xs shadow-xs transition-colors hover:bg-amber-700 disabled:opacity-50"
									>
										{addBlockMutation.isPending
											? "กำลังบันทึก..."
											: "บันทึก Schedule Block"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
