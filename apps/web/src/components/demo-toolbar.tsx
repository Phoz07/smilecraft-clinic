"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarSearch, Database, RefreshCw, Stethoscope, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export function DemoToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const resetMutation = useMutation(
    trpc.demo.reset.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries();
        toast.success("รีเซ็ตข้อมูล Mock สำเร็จ!", {
          description: `โหลดข้อมูลเริ่มต้น: ทันตแพทย์ ${data.dentistsCount} ท่าน, บริการ ${data.servicesCount} รายการ, นัดหมายตัวอย่าง ${data.appointmentsCount} รายการ`,
        });
        setIsResetting(false);
        router.refresh();
      },
      onError: (err) => {
        toast.error("รีเซ็ตข้อมูลไม่สำเร็จ", {
          description: err.message,
        });
        setIsResetting(false);
      },
    }),
  );

  const handleReset = async () => {
    setIsResetting(true);
    resetMutation.mutate();
  };

  const isAdmin = pathname.startsWith("/admin");
  const isStatusLookup = pathname.startsWith("/check-status");

  return (
    <aside aria-label="Demo controls" className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-3 sm:px-6 shadow-inner z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <Link
            href={"/" as Route}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              !isAdmin && !isStatusLookup
                ? "bg-teal-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>หน้าบ้านคนไข้ (จองคิว)</span>
          </Link>

          <Link
            href={"/check-status" as Route}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              isStatusLookup
                ? "bg-teal-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <CalendarSearch className="w-3.5 h-3.5" />
            <span>ตรวจสถานะนัดหมาย</span>
          </Link>

          <Link
            href={"/admin" as Route}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              isAdmin
                ? "bg-blue-500 text-white font-semibold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>เคาน์เตอร์คลินิก (Admin)</span>
          </Link>
        </div>

        {/* Right: Sandbox Status Badge & Reset Action */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-2 bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 px-2.5 py-1 rounded-full text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Demo Sandbox Mode • D1 Connected</span>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-medium px-3 py-1.5 rounded-md border border-slate-600 transition-all disabled:opacity-50 cursor-pointer"
            title="รีเซ็ตและล้างข้อมูลใหม่พร้อม Seed ตัวอย่างแพทย์ 2 ท่าน และ 5 คิวนัดหมาย"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isResetting ? "animate-spin" : ""}`} />
            <span>{isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ตข้อมูล Mock Data"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
