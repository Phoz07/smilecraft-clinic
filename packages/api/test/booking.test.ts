import { describe, expect, it } from "bun:test";
import { createTestDb } from "@smilecraft-clinic/db";
import { appRouter } from "../src/routers/index";

describe("Ticket 2: Public Clinic Landing & Patient Appointment Booking Flow", () => {
  it("computes available slots with doctor qualification and time durations", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // 2026-09-25 is Friday (Day 5) -> Dr. May is on duty
    // Test 30-minute service: Scaling
    const slots30 = await caller.appointments.getAvailableSlots({
      serviceId: "service_scaling",
      date: "2026-09-25",
    });

    expect(slots30.slots.length).toBe(20); // 10:00 to 19:30 = 20 slots
    expect(slots30.slots[0]?.time).toBe("10:00");
    expect(slots30.slots[slots30.slots.length - 1]?.time).toBe("19:30");
    expect(slots30.slots[slots30.slots.length - 1]?.endTime).toBe("20:00");

    // Test 60-minute service: Whitening
    const slots60 = await caller.appointments.getAvailableSlots({
      serviceId: "service_whitening",
      date: "2026-09-25",
    });

    expect(slots60.slots.length).toBe(19); // 10:00 to 19:00 = 19 slots
    expect(slots60.slots[slots60.slots.length - 1]?.time).toBe("19:00");
    expect(slots60.slots[slots60.slots.length - 1]?.endTime).toBe("20:00");

    // 2026-09-29 is Tuesday (Day 2) -> Dr. Chanon is on duty, Dr. May is NOT
    // Dr. Chanon cannot do Whitening!
    const tuesdayWhitening = await caller.appointments.getAvailableSlots({
      serviceId: "service_whitening",
      date: "2026-09-29",
      dentistId: "dentist_chanon",
    });
    // Dentist Chanon is not eligible for whitening -> 0 eligible dentists
    expect(tuesdayWhitening.slots.length).toBe(0);

    // But Dr. Chanon CAN do Ortho and Scaling on Tuesday
    const tuesdayScaling = await caller.appointments.getAvailableSlots({
      serviceId: "service_scaling",
      date: "2026-09-29",
      dentistId: "dentist_chanon",
    });
    expect(tuesdayScaling.slots.length).toBe(20);
    expect(tuesdayScaling.slots[0]?.isAvailable).toBe(true);
  });

  it("creates appointment with PENDING status, generates #SC-YYYYMMDD-XXXX code, and immediately locks the slot", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    const bookingDate = "2026-10-02"; // Friday (Day 5)

    // 1. Create appointment
    const newApt = await caller.appointments.create({
      serviceId: "service_scaling",
      date: bookingDate,
      startTime: "10:00",
      patientName: "คุณทดสอบ จองคิว",
      patientPhone: "0891234567",
      medicalNotes: "ไม่มีโรคประจำตัว",
    });

    expect(newApt.status).toBe("PENDING");
    expect(newApt.bookingCode).toMatch(/^#SC-20261002-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
    expect(newApt.startTime).toBe("10:00");
    expect(newApt.endTime).toBe("10:30");
    expect(newApt.dentistId).toBe("dentist_may");

    // 2. Check that 10:00 is now locked (isAvailable = false) according to ADR-0001
    const checkSlots = await caller.appointments.getAvailableSlots({
      serviceId: "service_scaling",
      date: bookingDate,
    });

    const slot10 = checkSlots.slots.find((s) => s.time === "10:00");
    expect(slot10?.isAvailable).toBe(false);

    // 10:30 should still be available
    const slot1030 = checkSlots.slots.find((s) => s.time === "10:30");
    expect(slot1030?.isAvailable).toBe(true);

    // 3. Attempting to book 10:00 again must fail with conflict
    expect(
      caller.appointments.create({
        serviceId: "service_scaling",
        date: bookingDate,
        startTime: "10:00",
        patientName: "คุณจองซ้ำ",
        patientPhone: "0819998888",
      }),
    ).rejects.toThrow("ช่วงเวลานี้มีผู้จองแล้วหรือแพทย์ไม่ว่าง");
  });
});
