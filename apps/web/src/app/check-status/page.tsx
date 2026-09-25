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
import { trpc } from "@/utils/trpc";

function formatThaiDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"];
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `วัน${days[date.getDay()]}ที่ ${d} ${months[m - 1]} ${y + 543}`;
}

export default function CheckStatusPage() {
  const [phone, setPhone] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [searchParams, setSearchParams] = useState<{ phone: string; bookingCode: string } | null>(
    null,
  );

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
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-background dark:from-teal-950/10 dark:to-background py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>ระบบตรวจสอบสถานะนัดหมายที่ปลอดภัย (Privacy-First)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            ตรวจสอบสถานะการนัดหมาย
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            กรุณากรอกเบอร์โทรศัพท์และรหัสการจอง เพื่อเปิดดูบัตรนัดหมายดิจิทัลของคุณ
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-card rounded-2xl border p-5 sm:p-7 shadow-xs space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  เบอร์โทรศัพท์มือถือที่ใช้จอง
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 0898765432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  รหัสการจอง (Booking Code)
                </label>
                <input
                  type="text"
                  placeholder="เช่น #SC-20260925-K8M4"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={lookupQuery.isFetching}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{lookupQuery.isFetching ? "กำลังค้นหา..." : "ค้นหาข้อมูลนัดหมาย"}</span>
            </button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="pt-3 border-t text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ทดลองกดค้นหาด้วยเคสตัวอย่างจากระบบ:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("0898765432", "#SC-20260925-K8M4")}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-[11px] font-mono hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                คุณกัญญา (ยืนยันแล้ว • มีแพ้ยา)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("0865551234", "#SC-20260925-P7R9")}
                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 text-[11px] font-mono hover:bg-amber-100 transition-colors cursor-pointer"
              >
                คุณนพดล (รอยืนยัน • ความดัน)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("0812345678", "#SC-20260925-A2B3")}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 text-[11px] font-mono hover:bg-purple-100 transition-colors cursor-pointer"
              >
                คุณสมศักดิ์ (เสร็จสิ้น)
              </button>
            </div>
          </div>
        </div>

        {/* Search Result: Found */}
        {appointment && statusInfo && (
          <div className="space-y-4">
            <div className="bg-card rounded-3xl border-2 border-teal-500/40 shadow-lg p-6 sm:p-8 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                  <div className="flex items-center gap-1.5 text-teal-600 font-bold text-lg">
                    <Sparkles className="w-5 h-5" />
                    <span>Smile Craft Dental Clinic</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    บัตรนัดหมายดิจิทัล (Digital Appointment Pass)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    รหัสการจอง
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xl text-foreground">
                      {appointment.bookingCode}
                    </span>
                    <button
                      onClick={() => copyBookingCode(appointment.bookingCode)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="คัดลอกรหัส"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`mt-5 p-3.5 rounded-xl border ${statusInfo.bg}`}>
                <div className="font-semibold text-sm">{statusInfo.label}</div>
                <p className="text-xs opacity-90 mt-0.5">{statusInfo.desc}</p>
              </div>

              {/* Appointment Body Details */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 my-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">ชื่อคนไข้ผู้รับบริการ:</span>
                  <p className="font-semibold text-foreground text-base">
                    {appointment.patientName}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">เบอร์โทรศัพท์:</span>
                  <p className="font-semibold text-foreground text-base">
                    {appointment.patientPhone}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">หัตถการ / บริการ:</span>
                  <p className="font-semibold text-foreground text-base">
                    {appointment.service?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ระยะเวลา {appointment.service?.durationMinutes} นาที • ค่าบริการเริ่มต้น{" "}
                    {appointment.service?.price.toLocaleString()} บาท
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">ทันตแพทย์ผู้ดูแล:</span>
                  <p className="font-semibold text-foreground text-base">
                    {appointment.dentist?.name}
                  </p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    {appointment.dentist?.specialization}
                  </p>
                </div>

                <div className="sm:col-span-2 p-4 bg-muted/40 rounded-xl space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    กำหนดเวลานัดหมาย:
                  </span>
                  <p className="font-bold text-lg text-teal-700 dark:text-teal-300">
                    {formatThaiDate(appointment.appointmentDate)} เวลา {appointment.startTime} –{" "}
                    {appointment.endTime} น.
                  </p>
                </div>

                {appointment.medicalNotes && (
                  <div className="sm:col-span-2 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>ข้อมูลสุขภาพและข้อควรระวัง:</span>
                    </div>
                    <p className="text-xs">{appointment.medicalNotes}</p>
                  </div>
                )}
              </div>

              {/* Pass Footer / Clinic Location */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>สุขุมวิท 21 อาคารสุขุมวิท 21 ทาวเวอร์ ชั้น 2 (BTS อโศก)</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="hidden sm:inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์หรือบันทึกบัตรนัด</span>
                </button>
              </div>
            </div>

            {/* Quick Actions (Read-Only Policy as decided) */}
            <div className="bg-card rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-foreground text-sm">
                  ต้องการเลื่อนนัด หรือมีข้อสอบถามเพิ่มเติม?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ติดต่อเจ้าหน้าที่เคาน์เตอร์คลินิกได้โดยตรงเพื่อดำเนินการปรับตารางเวลา
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <a
                  href="tel:029998888"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>โทร 02-999-8888</span>
                </a>
                <a
                  href="https://line.me/R/ti/p/@smilecraft"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-medium px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LINE Official</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Search Result: Not Found */}
        {lookupQuery.isError && searchParams && (
          <div className="bg-card rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">ไม่พบข้อมูลการนัดหมาย</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                ไม่พบนัดหมายที่ตรงกับเบอร์โทรศัพท์{" "}
                <span className="font-semibold text-foreground">{searchParams.phone}</span> และรหัส{" "}
                <span className="font-semibold text-foreground">{searchParams.bookingCode}</span>
              </p>
            </div>

            <div className="bg-muted/40 p-4 rounded-xl text-xs text-muted-foreground max-w-md mx-auto text-left space-y-1">
              <p className="font-medium text-foreground">คำแนะนำ:</p>
              <p>• ตรวจสอบว่าเบอร์โทรศัพท์ตรงกับเบอร์ที่กรอกไว้ตอนจองหรือไม่</p>
              <p>• รหัสการจองต้องขึ้นต้นด้วยเครื่องหมาย # (เช่น #SC-20260925-A2B3)</p>
              <p>• หากลืมรหัสการจอง สามารถติดต่อเคาน์เตอร์คลินิกเพื่อให้เจ้าหน้าที่ค้นหาจากชื่อได้</p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <a
                href="tel:029998888"
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-xl text-xs transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>โทรติดต่อเคาน์เตอร์คลินิก</span>
              </a>
              <Link
                href={"/" as Route}
                className="inline-flex items-center gap-1.5 border hover:bg-accent text-foreground font-medium px-4 py-2 rounded-xl text-xs transition-colors"
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
