"use client";

import { Calendar, PhoneCall, Sparkles } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand */}
        <Link href={"/" as Route} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-foreground tracking-tight">Smile Craft</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Dental Clinic
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              คลินิกทันตกรรมสไมล์คราฟต์ • เวลาทำการ 10:00 – 20:00 น. ทุกวัน
            </p>
          </div>
        </Link>

        {/* Quick Nav & Info */}
        <div className="flex items-center gap-3">
          <Link
            href={"/check-status" as Route}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-input hover:bg-accent transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>เช็กสถานะนัดหมาย</span>
          </Link>

          <a
            href="tel:029998888"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>02-999-8888</span>
          </a>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
