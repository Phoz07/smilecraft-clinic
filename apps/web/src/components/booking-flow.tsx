"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar as CalendarIcon,
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Copy,
	ExternalLink,
	MapPin,
	MessageCircle,
	Phone,
	ShieldCheck,
	Sparkles,
	Stethoscope,
	User,
	Zap,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatThaiDate } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

export interface BookingFlowProps {
	initialServiceId?: string | null;
	initialDentistId?: string | null;
	initialStep?: 1 | 2 | 3 | 4 | 5;
	dentistLocked?: boolean;
	onResetDentist?: () => void;
}

export function BookingFlow({
	initialServiceId,
	initialDentistId,
	initialStep,
	dentistLocked = false,
	onResetDentist,
}: BookingFlowProps = {}) {
	const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(initialStep || 1);
	const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
		initialServiceId || "service_scaling",
	);
	const [selectedDentistId, setSelectedDentistId] = useState<string>(
		initialDentistId || "any",
	);

	// Initial date: 2026-09-25
	const todayStr = "2026-09-25";
	const [selectedDate, setSelectedDate] = useState<string>(todayStr);
	const [selectedTime, setSelectedTime] = useState<string | null>(null);

	const [patientName, setPatientName] = useState("");
	const [patientPhone, setPatientPhone] = useState("");
	const [medicalNotes, setMedicalNotes] = useState("");
	const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

	// Queries
	const servicesQuery = useQuery(trpc.services.list.queryOptions());
	const dentistsQuery = useQuery(trpc.dentists.list.queryOptions());

	// Synchronize incoming props
	useEffect(() => {
		if (initialServiceId) {
			setSelectedServiceId(initialServiceId);
		}
	}, [initialServiceId]);

	useEffect(() => {
		if (initialDentistId) {
			setSelectedDentistId(initialDentistId);
		}
	}, [initialDentistId]);

	useEffect(() => {
		if (initialStep) {
			setStep(initialStep);
		}
	}, [initialStep]);

	const slotsQuery = useQuery(
		trpc.appointments.getAvailableSlots.queryOptions(
			{
				serviceId: selectedServiceId || "",
				date: selectedDate,
				dentistId: selectedDentistId === "any" ? undefined : selectedDentistId,
			},
			{
				enabled: !!selectedServiceId && !!selectedDate,
			},
		),
	);

	const createMutation = useMutation(
		trpc.appointments.create.mutationOptions({
			onSuccess: (data) => {
				setConfirmedBooking(data);
				setStep(5);
				toast.success("จองคิวนัดหมายสำเร็จ!", {
					description: `รหัสการจอง: ${data.bookingCode}`,
				});
			},
			onError: (err) => {
				toast.error("การจองไม่สำเร็จ", {
					description: err.message,
				});
			},
		}),
	);

	// Available dates for next 14 days
	const dateOptions = useMemo(() => {
		const list = [];
		const baseDate = new Date(2026, 8, 25); // 2026-09-25
		for (let i = 0; i < 14; i++) {
			const d = new Date(baseDate);
			d.setDate(baseDate.getDate() + i);
			const yStr = d.getFullYear();
			const mStr = String(d.getMonth() + 1).padStart(2, "0");
			const dayStr = String(d.getDate()).padStart(2, "0");
			const iso = `${yStr}-${mStr}-${dayStr}`;
			const dayOfWeek = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."][
				d.getDay()
			];
			list.push({
				iso,
				dayNumber: d.getDate(),
				dayOfWeek,
				month: ["ก.ย.", "ต.ค."][d.getMonth() === 8 ? 0 : 1],
			});
		}
		return list;
	}, []);

	const selectedService = useMemo(
		() => servicesQuery.data?.find((s) => s.id === selectedServiceId),
		[servicesQuery.data, selectedServiceId],
	);

	const eligibleDentists = useMemo(() => {
		if (!dentistsQuery.data || !selectedServiceId) return [];
		return dentistsQuery.data.filter((d) =>
			d.services.some((s) => s.serviceId === selectedServiceId),
		);
	}, [dentistsQuery.data, selectedServiceId]);

	const selectedDentist = useMemo(() => {
		if (selectedDentistId === "any") return null;
		return dentistsQuery.data?.find((d) => d.id === selectedDentistId);
	}, [dentistsQuery.data, selectedDentistId]);

	// Check whether a date is off-duty for the selected dentist or all eligible dentists
	const isDateDisabled = useMemo(() => {
		return (isoDate: string) => {
			const [y, m, d] = isoDate.split("-").map(Number);
			if (!y || !m || !d) return false;
			const dayOfWeek = new Date(y, m - 1, d).getDay();

			if (selectedDentistId === "any") {
				// If "Any Dentist" is chosen, disable date if NO eligible dentist is on duty
				if (eligibleDentists.length === 0) return true;
				const anyOnDuty = eligibleDentists.some((dentist) =>
					dentist.dutySchedules?.some(
						(ds) => ds.isActive && ds.dayOfWeek === dayOfWeek,
					),
				);
				return !anyOnDuty;
			}

			// Specific dentist selected
			const dentist = dentistsQuery.data?.find(
				(d) => d.id === selectedDentistId,
			);
			if (!dentist) return false;
			const hasDuty = dentist.dutySchedules?.some(
				(ds) => ds.isActive && ds.dayOfWeek === dayOfWeek,
			);
			return !hasDuty;
		};
	}, [selectedDentistId, eligibleDentists, dentistsQuery.data]);

	// Auto-shift date if selected date is off-duty
	useEffect(() => {
		if (!dentistsQuery.data) return;
		if (isDateDisabled(selectedDate)) {
			const firstAvailable = dateOptions.find(
				(opt) => !isDateDisabled(opt.iso),
			);
			if (firstAvailable) {
				setSelectedDate(firstAvailable.iso);
				setSelectedTime(null);
			}
		}
	}, [isDateDisabled, selectedDate, dateOptions, dentistsQuery.data]);

	// Filter services when dentist is locked from outside
	const servicesToShow = useMemo(() => {
		if (!servicesQuery.data) return [];
		if (!dentistLocked || selectedDentistId === "any")
			return servicesQuery.data;
		const dentist = dentistsQuery.data?.find((d) => d.id === selectedDentistId);
		if (!dentist) return servicesQuery.data;
		return servicesQuery.data.filter((s) =>
			dentist.services?.some((ds) => ds.serviceId === s.id),
		);
	}, [
		servicesQuery.data,
		dentistsQuery.data,
		selectedDentistId,
		dentistLocked,
	]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!patientName.trim()) {
			toast.error("กรุณาระบุชื่อ-นามสกุล");
			return;
		}
		if (!patientPhone.trim() || patientPhone.trim().length < 9) {
			toast.error("กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 9-10 หลัก)");
			return;
		}
		if (!selectedServiceId || !selectedTime) {
			toast.error("กรุณาเลือกบริการและเวลาให้ครบถ้วน");
			return;
		}

		createMutation.mutate({
			serviceId: selectedServiceId,
			dentistId: selectedDentistId === "any" ? undefined : selectedDentistId,
			date: selectedDate,
			startTime: selectedTime,
			patientName,
			patientPhone,
			medicalNotes,
		});
	};

	const copyBookingCode = () => {
		if (confirmedBooking?.bookingCode) {
			navigator.clipboard.writeText(confirmedBooking.bookingCode);
			toast.success("คัดลอกรหัสการจองแล้ว");
		}
	};

	return (
		<div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6 md:p-8">
			{/* Progress Steps Header */}
			{step < 5 && (
				<div className="mb-8">
					<div className="mb-3 flex items-center justify-between font-medium text-muted-foreground text-xs sm:text-sm">
						<span
							className={
								step >= 1
									? "font-semibold text-[#560BAD] dark:text-purple-400"
									: ""
							}
						>
							1. เลือกบริการ
						</span>
						<ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
						<span
							className={
								step >= 2
									? "font-semibold text-[#560BAD] dark:text-purple-400"
									: ""
							}
						>
							2. เลือกทันตแพทย์
						</span>
						<ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
						<span
							className={
								step >= 3
									? "font-semibold text-[#560BAD] dark:text-purple-400"
									: ""
							}
						>
							3. วันและเวลา
						</span>
						<ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
						<span
							className={
								step >= 4
									? "font-semibold text-[#560BAD] dark:text-purple-400"
									: ""
							}
						>
							4. ข้อมูลคนไข้
						</span>
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
						<div
							className="h-full bg-[#560BAD] transition-all duration-300"
							style={{ width: `${(step / 4) * 100}%` }}
						/>
					</div>
				</div>
			)}

			{/* STEP 1: Select Service */}
			{step === 1 && (
				<div className="space-y-6">
					<div>
						<h2 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">
							เลือกบริการทันตกรรมที่ต้องการ
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							คลินิกใช้เวลาตรวจและรักษาตามมาตรฐานบริการ พร้อมแจ้งราคาเริ่มต้นชัดเจน
						</p>
					</div>

					{/* Pre-selected Dentist Banner */}
					{dentistLocked && selectedDentist && (
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 p-3.5 text-xs dark:border-purple-800 dark:bg-purple-950/40">
							<div className="flex items-center gap-2 text-[#3A0CA3] dark:text-purple-200">
								<Sparkles className="h-4 w-4 shrink-0 text-[#560BAD]" />
								<span>
									นัดหมายเจาะจงกับ: <strong>{selectedDentist.name}</strong> (
									{selectedDentist.title})
								</span>
							</div>
							{onResetDentist && (
								<button
									type="button"
									onClick={onResetDentist}
									className="cursor-pointer font-semibold text-[#560BAD] hover:underline dark:text-purple-300"
								>
									เลือกทันตแพทย์ท่านอื่น
								</button>
							)}
						</div>
					)}

					<div className="grid gap-4 sm:grid-cols-2">
						{servicesQuery.isLoading && (
							<div className="col-span-2 py-12 text-center text-muted-foreground">
								กำลังโหลดรายการบริการ...
							</div>
						)}

						{servicesToShow.map((srv) => {
							const isSelected = selectedServiceId === srv.id;
							return (
								<div
									key={srv.id}
									onClick={() => setSelectedServiceId(srv.id)}
									className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
										isSelected
											? "border-[#560BAD] bg-purple-50/50 shadow-sm dark:bg-purple-950/20"
											: "border-border hover:border-purple-300 hover:bg-accent/40"
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="font-semibold text-base text-foreground">
												{srv.name}
											</h3>
											<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
												{srv.description}
											</p>
										</div>
										{isSelected && (
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#560BAD] text-white">
												<Check className="h-3.5 w-3.5 stroke-[3]" />
											</div>
										)}
									</div>

									<div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
										<span className="flex items-center gap-1.5 text-muted-foreground">
											<Clock className="h-3.5 w-3.5 text-[#560BAD]" />
											ระยะเวลา {srv.durationMinutes} นาที
										</span>
										<span className="font-bold text-[#560BAD] text-sm dark:text-purple-300">
											{srv.price.toLocaleString()} บาท
										</span>
									</div>
								</div>
							);
						})}
					</div>

					<div className="flex justify-end pt-4">
						<button
							onClick={() => {
								if (
									dentistLocked &&
									selectedDentistId &&
									selectedDentistId !== "any"
								) {
									setStep(3); // Bypass Step 2 directly to Step 3
								} else {
									setStep(2);
								}
							}}
							disabled={!selectedServiceId}
							className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#560BAD] px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#480CA8] disabled:opacity-50"
						>
							<span>
								{dentistLocked &&
								selectedDentistId &&
								selectedDentistId !== "any"
									? "ถัดไป: เลือกวันและเวลา"
									: "ถัดไป: เลือกทันตแพทย์"}
							</span>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* STEP 2: Select Dentist */}
			{step === 2 && (
				<div className="space-y-6">
					<div>
						<h2 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">
							เลือกทันตแพทย์ผู้ให้การรักษา
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							สำหรับบริการ:{" "}
							<strong className="text-foreground">
								{selectedService?.name}
							</strong>{" "}
							(แสดงเฉพาะแพทย์ที่มีสิทธิ์การรักษาในหัตถการนี้)
						</p>
					</div>

					<div className="space-y-3">
						{/* Quickest option */}
						<div
							onClick={() => setSelectedDentistId("any")}
							className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
								selectedDentistId === "any"
									? "border-[#560BAD] bg-purple-50/50 shadow-sm dark:bg-purple-950/20"
									: "border-border hover:border-purple-300"
							}`}
						>
							<div className="flex items-center gap-3.5">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#560BAD] dark:bg-purple-900/60 dark:text-purple-300">
									<Zap className="h-6 w-6" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-foreground text-sm sm:text-base">
											แพทย์ท่านใดก็ได้ (คิวเร็วที่สุด)
										</h3>
										<span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-[11px] text-amber-800 dark:bg-amber-950 dark:text-amber-300">
											แนะนำ
										</span>
									</div>
									<p className="mt-0.5 text-muted-foreground text-xs">
										ระบบจะค้นหาแพทย์ที่ว่างเร็วที่สุดเพื่อให้คุณได้รับการรักษาโดยไม่ต้องรอนาน
									</p>
								</div>
							</div>
							{selectedDentistId === "any" && (
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#560BAD] text-white">
									<Check className="h-3.5 w-3.5 stroke-[3]" />
								</div>
							)}
						</div>

						{/* Specific Eligible Dentists */}
						{eligibleDentists.map((doc) => {
							const isSelected = selectedDentistId === doc.id;
							// Format duty days text
							const dutyDays = doc.dutySchedules.map((ds) => {
								return ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."][
									ds.dayOfWeek
								];
							});

							return (
								<div
									key={doc.id}
									onClick={() => setSelectedDentistId(doc.id)}
									className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
										isSelected
											? "border-[#560BAD] bg-purple-50/50 shadow-sm dark:bg-purple-950/20"
											: "border-border hover:border-purple-300"
									}`}
								>
									<div className="flex items-center gap-3.5">
										{doc.avatarUrl ? (
											<img
												src={doc.avatarUrl}
												alt={doc.name}
												className="h-12 w-12 shrink-0 rounded-xl border object-cover"
											/>
										) : (
											<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
												<Stethoscope className="h-6 w-6" />
											</div>
										)}
										<div>
											<h3 className="font-semibold text-foreground text-sm sm:text-base">
												{doc.name}
											</h3>
											<p className="font-medium text-[#560BAD] text-xs dark:text-purple-400">
												{doc.title}
											</p>
											<p className="mt-0.5 text-[11px] text-muted-foreground">
												วันตรวจประจำ: {dutyDays.join(", ")} (10:00 – 20:00 น.)
											</p>
										</div>
									</div>
									{isSelected && (
										<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#560BAD] text-white">
											<Check className="h-3.5 w-3.5 stroke-[3]" />
										</div>
									)}
								</div>
							);
						})}
					</div>

					<div className="flex items-center justify-between border-t pt-4">
						<button
							onClick={() => setStep(1)}
							className="flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2 font-medium text-muted-foreground text-sm hover:bg-accent hover:text-foreground"
						>
							<ChevronLeft className="h-4 w-4" />
							<span>ย้อนกลับ</span>
						</button>
						<button
							onClick={() => setStep(3)}
							className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#560BAD] px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#480CA8]"
						>
							<span>ถัดไป: เลือกวันและเวลา</span>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* STEP 3: Select Date & Time Slot */}
			{step === 3 && (
				<div className="space-y-6">
					<div>
						<h2 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">
							เลือกวันและเวลาที่สะดวก
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							คลินิกเปิดทำการ 10:00 – 20:00 น. ซอยเวลาละ 30 นาที
							(ห้ามจองซ้อนตามจำนวนแพทย์ที่เข้าเวร)
						</p>
					</div>

					{/* Date Picker Ribbon */}
					<div className="space-y-2">
						<label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							เลือกวันที่
						</label>
						<div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
							{dateOptions.map((item) => {
								const isSelected = selectedDate === item.iso;
								const disabled = isDateDisabled(item.iso);
								return (
									<button
										key={item.iso}
										type="button"
										disabled={disabled}
										onClick={() => {
											if (disabled) return;
											setSelectedDate(item.iso);
											setSelectedTime(null);
										}}
										className={`flex min-w-[70px] flex-col items-center justify-center rounded-xl border-2 p-2.5 transition-all ${
											disabled
												? "cursor-not-allowed border-muted/60 bg-muted/20 text-muted-foreground/35 opacity-60"
												: isSelected
													? "scale-105 cursor-pointer border-[#560BAD] bg-[#560BAD] text-white shadow-sm"
													: "cursor-pointer border-border text-foreground hover:border-purple-300 hover:bg-accent/40"
										}`}
									>
										<span className="font-medium text-[11px] opacity-80">
											{item.dayOfWeek}
										</span>
										<span className="my-0.5 font-bold text-lg">
											{item.dayNumber}
										</span>
										<span className="text-[10px] opacity-75">
											{disabled ? "ไม่มีตรวจ" : item.month}
										</span>
									</button>
								);
							})}
						</div>
						<p className="font-medium text-[#560BAD] text-xs dark:text-purple-300">
							📅 วันที่เลือก: {formatThaiDate(selectedDate)}
						</p>
					</div>

					{/* Time Slot Grid */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								เลือกช่วงเวลา ({selectedService?.durationMinutes} นาที)
							</label>
							{slotsQuery.isFetching && (
								<span className="animate-pulse text-muted-foreground text-xs">
									กำลังตรวจสอบ Slot ว่าง...
								</span>
							)}
						</div>

						{slotsQuery.data?.slots.length === 0 ? (
							<div className="rounded-xl border-2 border-dashed p-8 text-center">
								<AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
								<p className="font-medium text-foreground">
									ไม่มีทันตแพทย์เข้าเวรในวันที่เลือก
								</p>
								<p className="mt-1 text-muted-foreground text-xs">
									กรุณาเลือกวันอื่น หรือปรับแพทย์ผู้ให้การรักษา
								</p>
							</div>
						) : (
							<div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
								{slotsQuery.data?.slots.map((slot) => {
									const isSelected = selectedTime === slot.time;
									return (
										<button
											key={slot.time}
											type="button"
											disabled={!slot.isAvailable}
											onClick={() => setSelectedTime(slot.time)}
											className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all ${
												isSelected
													? "border-[#560BAD] bg-[#560BAD] font-semibold text-white shadow-sm ring-2 ring-[#560BAD]/20"
													: slot.isAvailable
														? "border-border font-medium text-foreground hover:border-[#560BAD] hover:bg-purple-50 dark:hover:bg-purple-950/30"
														: "cursor-not-allowed border-muted bg-muted/40 text-muted-foreground/50 text-xs line-through"
											}`}
										>
											<div className="font-mono text-sm">{slot.time}</div>
											<div className="text-[10px] opacity-75">
												{slot.isAvailable ? `ถึง ${slot.endTime}` : "เต็ม"}
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>

					<div className="flex items-center justify-between border-t pt-4">
						<button
							onClick={() => {
								if (
									dentistLocked &&
									selectedDentistId &&
									selectedDentistId !== "any"
								) {
									setStep(1);
								} else {
									setStep(2);
								}
							}}
							className="flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2 font-medium text-muted-foreground text-sm hover:bg-accent hover:text-foreground"
						>
							<ChevronLeft className="h-4 w-4" />
							<span>ย้อนกลับ</span>
						</button>
						<button
							onClick={() => setStep(4)}
							disabled={!selectedTime}
							className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#560BAD] px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-[#480CA8] disabled:opacity-50"
						>
							<span>ถัดไป: กรอกข้อมูลคนไข้</span>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* STEP 4: Patient Info Form */}
			{step === 4 && (
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<h2 className="font-bold text-foreground text-xl tracking-tight sm:text-2xl">
							กรอกข้อมูลคนไข้เพื่อยืนยันการจอง
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยเพื่อการติดต่อและเตรียมการรักษาทางคลินิก
						</p>
					</div>

					{/* Booking Summary Pill Card */}
					<div className="space-y-1.5 rounded-xl border bg-muted/50 p-4 text-xs sm:text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">บริการที่เลือก:</span>
							<span className="font-semibold text-foreground">
								{selectedService?.name}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">ทันตแพทย์:</span>
							<span className="font-semibold text-foreground">
								{selectedDentistId === "any"
									? "แพทย์ท่านใดก็ได้ (คิวเร็วที่สุด)"
									: selectedDentist?.name}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">วันและเวลานัดหมาย:</span>
							<span className="font-semibold text-[#560BAD] dark:text-purple-300">
								{formatThaiDate(selectedDate)} เวลา {selectedTime} น. (
								{selectedService?.durationMinutes} นาที)
							</span>
						</div>
						<div className="flex justify-between border-t pt-1.5">
							<span className="text-muted-foreground">ค่าบริการเริ่มต้น:</span>
							<span className="font-bold text-[#560BAD] text-base dark:text-purple-300">
								{selectedService?.price.toLocaleString()} บาท
							</span>
						</div>
					</div>

					{/* Fields */}
					<div className="space-y-4">
						<div>
							<label className="mb-1.5 block font-semibold text-foreground text-xs">
								ชื่อ - นามสกุลคนไข้ <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								required
								placeholder="เช่น นายธนกร สุขสันต์"
								value={patientName}
								onChange={(e) => setPatientName(e.target.value)}
								className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#560BAD]"
							/>
						</div>

						<div>
							<label className="mb-1.5 block font-semibold text-foreground text-xs">
								เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
							</label>
							<input
								type="tel"
								required
								placeholder="เช่น 0812345678"
								value={patientPhone}
								onChange={(e) => setPatientPhone(e.target.value)}
								className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#560BAD]"
							/>
							<p className="mt-1 text-[11px] text-muted-foreground">
								* ใช้สำหรับโทรยืนยันนัด และใช้ตรวจสอบสถานะนัดหมายคู่กับรหัสการจอง
							</p>
						</div>

						<div>
							<label className="mb-1.5 block font-semibold text-foreground text-xs">
								โรคประจำตัว หรือ ประวัติแพ้ยา (ถ้ามี)
							</label>
							<textarea
								rows={2}
								placeholder="เช่น แพ้ยาเพนิซิลลิน, ความดันโลหิตสูง, หรือไม่มี"
								value={medicalNotes}
								onChange={(e) => setMedicalNotes(e.target.value)}
								className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#560BAD]"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between border-t pt-4">
						<button
							type="button"
							onClick={() => setStep(3)}
							className="flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2 font-medium text-muted-foreground text-sm hover:bg-accent hover:text-foreground"
						>
							<ChevronLeft className="h-4 w-4" />
							<span>ย้อนกลับ</span>
						</button>
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#560BAD] px-6 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-[#480CA8] disabled:opacity-50"
						>
							<ShieldCheck className="h-4 w-4" />
							<span>
								{createMutation.isPending
									? "กำลังบันทึกนัดหมาย..."
									: "ยืนยันการนัดหมาย"}
							</span>
						</button>
					</div>
				</form>
			)}

			{/* STEP 5: Digital Appointment Pass Confirmation */}
			{step === 5 && confirmedBooking && (
				<div className="space-y-6 py-2 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-[#560BAD] dark:bg-purple-900/60 dark:text-purple-300">
						<CheckCircle2 className="h-10 w-10" />
					</div>

					<div>
						<span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 font-semibold text-amber-800 text-xs dark:bg-amber-950 dark:text-amber-300">
							🟡 รอยืนยัน (Pending) - ล็อก Slot เรียบร้อย
						</span>
						<h2 className="mt-3 font-bold text-2xl text-foreground tracking-tight">
							จองคิวนัดหมายสำเร็จ!
						</h2>
						<p className="mx-auto mt-1 max-w-md text-muted-foreground text-sm">
							ระบบได้ทำการล็อกช่วงเวลาของคุณเรียบร้อยแล้ว
							เจ้าหน้าที่เคาน์เตอร์จะโทรติดต่อยืนยันก่อนวันนัด
						</p>
					</div>

					{/* Digital Pass Card */}
					<div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-[#560BAD]/30 bg-gradient-to-b from-purple-50/50 to-background p-6 text-left shadow-md dark:from-slate-900 dark:to-slate-950">
						<div className="absolute top-0 right-0 h-28 w-28 translate-x-4 -translate-y-4 transform rounded-full bg-[#560BAD]/10 blur-xl" />

						<div className="flex items-center justify-between border-b pb-4">
							<div>
								<span className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
									รหัสการจองนัดหมาย (Booking Code)
								</span>
								<div className="font-extrabold font-mono text-[#560BAD] text-xl tracking-wider sm:text-2xl dark:text-purple-300">
									{confirmedBooking.bookingCode}
								</div>
							</div>
							<button
								onClick={copyBookingCode}
								className="cursor-pointer rounded-lg bg-purple-100 p-2 text-[#480CA8] transition-colors hover:bg-purple-200 dark:bg-purple-900/60 dark:text-purple-200"
								title="คัดลอกรหัส"
							>
								<Copy className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-2 py-4 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">ชื่อคนไข้:</span>
								<span className="font-semibold text-foreground">
									{confirmedBooking.patientName}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">เบอร์โทรศัพท์:</span>
								<span className="font-semibold text-foreground">
									{confirmedBooking.patientPhone}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">บริการ:</span>
								<span className="font-semibold text-foreground">
									{confirmedBooking.service?.name}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">ทันตแพทย์ผู้ดูแล:</span>
								<span className="font-semibold text-foreground">
									{confirmedBooking.dentist?.name}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">วันและเวลา:</span>
								<span className="font-bold text-[#560BAD] dark:text-purple-300">
									{formatThaiDate(confirmedBooking.appointmentDate)} เวลา{" "}
									{confirmedBooking.startTime} – {confirmedBooking.endTime} น.
								</span>
							</div>
						</div>

						<div className="flex items-center gap-1.5 border-t pt-3 text-muted-foreground text-xs">
							<MapPin className="h-3.5 w-3.5 shrink-0 text-[#560BAD]" />
							<span>Smile Craft Dental Clinic • สุขุมวิท 21 (ใกล้ BTS อโศก)</span>
						</div>
					</div>

					{/* Quick Contact & Next Actions */}
					<div className="mx-auto max-w-md space-y-3 pt-2">
						<div className="grid grid-cols-2 gap-2.5">
							<a
								href="tel:029998888"
								className="flex items-center justify-center gap-2 rounded-xl border bg-slate-100 py-2.5 font-medium text-foreground text-xs transition-colors hover:bg-slate-200 sm:text-sm dark:bg-slate-800 dark:hover:bg-slate-700"
							>
								<Phone className="h-4 w-4 text-[#560BAD]" />
								<span>โทรหาคลินิก</span>
							</a>
							<a
								href="https://line.me/R/ti/p/@smilecraft"
								target="_blank"
								rel="noreferrer"
								className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 font-medium text-emerald-800 text-xs transition-colors hover:bg-emerald-100 sm:text-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
							>
								<MessageCircle className="h-4 w-4 text-emerald-600" />
								<span>ทัก LINE Official</span>
							</a>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Link
								href={"/check-status" as Route}
								className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] py-2.5 font-semibold text-sm text-white transition-all hover:bg-[#480CA8]"
							>
								<span>ตรวจสถานะนัดหมายในภายหลัง</span>
								<ExternalLink className="h-4 w-4" />
							</Link>
							<button
								onClick={() => {
									setStep(1);
									setSelectedTime(null);
									setConfirmedBooking(null);
								}}
								className="cursor-pointer rounded-xl border px-4 py-2.5 font-medium text-muted-foreground text-sm hover:bg-accent hover:text-foreground"
							>
								จองเพิ่มอีกคิว
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
