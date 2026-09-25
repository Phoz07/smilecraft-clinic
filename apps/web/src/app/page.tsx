"use client";

import { BookingFlow } from "@/components/booking-flow";
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

export default function Home() {
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(
    "service_scaling",
  );
  const [preselectedDentistId, setPreselectedDentistId] = useState<string>("any");
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
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-background to-background dark:from-teal-950/20 dark:via-background dark:to-background pb-16 space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="pt-8 sm:pt-14 md:pt-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left: Pitch & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-teal-100/90 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Smile Craft Dental Clinic • สไมล์คราฟต์ ทันตกรรมเฉพาะทาง</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              รอยยิ้มมั่นใจ <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                เริ่มต้นที่สไมล์คราฟต์
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              นัดหมายทันตกรรมเฉพาะทาง ไม่ต้องนั่งรอคิว ด้วยระบบ Time Slot Real-time ล็อกเวลาทันที
              ดูแลโดยทันตแพทย์ผู้เชี่ยวชาญในบรรยากาศพรีเมียม ปลอดโปร่ง และปลอดภัย
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                มาตรฐานปลอดเชื้อสากล
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border shadow-2xs">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                เครื่องมือทันตกรรมทันสมัย
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border shadow-2xs">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                ประเมินราคาโปร่งใสก่อนรักษา
              </span>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={scrollToBooking}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer text-sm sm:text-base"
              >
                <Calendar className="w-5 h-5" />
                <span>นัดหมายออนไลน์ทันที</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>

              <Link
                href={"/check-status" as Route}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card hover:bg-accent text-foreground font-semibold px-6 py-3.5 rounded-2xl border transition-colors shadow-2xs text-sm sm:text-base"
              >
                <span>🔍 ตรวจสอบนัดหมาย</span>
              </Link>
            </div>
          </div>

          {/* Hero Right: Visual Element (Digital Pass Preview Mockup) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md bg-card rounded-3xl border-2 border-teal-500/30 p-5 sm:p-6 shadow-xl space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <Smile className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">SMILE CRAFT CLINIC</div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                      Digital Appointment Pass
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  CONFIRMED
                </span>
              </div>

              {/* Patient Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">รหัสนัดหมาย:</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-300 text-sm">
                    #SC-20260925-A2B3
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">คนไข้:</span>
                  <span className="font-semibold text-foreground">คุณสมศักดิ์ มั่นคง</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">บริการ:</span>
                  <span className="font-semibold text-foreground">ขูดหินปูน (Scaling) 30 นาที</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ทันตแพทย์:</span>
                  <span className="font-medium text-foreground">ทพญ. เมย์ สไมล์คราฟต์</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">เวลาตรวจ:</span>
                  <span className="font-bold text-foreground">วันนี้ 10:30 – 11:00 น.</span>
                </div>
              </div>

              {/* QR Mockup & Fast pass badge */}
              <div className="bg-muted/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 border">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-teal-700 dark:text-teal-300" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-foreground block">สแกนเช็กอินที่เคาน์เตอร์</span>
                    <span className="text-muted-foreground text-[10px]">ไม่ต้องรับบัตรคิวซ้ำ</span>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-600 text-white font-semibold px-2 py-1 rounded-lg">
                  Fast Track
                </span>
              </div>

              {/* Floating Feature Tag */}
              <div className="text-center pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ล็อกสล็อตแบบ Real-time ทันทีที่กดจอง
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE US (3 PILLARS) */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Why Choose Smile Craft
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            จุดเด่นที่ทำให้คนไข้มั่นใจเลือกสไมล์คราฟต์
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            ยกระดับประสบการณ์ทันตกรรมยุคใหม่ สะดวก โปร่งใส และมีมาตรฐานระดับสากล
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-card p-6 sm:p-7 rounded-3xl border shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Zero Waiting Time</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              ล็อกเวลาทันตแพทย์และยูนิตทำฟันเฉพาะบุคคล ตรงเวลา ไม่แออัด หมดปัญหาการนั่งรอคิวยาวนาน
            </p>
            <div className="pt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <span>Time Slot แม่นยำ 30 นาที</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-card p-6 sm:p-7 rounded-3xl border shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Specialized Dentists</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              ดูแลโดยทันตแพทย์เฉพาะทางทั้งจัดฟันและทันตกรรมเพื่อความงาม วางแผนการรักษาเฉพาะรายบุคคล
            </p>
            <div className="pt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <span>ตารางเวรชัดเจน 7 วัน</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-card p-6 sm:p-7 rounded-3xl border shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Transparent Pricing</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              อัตราค่าบริการชัดเจน เริ่มต้นขูดหินปูน 900.- / ฟอกสีฟัน 3,500.- ไม่มีค่าธรรมเนียมแอบแฝง
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>ประเมินค่ารักษาก่อนทำ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES & PRICING GRID */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto space-y-8" id="services">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Services & Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            บริการทันตกรรมมาตรฐานสากล
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            เลือกบริการที่ต้องการ และกดปุ่ม &quot;จองบริการนี้&quot; เพื่อเริ่มต้นการนัดหมายทันที
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Service 1 */}
          <div className="bg-card p-5 rounded-3xl border shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  ⏱️ 30 นาที
                </span>
                <span className="text-xs text-muted-foreground font-mono">service_scaling</span>
              </div>
              <h3 className="font-bold text-foreground text-lg">ขูดหินปูน (Scaling)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ขจัดคราบหินปูน คราบชากาแฟ ป้องกันโรคเหงือกอักเสบ ดูแลรอยยิ้มให้สะอาดสดชื่น
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">ราคาเริ่มต้น</span>
                <div className="text-xl font-extrabold text-teal-700 dark:text-teal-300">
                  900 <span className="text-xs font-normal text-muted-foreground">บาท</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectService("service_scaling")}
                className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>จองบริการนี้</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Service 2 */}
          <div className="bg-card p-5 rounded-3xl border shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  ⏱️ 60 นาที
                </span>
                <span className="text-xs text-muted-foreground font-mono">service_whitening</span>
              </div>
              <h3 className="font-bold text-foreground text-lg">ฟอกสีฟัน Cool Light</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ระบบ Cool Light ปลอดภัย ไม่ทำลายผิวฟัน ฟันขาวกระจ่างใสขึ้นทันที 2–4 เฉดสี
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">ราคาเริ่มต้น</span>
                <div className="text-xl font-extrabold text-teal-700 dark:text-teal-300">
                  3,500 <span className="text-xs font-normal text-muted-foreground">บาท</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectService("service_whitening")}
                className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>จองบริการนี้</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Service 3 */}
          <div className="bg-card p-5 rounded-3xl border shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ⏱️ 60 นาที
                </span>
                <span className="text-xs text-muted-foreground font-mono">service_ortho_consult</span>
              </div>
              <h3 className="font-bold text-foreground text-lg">ปรึกษาทันตกรรมจัดฟัน</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ตรวจโครงสร้างฟัน ถ่ายภาพประเมินรอยยิ้ม และวางแผนการรักษาจัดฟันเฉพาะบุคคล
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">ราคาเริ่มต้น</span>
                <div className="text-xl font-extrabold text-teal-700 dark:text-teal-300">
                  500 <span className="text-xs font-normal text-muted-foreground">บาท</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectService("service_ortho_consult")}
                className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>จองบริการนี้</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Service 4 */}
          <div className="bg-card p-5 rounded-3xl border shadow-xs hover:border-teal-500 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  ⏱️ 60 นาที
                </span>
                <span className="text-xs text-muted-foreground font-mono">service_ortho_appliance</span>
              </div>
              <h3 className="font-bold text-foreground text-lg">ติดเครื่องมือจัดฟัน</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ติดเครื่องมือรอบแรก พร้อมรับชุดอุปกรณ์ดูแลทำความสะอาดฟันเฉพาะบุคคล
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">ราคาเริ่มต้น</span>
                <div className="text-xl font-extrabold text-teal-700 dark:text-teal-300">
                  15,000 <span className="text-xs font-normal text-muted-foreground">บาท</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectService("service_ortho_appliance")}
                className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>จองบริการนี้</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DENTIST TEAM & DUTY SCHEDULE */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto space-y-8" id="dentists">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Our Dental Specialists
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ทีมทันตแพทย์และตารางเวรประจำคลินิก
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            เลือกนัดหมายกับทันตแพทย์ที่คุณเจาะจง หรือคลิกเพื่อจองคิวตามความเชี่ยวชาญ
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Dentist 1: Dr. May */}
          <div className="bg-card p-6 sm:p-7 rounded-3xl border shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start justify-between">
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
                alt="ทพญ. เมย์ สไมล์คราฟต์"
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border"
              />
              <div className="space-y-1.5">
                <div className="inline-block text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                  ทั่วไป & ฟอกสีฟัน
                </div>
                <h3 className="font-bold text-foreground text-base sm:text-lg">
                  ทพญ. เมย์ สไมล์คราฟต์
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  เชี่ยวชาญงานทันตกรรมเพื่อความงาม, ฟอกสีฟัน Cool Light และงานขูดหินปูน
                </p>
                <div className="pt-1 text-xs">
                  <span className="text-muted-foreground">วันเข้าเวร: </span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300">
                    จันทร์, พุธ, ศุกร์, เสาร์ (10:00 – 20:00 น.)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectDentist("dentist_may")}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer mt-2 sm:mt-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>นัดหมายกับทันตแพทย์</span>
            </button>
          </div>

          {/* Dentist 2: Dr. Chanon */}
          <div className="bg-card p-6 sm:p-7 rounded-3xl border shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5 items-start justify-between">
            <div className="flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
                alt="ทพ. ชนน เดนทัลแคร์"
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border"
              />
              <div className="space-y-1.5">
                <div className="inline-block text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-md">
                  ทันตกรรมจัดฟัน
                </div>
                <h3 className="font-bold text-foreground text-base sm:text-lg">
                  ทพ. ชนน เดนทัลแคร์
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  เชี่ยวชาญการจัดฟันทุกรูปแบบ, ปรับโครงสร้างฟันสบคร่อม และทันตกรรมพื้นฐาน
                </p>
                <div className="pt-1 text-xs">
                  <span className="text-muted-foreground">วันเข้าเวร: </span>
                  <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                    อังคาร, พฤหัสบดี, อาทิตย์ (10:00 – 20:00 น.)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectDentist("dentist_chanon")}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer mt-2 sm:mt-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>นัดหมายกับทันตแพทย์</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BOOKING WIZARD SECTION */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto scroll-mt-20" id="booking-section">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>ระบบนัดหมายออนไลน์ Smile Craft</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ระบุข้อมูลและล็อกเวลานัดหมายของคุณ
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            สล็อตเวลาถูกล็อกทันทีเพื่อป้องกันการจองซ้อน พร้อมรับรหัสเพื่อตรวจสอบสถานะได้ตลอด 24 ชั่วโมง
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
      <section className="px-4 sm:px-6 max-w-6xl mx-auto space-y-8" id="location">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Location & Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ที่ตั้งและการเดินทางมายังคลินิก
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            ตั้งอยู่ใจกลางเมืองอโศก เดินทางสะดวกด้วยรถไฟฟ้า BTS/MRT พร้อมที่จอดรถรับรอง
          </p>
        </div>

        <div className="bg-card rounded-3xl border shadow-sm overflow-hidden grid lg:grid-cols-12">
          {/* Map Left Info */}
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 font-bold text-foreground text-lg">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
                <span>คลินิกทันตกรรมสไมล์คราฟต์</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">ที่อยู่: </strong>
                  อาคารสุขุมวิท 21 ทาวเวอร์ ชั้น 4 ถนนอโศกมนตรี แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">การเดินทาง: </strong>
                  BTS อโศก (ทางออก 3) หรือ MRT สุขุมวิท (ทางออก 1) เดินเข้าซอยสุขุมวิท 21 เพียง 3 นาที
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

            <div className="pt-4 border-t flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=Sukhumvit+21+Bangkok"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>📍 เปิดใน Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="tel:029998888"
                className="flex items-center gap-2 bg-muted hover:bg-accent text-foreground font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>โทร 02-999-8888</span>
              </a>
            </div>
          </div>

          {/* Map Right: Interactive Google Maps Iframe */}
          <div className="lg:col-span-7 h-[300px] sm:h-[380px] lg:h-auto min-h-[300px] bg-muted relative">
            <iframe
              title="แผนที่ที่ตั้ง คลินิกทันตกรรมสไมล์คราฟต์ อโศก"
              src="https://maps.google.com/maps?q=Sukhumvit+21+Asoke+Bangkok&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 7. CLINIC FOOTER */}
      <footer className="pt-12 border-t text-xs text-muted-foreground max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10">
          {/* Col 1 */}
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                SC
              </div>
              <span className="font-extrabold text-foreground text-sm tracking-tight">
                SMILE CRAFT DENTAL CLINIC
              </span>
            </div>
            <p className="leading-relaxed max-w-md">
              คลินิกทันตกรรมระดับพรีเมียม ให้บริการนัดหมายทันตกรรมเฉพาะทางด้วยระบบ Time Slot Real-time
              ล็อกเวลาทันที ไม่ต้องรอคิว ดูแลรอยยิ้มอย่างประณีตและใส่ใจ
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
                  className="hover:text-foreground cursor-pointer text-left"
                >
                  นัดหมายออนไลน์ทันที
                </button>
              </li>
              <li>
                <Link href={"/check-status" as Route} className="hover:text-foreground">
                  ตรวจสอบนัดหมาย (Digital Pass)
                </Link>
              </li>
              <li>
                <Link href={"/admin" as Route} className="hover:text-foreground">
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

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 Smile Craft Dental Clinic. All rights reserved.</p>
          <p className="text-muted-foreground/70">
            ระบบจองคิวนัดหมายทันตกรรมแบบล็อกเวลาเฉพาะบุคคล (Time Slot Engine)
          </p>
        </div>
      </footer>
    </div>
  );
}
