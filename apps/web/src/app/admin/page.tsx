"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
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
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Queries
  const dentistsQuery = useQuery(trpc.dentists.list.queryOptions());
  const appointmentsQuery = useQuery(
    trpc.appointments.adminList.queryOptions({
      date: selectedDate,
      dentistId: selectedDentistId,
      status: selectedStatus,
    }),
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

  const handleUpdateStatus = (
    id: string,
    status: "PENDING" | "CONFIRMED" | "IN_TREATMENT" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    notes?: string,
  ) => {
    updateStatusMutation.mutate({
      id,
      status,
      internalNotes: notes,
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
          color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
        };
      case "CONFIRMED":
        return {
          label: "ยืนยันแล้ว",
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
        };
      case "IN_TREATMENT":
        return {
          label: "กำลังรักษา",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
        };
      case "COMPLETED":
        return {
          label: "เสร็จสิ้น",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
        };
      case "CANCELLED":
        return {
          label: "ยกเลิกแล้ว",
          color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
        };
      case "NO_SHOW":
        return {
          label: "ไม่มาตามนัด",
          color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
        };
      default:
        return {
          label: status,
          color: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                ตารางนัดหมายและจัดการคิวเคาน์เตอร์ (Admin Dashboard)
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Smile Craft Dental Clinic • ตรวจสอบสถานะการรักษา โทรคอนเฟิร์มคิว และจัดการตารางงานประจำวัน
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => queryClient.invalidateQueries()}
              className="flex items-center gap-1.5 bg-background hover:bg-accent text-foreground text-xs font-medium px-3 py-2 rounded-xl border transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${appointmentsQuery.isFetching ? "animate-spin" : ""}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted p-1 rounded-xl border">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>มุมมองรายการ</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "calendar"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>ไทม์ไลน์รายชั่วโมง</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metric Cards Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-card p-3.5 rounded-xl border shadow-2xs space-y-1">
            <span className="text-[11px] text-muted-foreground">ทั้งหมดวันนี้</span>
            <div className="text-xl font-bold text-foreground">{metrics.total}</div>
          </div>
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">🟡 รอยืนยัน</span>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-200">{metrics.pending}</div>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">🟢 ยืนยันแล้ว</span>
            <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200">{metrics.confirmed}</div>
          </div>
          <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
            <span className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">🔵 กำลังรักษา</span>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-200">{metrics.inTreatment}</div>
          </div>
          <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
            <span className="text-[11px] text-purple-800 dark:text-purple-300 font-medium">🟣 เสร็จสิ้น</span>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">{metrics.completed}</div>
          </div>
          <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 space-y-1">
            <span className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">🔴 ยกเลิกแล้ว</span>
            <div className="text-xl font-bold text-rose-900 dark:text-rose-200">{metrics.cancelled}</div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-card rounded-2xl border p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Quick Dates */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">เลือกวันที่:</span>
              <button
                onClick={() => setSelectedDate("2026-09-25")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  selectedDate === "2026-09-25"
                    ? "bg-teal-600 text-white border-teal-600 font-semibold shadow-xs"
                    : "border-border hover:bg-muted"
                }`}
              >
                วันนี้ (25 ก.ย.)
              </button>
              <button
                onClick={() => setSelectedDate("2026-09-26")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  selectedDate === "2026-09-26"
                    ? "bg-teal-600 text-white border-teal-600 font-semibold shadow-xs"
                    : "border-border hover:bg-muted"
                }`}
              >
                เสาร์ (26 ก.ย.)
              </button>
              <button
                onClick={() => setSelectedDate("2026-09-27")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  selectedDate === "2026-09-27"
                    ? "bg-teal-600 text-white border-teal-600 font-semibold shadow-xs"
                    : "border-border hover:bg-muted"
                }`}
              >
                อาทิตย์ (27 ก.ย.)
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 rounded-xl border text-xs bg-background text-foreground"
              />
            </div>

            {/* Dentist Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">ทันตแพทย์:</span>
              <select
                value={selectedDentistId}
                onChange={(e) => setSelectedDentistId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
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

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-muted-foreground mr-1">สถานะ:</span>
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
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Patient Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, เบอร์โทร, รหัสจอง..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* VIEW 1: LIST VIEW */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {appointmentsQuery.isLoading && (
              <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border">
                กำลังโหลดรายการนัดหมาย...
              </div>
            )}

            {!appointmentsQuery.isLoading && filteredAppointments.length === 0 && (
              <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border space-y-2">
                <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                <p className="font-medium text-foreground">ไม่พบนัดหมายตามเงื่อนไขที่เลือก</p>
                <p className="text-xs">กรุณาปรับตัวกรองวันที่หรือสถานะ</p>
              </div>
            )}

            {filteredAppointments.map((apt) => {
              const badge = getStatusBadge(apt.status);
              return (
                <div
                  key={apt.id}
                  className="bg-card rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                >
                  {/* Leave Collision Warning Banner (ADR-0002) */}
                  {apt.hasLeaveCollision && (
                    <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold">
                          ⚠️ แพทย์ติดภารกิจลา / กรุณาติดต่อเลื่อนนัดหมาย
                        </span>
                      </div>
                      <span className="text-[11px] opacity-80">
                        โทรแจ้งคนไข้: {apt.patientPhone}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-mono font-bold text-sm shrink-0">
                        {apt.startTime} – {apt.endTime}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-base">
                            {apt.patientName}
                          </h3>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono text-[11px]">{apt.bookingCode}</span>
                          <span>•</span>
                          <a
                            href={`tel:${apt.patientPhone}`}
                            className="text-teal-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {apt.patientPhone}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:pl-4 text-xs">
                      <span className="text-muted-foreground">แพทย์ผู้ตรวจ:</span>
                      <p className="font-medium text-foreground">{apt.dentist?.name}</p>
                      <p className="text-teal-700 dark:text-teal-300 font-semibold">
                        {apt.service?.name} ({apt.service?.durationMinutes} นาที)
                      </p>
                    </div>
                  </div>

                  {/* Medical History & Allergies Warning Box */}
                  {apt.medicalNotes && (
                    <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">ข้อมูลสุขภาพ / ประวัติแพ้ยา: </span>
                        <span>{apt.medicalNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* Internal Notes / Audit History */}
                  {apt.internalNotes && (
                    <div className="text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
                      <span className="font-medium">บันทึกภายใน:</span> {apt.internalNotes}
                    </div>
                  )}

                  {/* Operational Action Buttons */}
                  <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">เปลี่ยนสถานะ:</span>

                      {apt.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            🟢 ยืนยันนัด (Confirm)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            🔴 ยกเลิก (ปลดล็อก Slot)
                          </button>
                        </>
                      )}

                      {apt.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, "IN_TREATMENT")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            🔵 เข้าห้องตรวจ (In Treatment)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, "NO_SHOW")}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            ⚫ ไม่มาตามนัด (No-show)
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            🔴 ยกเลิก (ปลดล็อก Slot)
                          </button>
                        </>
                      )}

                      {apt.status === "IN_TREATMENT" && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          🟣 เสร็จสิ้นการรักษา (Complete)
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
                      className="inline-flex items-center gap-1.5 text-teal-600 hover:underline font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>โทรออกหาคนไข้</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: HOURLY CALENDAR TIMELINE VIEW */}
        {viewMode === "calendar" && (
          <div className="bg-card rounded-2xl border p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-foreground text-base">
                ไทม์ไลน์รายชั่วโมงประจำวัน: {formatThaiDate(selectedDate)}
              </h2>
              <span className="text-xs text-muted-foreground">เวลาทำการ 10:00 – 20:00 น.</span>
            </div>

            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, idx) => {
                const hour = 10 + idx;
                const hourStr = `${String(hour).padStart(2, "0")}:00`;
                const nextHourStr = `${String(hour + 1).padStart(2, "0")}:00`;

                // Appointments starting in this hour
                const matchingApts = filteredAppointments.filter((a) => {
                  const [h] = a.startTime.split(":").map(Number);
                  return h === hour;
                });

                return (
                  <div
                    key={hourStr}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border bg-background/50 hover:bg-accent/20 transition-colors"
                  >
                    <div className="w-20 font-mono font-bold text-sm text-muted-foreground shrink-0">
                      {hourStr}
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2 w-full">
                      {matchingApts.length === 0 ? (
                        <span className="text-xs text-muted-foreground/50 italic py-1">
                          ไม่มีคิวนัดหมายในช่วงเวลานี้
                        </span>
                      ) : (
                        matchingApts.map((a) => {
                          const badge = getStatusBadge(a.status);
                          return (
                            <div
                              key={a.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 flex-1 min-w-[240px] ${
                                a.status === "PENDING"
                                  ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300"
                                  : a.status === "CONFIRMED"
                                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300"
                                    : "bg-muted/60 border-border"
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
                                  {a.service?.name} • หมอ{a.dentist?.name.split(" ")[1]}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                              >
                                {badge.label}
                              </span>
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
      </div>
    </div>
  );
}
