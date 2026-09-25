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

export function BookingFlow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>("service_scaling");
  const [selectedDentistId, setSelectedDentistId] = useState<string>("any");

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
      const dayOfWeek = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."][d.getDay()];
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
    <div className="bg-card rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8">
      {/* Progress Steps Header */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-muted-foreground mb-3">
            <span className={step >= 1 ? "text-teal-600 dark:text-teal-400 font-semibold" : ""}>
              1. เลือกบริการ
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className={step >= 2 ? "text-teal-600 dark:text-teal-400 font-semibold" : ""}>
              2. เลือกทันตแพทย์
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className={step >= 3 ? "text-teal-600 dark:text-teal-400 font-semibold" : ""}>
              3. วันและเวลา
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className={step >= 4 ? "text-teal-600 dark:text-teal-400 font-semibold" : ""}>
              4. ข้อมูลคนไข้
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              เลือกบริการทันตกรรมที่ต้องการ
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              คลินิกใช้เวลาตรวจและรักษาตามมาตรฐานหัตถการ พร้อมแจ้งราคาเริ่มต้นชัดเจน
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {servicesQuery.isLoading && (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                กำลังโหลดรายการบริการ...
              </div>
            )}

            {servicesQuery.data?.map((srv) => {
              const isSelected = selectedServiceId === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm"
                      : "border-border hover:border-teal-300 hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-base">{srv.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      ระยะเวลา {srv.durationMinutes} นาที
                    </span>
                    <span className="font-bold text-teal-700 dark:text-teal-300 text-sm">
                      {srv.price.toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedServiceId}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>ถัดไป: เลือกทันตแพทย์</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Dentist */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              เลือกทันตแพทย์ผู้ให้การรักษา
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              สำหรับบริการ: <strong className="text-foreground">{selectedService?.name}</strong>{" "}
              (แสดงเฉพาะแพทย์ที่มีสิทธิ์การรักษาในหัตถการนี้)
            </p>
          </div>

          <div className="space-y-3">
            {/* Quickest option */}
            <div
              onClick={() => setSelectedDentistId("any")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedDentistId === "any"
                  ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm"
                  : "border-border hover:border-teal-300"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      แพทย์ท่านใดก็ได้ (คิวเร็วที่สุด)
                    </h3>
                    <span className="text-[11px] font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      แนะนำ
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ระบบจะค้นหาแพทย์ที่ว่างเร็วที่สุดเพื่อให้คุณได้รับการรักษาโดยไม่ต้องรอนาน
                  </p>
                </div>
              </div>
              {selectedDentistId === "any" && (
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Specific Eligible Dentists */}
            {eligibleDentists.map((doc) => {
              const isSelected = selectedDentistId === doc.id;
              // Format duty days text
              const dutyDays = doc.dutySchedules.map((ds) => {
                return ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."][ds.dayOfWeek];
              });

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDentistId(doc.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm"
                      : "border-border hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {doc.avatarUrl ? (
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        วันตรวจประจำ: {dutyDays.join(", ")} (10:00 – 20:00 น.)
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl border hover:bg-accent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>ถัดไป: เลือกวันและเวลา</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Date & Time Slot */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              เลือกวันและเวลาที่สะดวก
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              คลินิกเปิดทำการ 10:00 – 20:00 น. ซอยเวลาละ 30 นาที (ห้ามจองซ้อนตามจำนวนแพทย์ที่เข้าเวร)
            </p>
          </div>

          {/* Date Picker Ribbon */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              เลือกวันที่
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {dateOptions.map((item) => {
                const isSelected = selectedDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.iso);
                      setSelectedTime(null);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 min-w-[70px] rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white shadow-sm scale-105"
                        : "border-border hover:border-teal-300 hover:bg-accent/40 text-foreground"
                    }`}
                  >
                    <span className="text-[11px] font-medium opacity-80">{item.dayOfWeek}</span>
                    <span className="text-lg font-bold my-0.5">{item.dayNumber}</span>
                    <span className="text-[10px] opacity-75">{item.month}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
              📅 วันที่เลือก: {formatThaiDate(selectedDate)}
            </p>
          </div>

          {/* Time Slot Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                เลือกช่วงเวลา ({selectedService?.durationMinutes} นาที)
              </label>
              {slotsQuery.isFetching && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  กำลังตรวจสอบ Slot ว่าง...
                </span>
              )}
            </div>

            {slotsQuery.data?.slots.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed rounded-xl">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-medium text-foreground">ไม่มีทันตแพทย์เข้าเวรในวันที่เลือก</p>
                <p className="text-xs text-muted-foreground mt-1">
                  กรุณาเลือกวันอื่น หรือปรับแพทย์ผู้ให้การรักษา
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {slotsQuery.data?.slots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-teal-600 text-white border-teal-600 shadow-sm font-semibold ring-2 ring-teal-500/20"
                          : slot.isAvailable
                            ? "border-border hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-foreground font-medium"
                            : "bg-muted/40 border-muted text-muted-foreground/50 cursor-not-allowed line-through text-xs"
                      }`}
                    >
                      <div className="text-sm font-mono">{slot.time}</div>
                      <div className="text-[10px] opacity-75">
                        {slot.isAvailable ? `ถึง ${slot.endTime}` : "เต็ม"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl border hover:bg-accent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedTime}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>ถัดไป: กรอกข้อมูลคนไข้</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Patient Info Form */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              กรอกข้อมูลคนไข้เพื่อยืนยันการจอง
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยเพื่อการติดต่อและเตรียมการรักษาทางคลินิก
            </p>
          </div>

          {/* Booking Summary Pill Card */}
          <div className="bg-muted/50 rounded-xl p-4 border text-xs sm:text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">บริการที่เลือก:</span>
              <span className="font-semibold text-foreground">{selectedService?.name}</span>
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
              <span className="font-semibold text-teal-700 dark:text-teal-300">
                {formatThaiDate(selectedDate)} เวลา {selectedTime} น. (
                {selectedService?.durationMinutes} นาที)
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t">
              <span className="text-muted-foreground">ค่าบริการเริ่มต้น:</span>
              <span className="font-bold text-teal-600 text-base">
                {selectedService?.price.toLocaleString()} บาท
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                ชื่อ - นามสกุลคนไข้ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น นายธนกร สุขสันต์"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="เช่น 0812345678"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                * ใช้สำหรับโทรยืนยันนัด และใช้ตรวจสอบสถานะนัดหมายคู่กับรหัสการจอง
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                โรคประจำตัว หรือ ประวัติแพ้ยา (ถ้ามี)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น แพ้ยาเพนิซิลลิน, ความดันโลหิตสูง, หรือไม่มี"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl border hover:bg-accent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{createMutation.isPending ? "กำลังบันทึกนัดหมาย..." : "ยืนยันการนัดหมาย"}</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Digital Appointment Pass Confirmation */}
      {step === 5 && confirmedBooking && (
        <div className="space-y-6 text-center py-2">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
              🟡 รอยืนยัน (Pending) - ล็อก Slot เรียบร้อย
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-3">
              จองคิวนัดหมายสำเร็จ!
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              ระบบได้ทำการล็อกช่วงเวลาของคุณเรียบร้อยแล้ว เจ้าหน้าที่เคาน์เตอร์จะโทรติดต่อยืนยันก่อนวันนัด
            </p>
          </div>

          {/* Digital Pass Card */}
          <div className="max-w-md mx-auto bg-gradient-to-b from-teal-50/50 to-background dark:from-slate-900 dark:to-slate-950 rounded-2xl border-2 border-teal-500/30 p-6 text-left shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-teal-500/10 rounded-full blur-xl" />

            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  รหัสการจองนัดหมาย (Booking Code)
                </span>
                <div className="font-mono text-xl sm:text-2xl font-extrabold text-teal-700 dark:text-teal-300 tracking-wider">
                  {confirmedBooking.bookingCode}
                </div>
              </div>
              <button
                onClick={copyBookingCode}
                className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 hover:bg-teal-200 text-teal-800 dark:text-teal-200 transition-colors cursor-pointer"
                title="คัดลอกรหัส"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ชื่อคนไข้:</span>
                <span className="font-semibold text-foreground">{confirmedBooking.patientName}</span>
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
                <span className="font-bold text-teal-700 dark:text-teal-300">
                  {formatThaiDate(confirmedBooking.appointmentDate)} เวลา{" "}
                  {confirmedBooking.startTime} – {confirmedBooking.endTime} น.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Smile Craft Dental Clinic • สุขุมวิท 21 (ใกล้ BTS อโศก)</span>
            </div>
          </div>

          {/* Quick Contact & Next Actions */}
          <div className="max-w-md mx-auto space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:029998888"
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-medium py-2.5 rounded-xl border text-xs sm:text-sm transition-colors"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>โทรหาคลินิก</span>
              </a>
              <a
                href="https://line.me/R/ti/p/@smilecraft"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-medium py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>ทัก LINE Official</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={"/check-status" as Route}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                <span>ตรวจสถานะนัดหมายในภายหลัง</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedTime(null);
                  setConfirmedBooking(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border rounded-xl hover:bg-accent cursor-pointer"
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
