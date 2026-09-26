"use client";

import {
	AlertCircle,
	ArrowDown,
	Award,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	ExternalLink,
	HeartHandshake,
	MapPin,
	MessageCircle,
	Phone,
	QrCode,
	ShieldCheck,
	Smile,
	Sparkles,
	Stethoscope,
	UserCheck,
	Zap,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { BookingFlow } from "@/components/booking-flow";

export default function Home() {
	const [preselectedServiceId, setPreselectedServiceId] = useState<
		string | null
	>("service_scaling");
	const [preselectedDentistId, setPreselectedDentistId] =
		useState<string>("any");
	const [preselectedStep, setPreselectedStep] = useState<1 | 2 | 3 | 4 | 5>(1);
	const [dentistLocked, setDentistLocked] = useState(false);

	// Smooth scroll to booking section
	const scrollToBooking = () => {
		const el = document.getElementById("booking-section");
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
		}
	};

	// Pre-select service from card
	const handleSelectService = (serviceId: string) => {
		setPreselectedServiceId(serviceId);
		setDentistLocked(false);
		setPreselectedStep(2); // advance to Step 2 (Select Dentist)
		scrollToBooking();
	};

	// Pre-select dentist from card
	const handleSelectDentist = (dentistId: string) => {
		setPreselectedDentistId(dentistId);
		setDentistLocked(true);
		setPreselectedStep(1); // pick service for this dentist in Step 1, then bypass Step 2
		scrollToBooking();
	};

	// Reset dentist selection
	const handleResetDentist = () => {
		setDentistLocked(false);
		setPreselectedDentistId("any");
		setPreselectedStep(1);
	};

	return (
		<div className="min-h-screen space-y-16 bg-gradient-to-b from-purple-50/40 via-background to-background pb-16 sm:space-y-24 dark:from-purple-950/20 dark:via-background dark:to-background">
			{/* 1. HERO SECTION */}
			<section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-14 md:pt-20">
				<div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
					{/* Hero Left: Pitch & CTAs */}
					<div className="space-y-6 text-center lg:col-span-7 lg:text-left">
						<div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/90 px-3.5 py-1.5 font-semibold text-[#480CA8] text-xs dark:border-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
							<Sparkles className="h-3.5 w-3.5 text-[#560BAD] dark:text-purple-400" />
							<span>Smile Craft Dental Clinic • สไมล์คราฟต์ ทันตกรรมเฉพาะทาง</span>
						</div>

						<h1 className="font-extrabold text-3xl text-foreground leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
							รอยยิ้มมั่นใจ <br className="hidden sm:inline" />
							<span className="bg-gradient-to-r from-[#560BAD] via-[#7209B7] to-[#480CA8] bg-clip-text text-transparent">
								เริ่มต้นที่สไมล์คราฟต์
							</span>
						</h1>

						<p className="mx-auto max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base md:text-lg lg:mx-0">
							นัดหมายทันตกรรมเฉพาะทาง ไม่ต้องนั่งรอคิว ด้วยระบบ Time Slot Real-time
							ล็อกเวลาทันที ดูแลโดยทันตแพทย์ผู้เชี่ยวชาญในบรรยากาศพรีเมียม ปลอดโปร่ง
							และปลอดภัย
						</p>

						{/* Trust Badges */}
						<div className="flex flex-wrap items-center justify-center gap-2 font-medium text-foreground text-xs sm:gap-3 lg:justify-start">
							<span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 shadow-2xs">
								<ShieldCheck className="h-4 w-4 text-[#560BAD]" />
								มาตรฐานปลอดเชื้อสากล
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 shadow-2xs">
								<Sparkles className="h-4 w-4 text-[#7209B7]" />
								เครื่องมือทันตกรรมทันสมัย
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 shadow-2xs">
								<HeartHandshake className="h-4 w-4 text-[#480CA8]" />
								ประเมินราคาโปร่งใสก่อนรักษา
							</span>
						</div>

						{/* Dual CTAs */}
						<div className="flex flex-col items-center justify-center gap-3.5 pt-2 sm:flex-row lg:justify-start">
							<button
								type="button"
								onClick={scrollToBooking}
								className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-[#560BAD] px-7 py-3.5 font-bold text-sm text-white shadow-md transition-all hover:bg-[#480CA8] hover:shadow-lg sm:w-auto sm:text-base"
							>
								<Calendar className="h-5 w-5" />
								<span>นัดหมายออนไลน์ทันที</span>
								<ArrowDown className="h-4 w-4 animate-bounce" />
							</button>

							<Link
								href={"/check-status" as Route}
								className="flex w-full items-center justify-center gap-2 rounded-2xl border bg-card px-6 py-3.5 font-semibold text-foreground text-sm shadow-2xs transition-colors hover:bg-accent sm:w-auto sm:text-base"
							>
								<span>🔍 ตรวจสอบนัดหมาย</span>
							</Link>
						</div>
					</div>

					{/* Hero Right: Visual Element (Digital Pass Preview Mockup) */}
					<div className="relative lg:col-span-5">
						<div className="relative mx-auto max-w-sm space-y-4 rounded-3xl border-2 border-[#560BAD]/30 bg-card p-5 shadow-xl sm:max-w-md sm:p-6">
							{/* Card Header */}
							<div className="flex items-center justify-between border-b pb-3">
								<div className="flex items-center gap-2.5">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#560BAD] text-white">
										<Smile className="h-5 w-5" />
									</div>
									<div>
										<div className="font-bold text-foreground text-xs">
											SMILE CRAFT CLINIC
										</div>
										<div className="font-medium text-[#560BAD] text-[10px] dark:text-purple-400">
											Digital Appointment Pass
										</div>
									</div>
								</div>
								<span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
									<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
									CONFIRMED
								</span>
							</div>

							{/* Patient Info */}
							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">รหัสนัดหมาย:</span>
									<span className="font-bold font-mono text-[#560BAD] text-sm dark:text-purple-300">
										#SC-20260925-A2B3
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">คนไข้:</span>
									<span className="font-semibold text-foreground">
										คุณสมศักดิ์ มั่นคง
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">บริการ:</span>
									<span className="font-semibold text-foreground">
										ขูดหินปูน (Scaling) 30 นาที
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">ทันตแพทย์:</span>
									<span className="font-medium text-foreground">
										ทพญ. เมย์ สไมล์คราฟต์
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">เวลาตรวจ:</span>
									<span className="font-bold text-foreground">
										วันนี้ 10:30 – 11:00 น.
									</span>
								</div>
							</div>

							{/* QR Mockup & Fast pass badge */}
							<div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/50 p-3.5">
								<div className="flex items-center gap-2">
									<QrCode className="h-8 w-8 text-[#560BAD] dark:text-purple-300" />
									<div className="text-[11px] leading-tight">
										<span className="block font-bold text-foreground">
											สแกนเช็กอินที่เคาน์เตอร์
										</span>
										<span className="text-[10px] text-muted-foreground">
											ไม่ต้องรับบัตรคิวซ้ำ
										</span>
									</div>
								</div>
								<span className="rounded-lg bg-[#560BAD] px-2 py-1 font-semibold text-[10px] text-white">
									Fast Track
								</span>
							</div>

							{/* Floating Feature Tag */}
							<div className="pt-1 text-center">
								<span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 font-medium text-[#560BAD] text-[11px] dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
									<Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
									ล็อกสล็อตแบบ Real-time ทันทีที่กดจอง
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 2. WHY CHOOSE US (3 PILLARS) */}
			<section className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
					<span className="font-bold text-[#560BAD] text-xs uppercase tracking-wider dark:text-purple-400">
						Why Choose Smile Craft
					</span>
					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						จุดเด่นที่ทำให้คนไข้มั่นใจเลือกสไมล์คราฟต์
					</h2>
					<p className="text-muted-foreground text-xs sm:text-sm">
						ยกระดับประสบการณ์ทันตกรรมยุคใหม่ สะดวก โปร่งใส และมีมาตรฐานระดับสากล
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					{/* Pillar 1 */}
					<div className="space-y-3 rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#560BAD] dark:bg-purple-950/60 dark:text-purple-300">
							<Clock className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-foreground text-lg">
							Zero Waiting Time
						</h3>
						<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
							ล็อกเวลาทันตแพทย์และยูนิตทำฟันเฉพาะบุคคล ตรงเวลา ไม่แออัด
							หมดปัญหาการนั่งรอคิวยาวนาน
						</p>
						<div className="flex items-center gap-1 pt-2 font-semibold text-[#560BAD] text-xs dark:text-purple-400">
							<span>Time Slot แม่นยำ 30 นาที</span>
							<ChevronRight className="h-3.5 w-3.5" />
						</div>
					</div>

					{/* Pillar 2 */}
					<div className="space-y-3 rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
							<Award className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-foreground text-lg">
							Specialized Dentists
						</h3>
						<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
							ดูแลโดยทันตแพทย์เฉพาะทางทั้งจัดฟันและทันตกรรมเพื่อความงาม
							วางแผนการรักษาเฉพาะรายบุคคล
						</p>
						<div className="flex items-center gap-1 pt-2 font-semibold text-cyan-600 text-xs dark:text-cyan-400">
							<span>ตารางเวรชัดเจน 7 วัน</span>
							<ChevronRight className="h-3.5 w-3.5" />
						</div>
					</div>

					{/* Pillar 3 */}
					<div className="space-y-3 rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
							<ShieldCheck className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-foreground text-lg">
							Transparent Pricing
						</h3>
						<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
							อัตราค่าบริการชัดเจน เริ่มต้นขูดหินปูน 900.- / ฟอกสีฟัน 3,500.-
							ไม่มีค่าธรรมเนียมแอบแฝง
						</p>
						<div className="flex items-center gap-1 pt-2 font-semibold text-emerald-600 text-xs dark:text-emerald-400">
							<span>ประเมินค่ารักษาก่อนทำ</span>
							<ChevronRight className="h-3.5 w-3.5" />
						</div>
					</div>
				</div>
			</section>

			{/* 3. SERVICES & PRICING GRID */}
			<section
				className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6"
				id="services"
			>
				<div className="mx-auto max-w-2xl space-y-2 text-center">
					<span className="font-bold text-[#560BAD] text-xs uppercase tracking-wider dark:text-purple-400">
						Services & Pricing
					</span>
					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						บริการทันตกรรมมาตรฐานสากล
					</h2>
					<p className="text-muted-foreground text-xs sm:text-sm">
						เลือกบริการที่ต้องการ และกดปุ่ม &quot;จองบริการนี้&quot; เพื่อเริ่มต้นการนัดหมายทันที
					</p>
				</div>

				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{/* Service 1 */}
					<div className="flex flex-col justify-between space-y-4 rounded-3xl border bg-card p-5 shadow-xs transition-all hover:border-[#560BAD]">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-[#560BAD] text-xs dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
									⏱️ 30 นาที
								</span>
								<span className="font-mono text-muted-foreground text-xs">
									service_scaling
								</span>
							</div>
							<h3 className="font-bold text-foreground text-lg">
								ขูดหินปูน (Scaling)
							</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								ขจัดคราบหินปูน คราบชากาแฟ ป้องกันโรคเหงือกอักเสบ ดูแลรอยยิ้มให้สะอาดสดชื่น
							</p>
						</div>

						<div className="space-y-3 border-t pt-3">
							<div className="flex items-baseline justify-between">
								<span className="text-muted-foreground text-xs">ราคาเริ่มต้น</span>
								<div className="font-extrabold text-[#560BAD] text-xl dark:text-purple-300">
									900{" "}
									<span className="font-normal text-muted-foreground text-xs">
										บาท
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleSelectService("service_scaling")}
								className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] py-2.5 font-bold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8]"
							>
								<span>จองบริการนี้</span>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					{/* Service 2 */}
					<div className="flex flex-col justify-between space-y-4 rounded-3xl border bg-card p-5 shadow-xs transition-all hover:border-[#560BAD]">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-[#560BAD] text-xs dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
									⏱️ 60 นาที
								</span>
								<span className="font-mono text-muted-foreground text-xs">
									service_whitening
								</span>
							</div>
							<h3 className="font-bold text-foreground text-lg">
								ฟอกสีฟัน Cool Light
							</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								ระบบ Cool Light ปลอดภัย ไม่ทำลายผิวฟัน ฟันขาวกระจ่างใสขึ้นทันที 2–4 เฉดสี
							</p>
						</div>

						<div className="space-y-3 border-t pt-3">
							<div className="flex items-baseline justify-between">
								<span className="text-muted-foreground text-xs">ราคาเริ่มต้น</span>
								<div className="font-extrabold text-[#560BAD] text-xl dark:text-purple-300">
									3,500{" "}
									<span className="font-normal text-muted-foreground text-xs">
										บาท
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleSelectService("service_whitening")}
								className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] py-2.5 font-bold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8]"
							>
								<span>จองบริการนี้</span>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					{/* Service 3 */}
					<div className="flex flex-col justify-between space-y-4 rounded-3xl border bg-card p-5 shadow-xs transition-all hover:border-[#560BAD]">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-[#560BAD] text-xs dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
									⏱️ 60 นาที
								</span>
								<span className="font-mono text-muted-foreground text-xs">
									service_ortho_consult
								</span>
							</div>
							<h3 className="font-bold text-foreground text-lg">
								ปรึกษาทันตกรรมจัดฟัน
							</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								ตรวจโครงสร้างฟัน ถ่ายภาพประเมินรอยยิ้ม และวางแผนการรักษาจัดฟันเฉพาะบุคคล
							</p>
						</div>

						<div className="space-y-3 border-t pt-3">
							<div className="flex items-baseline justify-between">
								<span className="text-muted-foreground text-xs">ราคาเริ่มต้น</span>
								<div className="font-extrabold text-[#560BAD] text-xl dark:text-purple-300">
									500{" "}
									<span className="font-normal text-muted-foreground text-xs">
										บาท
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleSelectService("service_ortho_consult")}
								className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] py-2.5 font-bold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8]"
							>
								<span>จองบริการนี้</span>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					{/* Service 4 */}
					<div className="flex flex-col justify-between space-y-4 rounded-3xl border bg-card p-5 shadow-xs transition-all hover:border-[#560BAD]">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-bold text-[#560BAD] text-xs dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
									⏱️ 60 นาที
								</span>
								<span className="font-mono text-muted-foreground text-xs">
									service_ortho_appliance
								</span>
							</div>
							<h3 className="font-bold text-foreground text-lg">
								ติดเครื่องมือจัดฟัน
							</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								ติดเครื่องมือรอบแรก พร้อมรับชุดอุปกรณ์ดูแลทำความสะอาดฟันเฉพาะบุคคล
							</p>
						</div>

						<div className="space-y-3 border-t pt-3">
							<div className="flex items-baseline justify-between">
								<span className="text-muted-foreground text-xs">ราคาเริ่มต้น</span>
								<div className="font-extrabold text-[#560BAD] text-xl dark:text-purple-300">
									15,000{" "}
									<span className="font-normal text-muted-foreground text-xs">
										บาท
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleSelectService("service_ortho_appliance")}
								className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] py-2.5 font-bold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8]"
							>
								<span>จองบริการนี้</span>
								<ChevronRight className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* 4. DENTIST TEAM & DUTY SCHEDULE */}
			<section
				className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6"
				id="dentists"
			>
				<div className="mx-auto max-w-2xl space-y-2 text-center">
					<span className="font-bold text-[#560BAD] text-xs uppercase tracking-wider dark:text-purple-400">
						Our Dental Specialists
					</span>
					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						ทีมทันตแพทย์และตารางเวรประจำคลินิก
					</h2>
					<p className="text-muted-foreground text-xs sm:text-sm">
						เลือกนัดหมายกับทันตแพทย์ที่คุณเจาะจง หรือคลิกเพื่อจองคิวตามความเชี่ยวชาญ
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2">
					{/* Dentist 1: Dr. May */}
					<div className="flex flex-col items-start justify-between gap-5 rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:flex-row sm:p-7">
						<div className="flex items-start gap-4">
							<img
								src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
								alt="ทพญ. เมย์ สไมล์คราฟต์"
								className="h-20 w-20 shrink-0 rounded-2xl border object-cover"
							/>
							<div className="space-y-1.5">
								<div className="inline-block rounded-md bg-purple-50 px-2 py-0.5 font-semibold text-[#560BAD] text-[11px] dark:bg-purple-950 dark:text-purple-300">
									ทั่วไป & ฟอกสีฟัน
								</div>
								<h3 className="font-bold text-base text-foreground sm:text-lg">
									ทพญ. เมย์ สไมล์คราฟต์
								</h3>
								<p className="text-muted-foreground text-xs leading-relaxed">
									เชี่ยวชาญงานทันตกรรมเพื่อความงาม, ฟอกสีฟัน Cool Light และงานขูดหินปูน
								</p>
								<div className="pt-1 text-xs">
									<span className="text-muted-foreground">วันเข้าเวร: </span>
									<span className="font-semibold text-[#560BAD] dark:text-purple-300">
										จันทร์, พุธ, ศุกร์, เสาร์ (10:00 – 20:00 น.)
									</span>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => handleSelectDentist("dentist_may")}
							className="mt-2 flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] px-4 py-2.5 font-semibold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8] sm:mt-0 sm:w-auto"
						>
							<Calendar className="h-3.5 w-3.5" />
							<span>นัดหมายกับทันตแพทย์</span>
						</button>
					</div>

					{/* Dentist 2: Dr. Chanon */}
					<div className="flex flex-col items-start justify-between gap-5 rounded-3xl border bg-card p-6 shadow-xs transition-shadow hover:shadow-md sm:flex-row sm:p-7">
						<div className="flex items-start gap-4">
							<img
								src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
								alt="ทพ. ชนน เดนทัลแคร์"
								className="h-20 w-20 shrink-0 rounded-2xl border object-cover"
							/>
							<div className="space-y-1.5">
								<div className="inline-block rounded-md bg-purple-50 px-2 py-0.5 font-semibold text-[#7209B7] text-[11px] dark:bg-purple-950 dark:text-purple-300">
									ทันตกรรมจัดฟัน
								</div>
								<h3 className="font-bold text-base text-foreground sm:text-lg">
									ทพ. ชนน เดนทัลแคร์
								</h3>
								<p className="text-muted-foreground text-xs leading-relaxed">
									เชี่ยวชาญการจัดฟันทุกรูปแบบ, ปรับโครงสร้างฟันสบคร่อม และทันตกรรมพื้นฐาน
								</p>
								<div className="pt-1 text-xs">
									<span className="text-muted-foreground">วันเข้าเวร: </span>
									<span className="font-semibold text-[#7209B7] dark:text-purple-300">
										อังคาร, พฤหัสบดี, อาทิตย์ (10:00 – 20:00 น.)
									</span>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => handleSelectDentist("dentist_chanon")}
							className="mt-2 flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#560BAD] px-4 py-2.5 font-semibold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8] sm:mt-0 sm:w-auto"
						>
							<Calendar className="h-3.5 w-3.5" />
							<span>นัดหมายกับทันตแพทย์</span>
						</button>
					</div>
				</div>
			</section>

			{/* 5. INTERACTIVE BOOKING WIZARD SECTION */}
			<section
				className="mx-auto max-w-4xl scroll-mt-20 px-4 sm:px-6"
				id="booking-section"
			>
				<div className="mx-auto mb-6 max-w-xl space-y-1.5 text-center">
					<div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 font-bold text-[#480CA8] text-xs dark:bg-purple-900/60 dark:text-purple-200">
						<Sparkles className="h-3.5 w-3.5 text-[#560BAD]" />
						<span>ระบบนัดหมายออนไลน์ Smile Craft</span>
					</div>
					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						ระบุข้อมูลและล็อกเวลานัดหมายของคุณ
					</h2>
					<p className="text-muted-foreground text-xs sm:text-sm">
						สล็อตเวลาถูกล็อกทันทีเพื่อป้องกันการจองซ้อน พร้อมรับรหัสเพื่อตรวจสอบสถานะได้ตลอด 24
						ชั่วโมง
					</p>
				</div>

				<BookingFlow
					initialServiceId={preselectedServiceId}
					initialDentistId={preselectedDentistId}
					initialStep={preselectedStep}
					dentistLocked={dentistLocked}
					onResetDentist={handleResetDentist}
				/>
			</section>

			{/* 6. LOCATION & INTERACTIVE GOOGLE MAPS */}
			<section
				className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6"
				id="location"
			>
				<div className="mx-auto max-w-2xl space-y-2 text-center">
					<span className="font-bold text-[#560BAD] text-xs uppercase tracking-wider dark:text-purple-400">
						Location & Access
					</span>
					<h2 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
						ที่ตั้งและการเดินทางมายังคลินิก
					</h2>
					<p className="text-muted-foreground text-xs sm:text-sm">
						ตั้งอยู่ใจกลางเมืองอโศก เดินทางสะดวกด้วยรถไฟฟ้า BTS/MRT พร้อมที่จอดรถรับรอง
					</p>
				</div>

				<div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-12">
					{/* Map Left Info */}
					<div className="flex flex-col justify-between space-y-6 p-6 sm:p-8 lg:col-span-5">
						<div className="space-y-4">
							<div className="flex items-center gap-2.5 font-bold text-foreground text-lg">
								<MapPin className="h-5 w-5 shrink-0 text-[#560BAD]" />
								<span>คลินิกทันตกรรมสไมล์คราฟต์</span>
							</div>

							<div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
								<p className="leading-relaxed">
									<strong className="text-foreground">ที่อยู่: </strong>
									อาคารสุขุมวิท 21 ทาวเวอร์ ชั้น 4 ถนนอโศกมนตรี แขวงคลองเตยเหนือ เขตวัฒนา
									กรุงเทพฯ 10110
								</p>
								<p className="leading-relaxed">
									<strong className="text-foreground">การเดินทาง: </strong>
									BTS อโศก (ทางออก 3) หรือ MRT สุขุมวิท (ทางออก 1) เดินเข้าซอยสุขุมวิท 21
									เพียง 3 นาที
								</p>
								<p className="leading-relaxed">
									<strong className="text-foreground">ที่จอดรถ: </strong>
									มีอาคารจอดรถในร่มสะดวกสบาย ประทับตราจอดฟรี 2 ชั่วโมง
								</p>
								<p className="leading-relaxed">
									<strong className="text-foreground">เวลาทำการ: </strong>
									เปิดบริการทุกวัน จันทร์ – อาทิตย์ เวลา 10:00 – 20:00 น.
								</p>
							</div>
						</div>

						<div className="flex flex-wrap gap-3 border-t pt-4">
							<a
								href="https://maps.google.com/?q=Sukhumvit+21+Bangkok"
								target="_blank"
								rel="noopener noreferrer"
								className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#560BAD] px-5 py-2.5 font-bold text-white text-xs shadow-xs transition-colors hover:bg-[#480CA8] sm:text-sm"
							>
								<MapPin className="h-4 w-4" />
								<span>📍 เปิดใน Google Maps</span>
								<ExternalLink className="h-3.5 w-3.5" />
							</a>

							<a
								href="tel:029998888"
								className="flex cursor-pointer items-center gap-2 rounded-xl border bg-muted px-4 py-2.5 font-semibold text-foreground text-xs transition-colors hover:bg-accent sm:text-sm"
							>
								<Phone className="h-4 w-4 text-[#560BAD]" />
								<span>โทร 02-999-8888</span>
							</a>
						</div>
					</div>

					{/* Map Right: Interactive Google Maps Iframe */}
					<div className="relative h-[300px] min-h-[300px] bg-muted sm:h-[380px] lg:col-span-7 lg:h-auto">
						<iframe
							title="แผนที่ที่ตั้ง คลินิกทันตกรรมสไมล์คราฟต์ อโศก"
							src="https://maps.google.com/maps?q=Sukhumvit+21+Asoke+Bangkok&t=&z=15&ie=UTF8&iwloc=&output=embed"
							className="h-full w-full border-0"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>
				</div>
			</section>

			{/* 7. CLINIC FOOTER */}
			<footer className="mx-auto max-w-6xl border-t px-4 pt-12 text-muted-foreground text-xs sm:px-6">
				<div className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2 md:grid-cols-4">
					{/* Col 1 */}
					<div className="space-y-3 sm:col-span-2">
						<div className="flex items-center gap-2">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#560BAD] font-bold text-white">
								SC
							</div>
							<span className="font-extrabold text-foreground text-sm tracking-tight">
								SMILE CRAFT DENTAL CLINIC
							</span>
						</div>
						<p className="max-w-md leading-relaxed">
							คลินิกทันตกรรมระดับพรีเมียม ให้บริการนัดหมายทันตกรรมเฉพาะทางด้วยระบบ Time
							Slot Real-time ล็อกเวลาทันที ไม่ต้องรอคิว ดูแลรอยยิ้มอย่างประณีตและใส่ใจ
						</p>
						<p className="text-[11px] text-muted-foreground/80">
							เลขที่ใบอนุญาตสถานพยาบาล: 10101009969
						</p>
					</div>

					{/* Col 2 */}
					<div className="space-y-2">
						<h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
							เมนูลัด
						</h4>
						<ul className="space-y-1.5">
							<li>
								<button
									type="button"
									onClick={scrollToBooking}
									className="cursor-pointer text-left hover:text-foreground"
								>
									นัดหมายออนไลน์ทันที
								</button>
							</li>
							<li>
								<Link
									href={"/check-status" as Route}
									className="hover:text-foreground"
								>
									ตรวจสอบนัดหมาย (Digital Pass)
								</Link>
							</li>
							<li>
								<Link
									href={"/admin" as Route}
									className="hover:text-foreground"
								>
									เคาน์เตอร์แอดมิน (Admin Dashboard)
								</Link>
							</li>
						</ul>
					</div>

					{/* Col 3 */}
					<div className="space-y-2">
						<h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
							ติดต่อคลินิก
						</h4>
						<div className="space-y-1.5">
							<p>เบอร์โทรเคาน์เตอร์: 02-999-8888</p>
							<p>เบอร์ติดต่อฉุกเฉิน: 081-234-5678</p>
							<p>LINE Official: @smilecraft</p>
							<p>เวลาทำการ: ทุกวัน 10:00 – 20:00 น.</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center justify-between gap-3 border-t pt-6 text-[11px] sm:flex-row">
					<p>© 2026 Smile Craft Dental Clinic. All rights reserved.</p>
					<p className="text-muted-foreground/70">
						ระบบจองคิวนัดหมายทันตกรรมแบบล็อกเวลาเฉพาะบุคคล (Time Slot Engine)
					</p>
				</div>
			</footer>
		</div>
	);
}
