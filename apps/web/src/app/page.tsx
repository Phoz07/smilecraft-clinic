import { BookingFlow } from "@/components/booking-flow";
import {
  Calendar,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-background to-background dark:from-teal-950/20 dark:via-background dark:to-background pb-16">
      {/* Hero Header */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-teal-100/80 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Smile Craft Dental Clinic • ดูแลรอยยิ้มอย่างประณีต</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight sm:leading-tight">
          จองคิวทำฟันออนไลน์ <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            สะดวกรวดเร็ว ล็อกเวลาทันที
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          เลือกบริการและทันตแพทย์ที่คุณวางใจได้เอง พร้อมตรวจสอบเวลาว่างแบบ Real-time
          ไม่มีคิวซ้อนทับ มั่นใจในการรักษามาตรฐานสูง
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>เปิด 10:00 – 20:00 น. ทุกวัน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>ปลอดเชื้อมาตรฐานระดับสากล</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-teal-600 shrink-0" />
            <span>ราคาเริ่มต้นโปร่งใส ไม่มีบวกเพิ่ม</span>
          </div>
        </div>
      </section>

      {/* Main Interactive Booking Card */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto" id="booking">
        <BookingFlow />
      </section>

      {/* Starting Prices & Doctors Grid */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto mt-16 sm:mt-24 space-y-12">
        {/* Prices */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              รายการค่าบริการทันตกรรมเริ่มต้น
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              อัตราค่าบริการมาตรฐาน สามารถเลือกจองคิวและระบุความต้องการได้ทันที
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                30 นาที
              </span>
              <h3 className="font-semibold text-foreground text-base">ขูดหินปูน (Scaling)</h3>
              <p className="text-xs text-muted-foreground">
                ขจัดคราบหินปูน คราบชากาแฟ ป้องกันโรคเหงือกอักเสบ
              </p>
              <div className="pt-2 text-lg font-bold text-teal-700 dark:text-teal-300">
                900 <span className="text-xs font-normal text-muted-foreground">บาท</span>
              </div>
            </div>

            <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                60 นาที
              </span>
              <h3 className="font-semibold text-foreground text-base">ฟอกสีฟัน Cool Light</h3>
              <p className="text-xs text-muted-foreground">
                ระบบ Cool Light ปลอดภัย ฟันขาวกระจ่างใสเป็นธรรมชาติ
              </p>
              <div className="pt-2 text-lg font-bold text-teal-700 dark:text-teal-300">
                3,500 <span className="text-xs font-normal text-muted-foreground">บาท</span>
              </div>
            </div>

            <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                60 นาที
              </span>
              <h3 className="font-semibold text-foreground text-base">ปรึกษาทันตกรรมจัดฟัน</h3>
              <p className="text-xs text-muted-foreground">
                ตรวจโครงสร้างฟัน ถ่ายภาพประเมินรอยยิ้ม และวางแผนการรักษา
              </p>
              <div className="pt-2 text-lg font-bold text-teal-700 dark:text-teal-300">
                500 <span className="text-xs font-normal text-muted-foreground">บาท</span>
              </div>
            </div>

            <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                60 นาที
              </span>
              <h3 className="font-semibold text-foreground text-base">ติดเครื่องมือจัดฟัน</h3>
              <p className="text-xs text-muted-foreground">
                ติดเครื่องมือรอบแรก พร้อมรับชุดดูแลสุขอนามัยช่องปาก
              </p>
              <div className="pt-2 text-lg font-bold text-teal-700 dark:text-teal-300">
                15,000 <span className="text-xs font-normal text-muted-foreground">บาท</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dentists Schedule */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              ทีมทันตแพทย์และตารางเวรประจำคลินิก
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              มั่นใจในคุณภาพการรักษาโดยทันตแพทย์ผู้เชี่ยวชาญเฉพาะทาง
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-2xl border flex gap-4 items-start shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
                alt="ทพญ. เมย์ สไมล์คราฟต์"
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base">ทพญ. เมย์ สไมล์คราฟต์</h3>
                <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
                  ทันตแพทย์ทั่วไป & ผู้เชี่ยวชาญด้านฟอกสีฟัน
                </p>
                <p className="text-xs text-muted-foreground">
                  เชี่ยวชาญงานทันตกรรมเพื่อความงาม, ฟอกสีฟัน และขูดหินปูน
                </p>
                <div className="pt-2 text-xs">
                  <span className="font-semibold text-foreground">ตารางเวร: </span>
                  <span className="text-teal-700 dark:text-teal-300 font-medium">
                    จันทร์, พุธ, ศุกร์, เสาร์ (10:00 – 20:00 น.)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border flex gap-4 items-start shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
                alt="ทพ. ชนน เดนทัลแคร์"
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base">ทพ. ชนน เดนทัลแคร์</h3>
                <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
                  ทันตแพทย์เฉพาะทางทันตกรรมจัดฟัน
                </p>
                <p className="text-xs text-muted-foreground">
                  เชี่ยวชาญการจัดฟันทุกรูปแบบ, ปรับโครงสร้างขากรรไกร และงานทันตกรรมพื้นฐาน
                </p>
                <div className="pt-2 text-xs">
                  <span className="font-semibold text-foreground">ตารางเวร: </span>
                  <span className="text-teal-700 dark:text-teal-300 font-medium">
                    อังคาร, พฤหัสบดี, อาทิตย์ (10:00 – 20:00 น.)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact Info Footer */}
        <div className="bg-muted/40 rounded-2xl border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-foreground text-lg">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span>ที่ตั้งและข้อมูลการเดินทาง</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Smile Craft Dental Clinic อาคารสุขุมวิท 21 ทาวเวอร์ ชั้น 2 (เดินจาก BTS อโศก เพียง 3 นาที)
              <br />
              มีที่จอดรถในอาคาร ประทับตราจอดฟรี 3 ชั่วโมง
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:029998888"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>โทร 02-999-8888</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
