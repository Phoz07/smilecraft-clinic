import type { Database } from "./index";
import {
  appointment,
  dentist,
  dentistService,
  dutySchedule,
  scheduleBlock,
  service,
} from "./schema/dental";

export async function resetDemoData(db: Database) {
  // Truncate / delete dynamic tables first
  await db.delete(appointment).execute();
  await db.delete(scheduleBlock).execute();
  await db.delete(dentistService).execute();
  await db.delete(dutySchedule).execute();
  await db.delete(service).execute();
  await db.delete(dentist).execute();

  // Seed Dentists
  const dentistsData = [
    {
      id: "dentist_may",
      name: "ทพญ. เมย์ สไมล์คราฟต์",
      title: "ทันตแพทย์ทั่วไป / ผู้เชี่ยวชาญด้านฟอกสีฟัน",
      specialization: "ทันตกรรมทั่วไป & ฟอกสีฟัน (D.D.S., General & Cosmetic Dentistry)",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
      isActive: true,
    },
    {
      id: "dentist_chanon",
      name: "ทพ. ชนน เดนทัลแคร์",
      title: "ทันตแพทย์เฉพาะทางทันตกรรมจัดฟัน",
      specialization: "ทันตกรรมจัดฟัน & ทันตกรรมทั่วไป (M.Sc., Orthodontics)",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
      isActive: true,
    },
  ];
  await db.insert(dentist).values(dentistsData).execute();

  // Seed Services
  const servicesData = [
    {
      id: "service_scaling",
      name: "ขูดหินปูน (Scaling)",
      durationMinutes: 30,
      price: 900,
      description: "ขจัดคราบหินปูน คราบชากาแฟ และดูแลสุขภาพเหงือกอย่างอ่อนโยน",
      isActive: true,
    },
    {
      id: "service_whitening",
      name: "ฟอกสีฟัน Cool Light (Teeth Whitening)",
      durationMinutes: 60,
      price: 3500,
      description: "ฟอกสีฟันระบบ Cool Light ปลอดภัย ฟันขาวกระจ่างใสเป็นธรรมชาติ",
      isActive: true,
    },
    {
      id: "service_ortho_consult",
      name: "ปรึกษาทันตกรรมจัดฟัน (Ortho Consultation)",
      durationMinutes: 60,
      price: 500,
      description: "ตรวจประเมินโครงสร้างฟันและขากรรไกร ถ่ายภาพประเมินรอยยิ้ม และวางแผนการรักษา",
      isActive: true,
    },
    {
      id: "service_ortho_appliance",
      name: "ติดเครื่องมือจัดฟัน (Ortho Appliance Placement)",
      durationMinutes: 60,
      price: 15000,
      description: "ติดเครื่องมือจัดฟันรอบแรก พร้อมรับชุดอุปกรณ์ดูแลทำความสะอาดฟันเฉพาะบุคคล",
      isActive: true,
    },
  ];
  await db.insert(service).values(servicesData).execute();

  // Seed Dentist-Service Capabilities
  const dentistServicesData = [
    // Dr. May: Scaling & Whitening
    { id: "ds_may_scaling", dentistId: "dentist_may", serviceId: "service_scaling" },
    { id: "ds_may_whitening", dentistId: "dentist_may", serviceId: "service_whitening" },
    // Dr. Chanon: Scaling, Ortho Consult, Ortho Appliance
    { id: "ds_chanon_scaling", dentistId: "dentist_chanon", serviceId: "service_scaling" },
    { id: "ds_chanon_ortho_consult", dentistId: "dentist_chanon", serviceId: "service_ortho_consult" },
    { id: "ds_chanon_ortho_appliance", dentistId: "dentist_chanon", serviceId: "service_ortho_appliance" },
  ];
  await db.insert(dentistService).values(dentistServicesData).execute();

  // Seed Duty Schedules (10:00 - 20:00)
  // Day of week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const dutySchedulesData = [
    // Dr. May: Mon (1), Wed (3), Fri (5), Sat (6)
    { id: "dsch_may_1", dentistId: "dentist_may", dayOfWeek: 1, startTime: "10:00", endTime: "20:00", isActive: true },
    { id: "dsch_may_3", dentistId: "dentist_may", dayOfWeek: 3, startTime: "10:00", endTime: "20:00", isActive: true },
    { id: "dsch_may_5", dentistId: "dentist_may", dayOfWeek: 5, startTime: "10:00", endTime: "20:00", isActive: true },
    { id: "dsch_may_6", dentistId: "dentist_may", dayOfWeek: 6, startTime: "10:00", endTime: "20:00", isActive: true },
    // Dr. Chanon: Tue (2), Thu (4), Sun (0)
    { id: "dsch_chanon_2", dentistId: "dentist_chanon", dayOfWeek: 2, startTime: "10:00", endTime: "20:00", isActive: true },
    { id: "dsch_chanon_4", dentistId: "dentist_chanon", dayOfWeek: 4, startTime: "10:00", endTime: "20:00", isActive: true },
    { id: "dsch_chanon_0", dentistId: "dentist_chanon", dayOfWeek: 0, startTime: "10:00", endTime: "20:00", isActive: true },
  ];
  await db.insert(dutySchedule).values(dutySchedulesData).execute();

  // Helper date strings based on 2026-09-25
  const today = "2026-09-25";
  const tomorrow = "2026-09-26";
  const sunday = "2026-09-27";

  // Seed Baseline Sample Appointments
  const appointmentsData = [
    {
      id: "apt_demo_01",
      bookingCode: "#SC-20260925-A2B3",
      patientName: "คุณสมศักดิ์ มั่นคง",
      patientPhone: "0812345678",
      medicalNotes: "ไม่มีโรคประจำตัว",
      dentistId: "dentist_may",
      serviceId: "service_scaling",
      appointmentDate: today,
      startTime: "10:30",
      endTime: "11:00",
      status: "COMPLETED" as const,
      internalNotes: "คนไข้มาตรงเวลา ขูดหินปูนเรียบร้อย นัดตรวจฟันซ้ำอีก 6 เดือน",
    },
    {
      id: "apt_demo_02",
      bookingCode: "#SC-20260925-K8M4",
      patientName: "คุณกัญญา พรทิพย์",
      patientPhone: "0898765432",
      medicalNotes: "⚠️ แพ้ยาเพนิซิลลิน (Penicillin Allergy)",
      dentistId: "dentist_may",
      serviceId: "service_whitening",
      appointmentDate: today,
      startTime: "14:00",
      endTime: "15:00",
      status: "CONFIRMED" as const,
      internalNotes: "โทรคอนเฟิร์มนัดแล้ว คนไข้แจ้งว่าจะมาก่อนเวลา 15 นาที",
    },
    {
      id: "apt_demo_03",
      bookingCode: "#SC-20260925-P7R9",
      patientName: "คุณนพดล เจริญศิลป์",
      patientPhone: "0865551234",
      medicalNotes: "ความดันโลหิตสูง (รับประทานยาควบคุมสม่ำเสมอ)",
      dentistId: "dentist_may",
      serviceId: "service_scaling",
      appointmentDate: today,
      startTime: "16:30",
      endTime: "17:00",
      status: "PENDING" as const,
      internalNotes: "คนไข้จองผ่านหน้าเว็บไซต์ รอเคาน์เตอร์โทรยืนยัน",
    },
    {
      id: "apt_demo_04",
      bookingCode: "#SC-20260926-C4D5",
      patientName: "คุณวิภาดา สดใส",
      patientPhone: "0823334444",
      medicalNotes: "ไม่มีประวัติแพ้ยา",
      dentistId: "dentist_may",
      serviceId: "service_whitening",
      appointmentDate: tomorrow,
      startTime: "11:00",
      endTime: "12:00",
      status: "CONFIRMED" as const,
      internalNotes: "ยืนยันนัดหมายเรียบร้อย",
    },
    {
      id: "apt_demo_05",
      bookingCode: "#SC-20260927-T9X2",
      patientName: "คุณธนภัทร รุ่งเรือง",
      patientPhone: "0841112222",
      medicalNotes: "ไม่มีโรคประจำตัว ต้องการประเมินฟันสบคร่อม",
      dentistId: "dentist_chanon",
      serviceId: "service_ortho_consult",
      appointmentDate: sunday,
      startTime: "13:00",
      endTime: "14:00",
      status: "CONFIRMED" as const,
      internalNotes: "ส่งประวัติภาพถ่ายเบื้องต้นแล้ว",
    },
  ];
  await db.insert(appointment).values(appointmentsData).execute();

  return {
    success: true,
    dentistsCount: dentistsData.length,
    servicesCount: servicesData.length,
    appointmentsCount: appointmentsData.length,
  };
}
