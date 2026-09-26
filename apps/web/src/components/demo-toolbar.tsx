"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CalendarSearch,
	Database,
	RefreshCw,
	Stethoscope,
	User,
} from "lucide-react";
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
		<aside
			aria-label="Demo controls"
			className="z-50 border-slate-800 border-b bg-slate-900 px-3 py-2 text-slate-200 text-xs shadow-inner sm:px-6"
		>
			<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
				{/* Left: Role Switcher */}
				<div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 p-1">
					<Link
						href={"/" as Route}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
							!isAdmin && !isStatusLookup
								? "bg-[#560BAD] font-semibold text-white shadow-sm"
								: "text-slate-300 hover:bg-slate-700/50 hover:text-white"
						}`}
					>
						<User className="h-3.5 w-3.5" />
						<span>หน้าบ้านคนไข้ (จองคิว)</span>
					</Link>

					<Link
						href={"/check-status" as Route}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
							isStatusLookup
								? "bg-[#560BAD] font-semibold text-white shadow-sm"
								: "text-slate-300 hover:bg-slate-700/50 hover:text-white"
						}`}
					>
						<CalendarSearch className="h-3.5 w-3.5" />
						<span>ตรวจสถานะนัดหมาย</span>
					</Link>

					<Link
						href={"/admin" as Route}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
							isAdmin
								? "bg-[#560BAD] font-semibold text-white shadow-sm"
								: "text-slate-300 hover:bg-slate-700/50 hover:text-white"
						}`}
					>
						<Stethoscope className="h-3.5 w-3.5" />
						<span>เคาน์เตอร์คลินิก (Admin)</span>
					</Link>
				</div>

				{/* Right: Sandbox Status Badge & Reset Action */}
				<div className="ml-auto flex items-center gap-3">
					<div className="hidden items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/60 px-2.5 py-1 text-[11px] text-emerald-300 md:flex">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
						</span>
						<Database className="h-3 w-3 text-emerald-400" />
						<span>Demo Sandbox Mode • D1 Connected</span>
					</div>

					<button
						onClick={handleReset}
						disabled={isResetting}
						className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 font-medium text-slate-100 transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50"
						title="รีเซ็ตและล้างข้อมูลใหม่พร้อม Seed ตัวอย่างแพทย์ 2 ท่าน และ 5 คิวนัดหมาย"
					>
						<RefreshCw
							className={`h-3.5 w-3.5 text-purple-400 ${isResetting ? "animate-spin" : ""}`}
						/>
						<span>{isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ตข้อมูล Mock Data"}</span>
					</button>
				</div>
			</div>
		</aside>
	);
}
