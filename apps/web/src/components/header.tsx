"use client";

import { Calendar, PhoneCall, Sparkles } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
				{/* Brand */}
				<Link href={"/" as Route} className="group flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#560BAD] text-white shadow-sm transition-transform group-hover:scale-105">
						<Sparkles className="h-5 w-5 text-purple-100" />
					</div>
					<div>
						<div className="flex items-center gap-1.5">
							<span className="font-bold text-foreground text-lg tracking-tight">
								Smile Craft
							</span>
							<span className="rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 font-semibold text-[#560BAD] text-xs dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
								Dental Clinic
							</span>
						</div>
						<p className="hidden text-[11px] text-muted-foreground sm:block">
							คลินิกทันตกรรมสไมล์คราฟต์ • เวลาทำการ 10:00 – 20:00 น. ทุกวัน
						</p>
					</div>
				</Link>

				{/* Quick Nav & Info */}
				<div className="flex items-center gap-3">
					<Link
						href={"/check-status" as Route}
						className="hidden items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
					>
						<Calendar className="h-3.5 w-3.5 text-[#560BAD] dark:text-purple-400" />
						<span>เช็กสถานะนัดหมาย</span>
					</Link>

					<a
						href="tel:029998888"
						className="hidden items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 font-medium text-[#560BAD] text-xs transition-colors hover:bg-purple-100 md:inline-flex dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60"
					>
						<PhoneCall className="h-3.5 w-3.5" />
						<span>02-999-8888</span>
					</a>

					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
