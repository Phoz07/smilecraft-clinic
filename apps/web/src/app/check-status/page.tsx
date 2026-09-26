"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	Copy,
	ExternalLink,
	HelpCircle,
	MapPin,
	MessageCircle,
	Phone,
	Printer,
	Search,
	ShieldAlert,
	ShieldCheck,
	Sparkles,
	Stethoscope,
	User,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatThaiDate } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

export default function CheckStatusPage() {
	const [phone, setPhone] = useState("");
	const [bookingCode, setBookingCode] = useState("");
	const [searchParams, setSearchParams] = useState<{
		phone: string;
		bookingCode: string;
	} | null>(null);

	const lookupQuery = useQuery(
		trpc.appointments.lookup.queryOptions(
			{
				phone: searchParams?.phone ?? "",
				bookingCode: searchParams?.bookingCode ?? "",
			},
			{
				enabled: !!searchParams,
				retry: false,
			},
		),
	);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (!phone.trim()) {
			toast.error("กรุณากรอกเบอร์โทรศัพท์");
			return;
		}
		if (!bookingCode.trim()) {
			toast.error("กรุณากรอกรหัสการจอง");
			return;
		}

		let formattedCode = bookingCode.trim();
		if (!formattedCode.startsWith("#")) {
			formattedCode = `#${formattedCode}`;
		}

		setSearchParams({
			phone: phone.trim(),
			bookingCode: formattedCode,
		});
	};

	const handleFillDemo = (demoPhone: string, demoCode: string) => {
		setPhone(demoPhone);
		setBookingCode(demoCode);
		setSearchParams({ phone: demoPhone, bookingCode: demoCode });
	};

	const copyBookingCode = (code: string) => {
		navigator.clipboard.writeText(code);
		toast.success("คัดลอกรหัสการจองแล้ว");
	};

	const appointment = lookupQuery.data;

	// Status Badge Rendering Helper
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return {
					label: "🟡 รอยืนยัน (Pending)",
					desc: "ทางคลินิกได้ล็อกช่วงเวลาให้ท่านเรียบร้อยแล้ว รอเคาน์เตอร์โทรยืนยัน",
					bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300",
				};
			case "CONFIRMED":
				return {
					label: "🟢 ยืนยันแล้ว (Confirmed)",
					desc: "นัดหมายได้รับการยืนยันแล้ว สามารถเดินทางมาเข้ารับบริการตามวันและเวลาที่นัดได้ทันที",
					bg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300",
				};
			case "IN_TREATMENT":
				return {
					label: "🔵 กำลังรักษา (In Treatment)",
					desc: "คนไข้อำนวยความสะดวกอยู่ในห้องตรวจกับทันตแพทย์",
					bg: "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300",
				};
			case "COMPLETED":
				return {
					label: "🟣 เสร็จสิ้น (Completed)",
					desc: "การรักษาเสร็จสิ้นสมบูรณ์ ขอให้มีสุขภาพฟันและรอยยิ้มที่สดใส",
					bg: "bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300",
				};
			case "CANCELLED":
				return {
					label: "🔴 ยกเลิกแล้ว (Cancelled)",
					desc: "นัดหมายนี้ถูกยกเลิกแล้ว และระบบได้ปลดล็อกเวลาว่างคืนสู่ระบบ",
					bg: "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300",
				};
			case "NO_SHOW":
				return {
					label: "⚫ ไม่มาตามนัด (No-show)",
					desc: "ไม่พบการเข้ารับบริการตามช่วงเวลานัดหมาย",
					bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300",
				};
			default:
				return {
					label: status,
					desc: "",
					bg: "bg-muted text-muted-foreground border-border",
				};
		}
	};

	const statusInfo = appointment ? getStatusBadge(appointment.status) : null;

	return (
		<div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-background px-4 py-8 sm:px-6 sm:py-12 dark:from-purple-950/10 dark:to-background">
			<div className="mx-auto max-w-2xl space-y-8">
				{/* Header */}
				<div className="space-y-2 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 font-semibold text-[#480CA8] text-xs dark:bg-purple-900/60 dark:text-purple-200">
						<ShieldCheck className="h-3.5 w-3.5 text-[#560BAD] dark:text-purple-400" />
						<span>ระบบตรวจสอบสถานะนัดหมายที่ปลอดภัย (Privacy-First)</span>
					</div>
					<h1 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						ตรวจสอบสถานะการนัดหมาย
					</h1>
					<p className="mx-auto max-w-md text-muted-foreground text-xs sm:text-sm">
						กรุณากรอกเบอร์โทรศัพท์และรหัสการจอง เพื่อเปิดดูบัตรนัดหมายดิจิทัลของคุณ
					</p>
				</div>

				{/* Search Form Card */}
				<div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs sm:p-7">
					<form onSubmit={handleSearch} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-1 block font-semibold text-foreground text-xs">
									เบอร์โทรศัพท์มือถือที่ใช้จอง
								</label>
								<input
									type="tel"
									placeholder="เช่น 0898765432"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#560BAD]"
								/>
							</div>

							<div>
								<label className="mb-1 block font-semibold text-foreground text-xs">
									รหัสการจอง (Booking Code)
								</label>
								<input
									type="text"
									placeholder="เช่น #SC-20260925-K8M4"
									value={bookingCode}
									onChange={(e) => setBookingCode(e.target.value)}
									className="w-full rounded-xl border bg-background px-3.5 py-2.5 font-mono text-foreground text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#560BAD]"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={lookupQuery.isFetching}
							className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#560BAD] py-2.5 font-semibold text-white shadow-xs transition-all hover:bg-[#480CA8] disabled:opacity-50"
						>
							<Search className="h-4 w-4" />
							<span>
								{lookupQuery.isFetching ? "กำลังค้นหา..." : "ค้นหาข้อมูลนัดหมาย"}
							</span>
						</button>
					</form>

					{/* Quick Demo Pre-fills */}
					<div className="space-y-2 border-t pt-3 text-xs">
						<div className="flex items-center gap-1.5 font-medium text-muted-foreground">
							<Sparkles className="h-3.5 w-3.5 text-amber-500" />
							<span>ทดลองกดค้นหาด้วยเคสตัวอย่างจากระบบ:</span>
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() =>
									handleFillDemo("0898765432", "#SC-20260925-K8M4")
								}
								className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[11px] text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
							>
								คุณกัญญา (ยืนยันแล้ว • มีแพ้ยา)
							</button>
							<button
								type="button"
								onClick={() =>
									handleFillDemo("0865551234", "#SC-20260925-P7R9")
								}
								className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[11px] text-amber-800 transition-colors hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
							>
								คุณนพดล (รอยืนยัน • ความดัน)
							</button>
							<button
								type="button"
								onClick={() =>
									handleFillDemo("0812345678", "#SC-20260925-A2B3")
								}
								className="cursor-pointer rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 font-mono text-[11px] text-purple-800 transition-colors hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
							>
								คุณสมศักดิ์ (เสร็จสิ้น)
							</button>
						</div>
					</div>
				</div>

				{/* Search Result: Found */}
				{appointment && statusInfo && (
					<div className="space-y-4">
						<div className="relative overflow-hidden rounded-3xl border-2 border-[#560BAD]/40 bg-card p-6 shadow-lg sm:p-8 print:border-none print:p-0 print:shadow-none">
							<div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full bg-[#560BAD]/10 blur-2xl" />

							{/* Pass Header */}
							<div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
								<div>
									<div className="flex items-center gap-1.5 font-bold text-[#560BAD] text-lg">
										<Sparkles className="h-5 w-5" />
										<span>Smile Craft Dental Clinic</span>
									</div>
									<p className="mt-0.5 text-muted-foreground text-xs">
										บัตรนัดหมายดิจิทัล (Digital Appointment Pass)
									</p>
								</div>

								<div className="text-right">
									<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
										รหัสการจอง
									</span>
									<div className="flex items-center gap-2">
										<span className="font-extrabold font-mono text-foreground text-xl">
											{appointment.bookingCode}
										</span>
										<button
											onClick={() => copyBookingCode(appointment.bookingCode)}
											className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
											title="คัดลอกรหัส"
										>
											<Copy className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>

							{/* Status Banner */}
							<div className={`mt-5 rounded-xl border p-3.5 ${statusInfo.bg}`}>
								<div className="font-semibold text-sm">{statusInfo.label}</div>
								<p className="mt-0.5 text-xs opacity-90">{statusInfo.desc}</p>
							</div>

							{/* Appointment Body Details */}
							<div className="my-6 grid gap-4 text-sm sm:grid-cols-2 sm:gap-6">
								<div className="space-y-1">
									<span className="text-muted-foreground text-xs">
										ชื่อคนไข้ผู้รับบริการ:
									</span>
									<p className="font-semibold text-base text-foreground">
										{appointment.patientName}
									</p>
								</div>

								<div className="space-y-1">
									<span className="text-muted-foreground text-xs">
										เบอร์โทรศัพท์:
									</span>
									<p className="font-semibold text-base text-foreground">
										{appointment.patientPhone}
									</p>
								</div>

								<div className="space-y-1">
									<span className="text-muted-foreground text-xs">
										หัตถการ / บริการ:
									</span>
									<p className="font-semibold text-base text-foreground">
										{appointment.service?.name}
									</p>
									<p className="text-muted-foreground text-xs">
										ระยะเวลา {appointment.service?.durationMinutes} นาที •
										ค่าบริการเริ่มต้น {appointment.service?.price.toLocaleString()}{" "}
										บาท
									</p>
								</div>

								<div className="space-y-1">
									<span className="text-muted-foreground text-xs">
										ทันตแพทย์ผู้ดูแล:
									</span>
									<p className="font-semibold text-base text-foreground">
										{appointment.dentist?.name}
									</p>
									<p className="text-[#560BAD] text-xs dark:text-purple-400">
										{appointment.dentist?.specialization}
									</p>
								</div>

								<div className="space-y-1 rounded-xl bg-muted/40 p-4 sm:col-span-2">
									<span className="flex items-center gap-1.5 text-muted-foreground text-xs">
										<Clock className="h-3.5 w-3.5 text-[#560BAD]" />
										กำหนดเวลานัดหมาย:
									</span>
									<p className="font-bold text-[#560BAD] text-lg dark:text-purple-300">
										{formatThaiDate(appointment.appointmentDate)} เวลา{" "}
										{appointment.startTime} – {appointment.endTime} น.
									</p>
								</div>

								{appointment.medicalNotes && (
									<div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-amber-900 sm:col-span-2 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
										<div className="mb-1 flex items-center gap-1.5 font-semibold text-xs">
											<ShieldAlert className="h-4 w-4 text-amber-600" />
											<span>ข้อมูลสุขภาพและข้อควรระวัง:</span>
										</div>
										<p className="text-xs">{appointment.medicalNotes}</p>
									</div>
								)}
							</div>

							{/* Pass Footer / Clinic Location */}
							<div className="flex flex-col items-start justify-between gap-3 border-t pt-4 text-muted-foreground text-xs sm:flex-row sm:items-center">
								<div className="flex items-center gap-1.5">
									<MapPin className="h-3.5 w-3.5 shrink-0 text-[#560BAD]" />
									<span>สุขุมวิท 21 อาคารสุขุมวิท 21 ทาวเวอร์ ชั้น 2 (BTS อโศก)</span>
								</div>
								<button
									onClick={() => window.print()}
									className="hidden cursor-pointer items-center gap-1.5 transition-colors hover:text-foreground sm:inline-flex"
								>
									<Printer className="h-3.5 w-3.5" />
									<span>พิมพ์หรือบันทึกบัตรนัด</span>
								</button>
							</div>
						</div>

						{/* Quick Actions (Read-Only Policy as decided) */}
						<div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:p-5">
							<div className="text-center sm:text-left">
								<p className="font-semibold text-foreground text-sm">
									ต้องการเลื่อนนัด หรือมีข้อสอบถามเพิ่มเติม?
								</p>
								<p className="mt-0.5 text-muted-foreground text-xs">
									ติดต่อเจ้าหน้าที่เคาน์เตอร์คลินิกได้โดยตรงเพื่อดำเนินการปรับตารางเวลา
								</p>
							</div>

							<div className="flex w-full shrink-0 items-center gap-2.5 sm:w-auto">
								<a
									href="tel:029998888"
									className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] px-4 py-2 font-medium text-white text-xs shadow-xs transition-all hover:bg-[#480CA8] sm:flex-initial"
								>
									<Phone className="h-3.5 w-3.5" />
									<span>โทร 02-999-8888</span>
								</a>
								<a
									href="https://line.me/R/ti/p/@smilecraft"
									target="_blank"
									rel="noreferrer"
									className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-800 text-xs transition-colors hover:bg-emerald-100 sm:flex-initial dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
								>
									<MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
									<span>LINE Official</span>
								</a>
							</div>
						</div>
					</div>
				)}

				{/* Search Result: Not Found */}
				{lookupQuery.isError && searchParams && (
					<div className="space-y-4 rounded-2xl border-2 border-rose-200 bg-card p-6 text-center sm:p-8 dark:border-rose-900/60">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
							<AlertCircle className="h-7 w-7" />
						</div>

						<div>
							<h2 className="font-bold text-foreground text-lg">
								ไม่พบข้อมูลการนัดหมาย
							</h2>
							<p className="mx-auto mt-1 max-w-md text-muted-foreground text-xs sm:text-sm">
								ไม่พบนัดหมายที่ตรงกับเบอร์โทรศัพท์{" "}
								<span className="font-semibold text-foreground">
									{searchParams.phone}
								</span>{" "}
								และรหัส{" "}
								<span className="font-semibold text-foreground">
									{searchParams.bookingCode}
								</span>
							</p>
						</div>

						<div className="mx-auto max-w-md space-y-1 rounded-xl bg-muted/40 p-4 text-left text-muted-foreground text-xs">
							<p className="font-medium text-foreground">คำแนะนำ:</p>
							<p>• ตรวจสอบว่าเบอร์โทรศัพท์ตรงกับเบอร์ที่กรอกไว้ตอนจองหรือไม่</p>
							<p>• รหัสการจองต้องขึ้นต้นด้วยเครื่องหมาย # (เช่น #SC-20260925-A2B3)</p>
							<p>
								• หากลืมรหัสการจอง สามารถติดต่อเคาน์เตอร์คลินิกเพื่อให้เจ้าหน้าที่ค้นหาจากชื่อได้
							</p>
						</div>

						<div className="flex justify-center gap-3 pt-2">
							<a
								href="tel:029998888"
								className="inline-flex items-center gap-1.5 rounded-xl bg-[#560BAD] px-5 py-2 font-medium text-white text-xs shadow-xs transition-all hover:bg-[#480CA8]"
							>
								<Phone className="h-3.5 w-3.5" />
								<span>โทรติดต่อเคาน์เตอร์คลินิก</span>
							</a>
							<Link
								href={"/" as Route}
								className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 font-medium text-foreground text-xs transition-colors hover:bg-accent"
							>
								<span>กลับหน้าหลักเพื่อจองใหม่</span>
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
