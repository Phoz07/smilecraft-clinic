import { describe, expect, it } from "bun:test";
import { createTestDb } from "@smilecraft-clinic/db";
import { appRouter } from "../src/routers/index";

describe("Ticket 4: Admin Daily Appointment Dashboard & Status Lifecycle Management", () => {
  it("filters appointments by date and dentist", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // Query today's appointments (2026-09-25)
    const todayAppointments = await caller.appointments.adminList({
      date: "2026-09-25",
    });

    expect(todayAppointments.length).toBe(6); // COMPLETED, IN_TREATMENT, CONFIRMED, PENDING, CANCELLED, NO_SHOW
    expect(todayAppointments[0]?.startTime).toBe("10:30");
    expect(todayAppointments[1]?.startTime).toBe("11:30");
    expect(todayAppointments[2]?.startTime).toBe("14:00");
    expect(todayAppointments[3]?.startTime).toBe("16:30");
    expect(todayAppointments[4]?.startTime).toBe("18:00");
    expect(todayAppointments[5]?.startTime).toBe("19:00");

    // Filter by dentist
    const mayApts = await caller.appointments.adminList({
      dentistId: "dentist_may",
    });
    expect(mayApts.length).toBe(7); // 6 today, 1 tomorrow

    const chanonApts = await caller.appointments.adminList({
      dentistId: "dentist_chanon",
    });
    expect(chanonApts.length).toBe(1); // 1 on Sunday
    expect(chanonApts[0]?.hasScheduleBlockCollision).toBe(true);
  });

  it("transitions status and frees slot when cancelled (ADR-0001)", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // apt_demo_03 is on 2026-09-25 at 16:30 (Scaling, Dr. May) with status PENDING
    // 1. Confirm it
    await caller.appointments.updateStatus({
      id: "apt_demo_03",
      status: "CONFIRMED",
      internalNotes: "โทรคอนเฟิร์มเรียบร้อย",
    });

    const aptAfterConfirm = await caller.appointments.lookup({
      phone: "0865551234",
      bookingCode: "#SC-20260925-P7R9",
    });
    expect(aptAfterConfirm.status).toBe("CONFIRMED");

    // 2. Start treatment
    await caller.appointments.updateStatus({
      id: "apt_demo_03",
      status: "IN_TREATMENT",
    });
    const aptInTreatment = await caller.appointments.lookup({
      phone: "0865551234",
      bookingCode: "#SC-20260925-P7R9",
    });
    expect(aptInTreatment.status).toBe("IN_TREATMENT");

    // 3. Complete treatment
    await caller.appointments.updateStatus({
      id: "apt_demo_03",
      status: "COMPLETED",
    });
    const aptCompleted = await caller.appointments.lookup({
      phone: "0865551234",
      bookingCode: "#SC-20260925-P7R9",
    });
    expect(aptCompleted.status).toBe("COMPLETED");

    // 4. Test Cancellation frees slot
    // apt_demo_02 is at 14:00 on 2026-09-25 (Whitening, Dr. May, CONFIRMED)
    // Check that 14:00 is currently unavailable
    const slotsBefore = await caller.appointments.getAvailableSlots({
      serviceId: "service_whitening",
      date: "2026-09-25",
      dentistId: "dentist_may",
    });
    const slot14Before = slotsBefore.slots.find((s) => s.time === "14:00");
    expect(slot14Before?.isAvailable).toBe(false);

    // Cancel apt_demo_02
    await caller.appointments.updateStatus({
      id: "apt_demo_02",
      status: "CANCELLED",
      internalNotes: "คนไข้ติดธุระขอยกเลิกนัด",
    });

    // Check that 14:00 is NOW available again!
    const slotsAfter = await caller.appointments.getAvailableSlots({
      serviceId: "service_whitening",
      date: "2026-09-25",
      dentistId: "dentist_may",
    });
    const slot14After = slotsAfter.slots.find((s) => s.time === "14:00");
    expect(slot14After?.isAvailable).toBe(true);
  });
});
