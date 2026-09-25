import { describe, expect, it } from "bun:test";
import { createTestDb } from "@smilecraft-clinic/db";
import { appRouter } from "../src/routers/index";

describe("Ticket 5: Admin Reschedule Dialog & Duty Schedule Leave Management with Collision Alerts", () => {
  it("reschedules appointment to new date/time with conflict validation and audit note", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // apt_demo_03 is originally on 2026-09-25 at 16:30 - 17:00 (Scaling, Dr. May)
    // 1. Reschedule to tomorrow 2026-09-26 at 15:00
    const res = await caller.appointments.reschedule({
      id: "apt_demo_03",
      newDate: "2026-09-26",
      newStartTime: "15:00",
    });

    expect(res.success).toBe(true);
    expect(res.newDate).toBe("2026-09-26");
    expect(res.newStartTime).toBe("15:00");

    // Verify appointment was updated
    const updated = await caller.appointments.lookup({
      phone: "0865551234",
      bookingCode: "#SC-20260925-P7R9",
    });

    expect(updated.appointmentDate).toBe("2026-09-26");
    expect(updated.startTime).toBe("15:00");
    expect(updated.endTime).toBe("15:30");
    expect(updated.status).toBe("CONFIRMED"); // Auto-promoted to confirmed
    expect(updated.internalNotes).toContain("เลื่อนนัดจาก 2026-09-25");

    // 2. The old slot 16:30 on 2026-09-25 should now be available!
    const slotsOldDay = await caller.appointments.getAvailableSlots({
      serviceId: "service_scaling",
      date: "2026-09-25",
      dentistId: "dentist_may",
    });
    const slot1630 = slotsOldDay.slots.find((s) => s.time === "16:30");
    expect(slot1630?.isAvailable).toBe(true);

    // 3. Attempting to reschedule to an already booked slot (apt_demo_04 is 2026-09-26 at 11:00-12:00)
    expect(
      caller.appointments.reschedule({
        id: "apt_demo_03",
        newDate: "2026-09-26",
        newStartTime: "11:00",
      }),
    ).rejects.toThrow("ช่วงเวลาใหม่ที่เลือกมีผู้จองแล้ว");
  });

  it("applies soft block for doctor leaves and flags collision warning (ADR-0002)", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // In seed, apt_demo_02 is on 2026-09-25 at 14:00 - 15:00 with Dr. May
    // Admin records a leave / schedule block for Dr. May from 13:00 to 16:00
    const blockRes = await caller.appointments.addScheduleBlock({
      dentistId: "dentist_may",
      date: "2026-09-25",
      startTime: "13:00",
      endTime: "16:00",
      reason: "ติดบรรยายวิชาการทันตแพทย์",
    });
    expect(blockRes.success).toBe(true);

    // 1. Check adminList: apt_demo_02 MUST be flagged with hasScheduleBlockCollision (and hasLeaveCollision): true!
    const adminAppointments = await caller.appointments.adminList({
      date: "2026-09-25",
    });

    const apt02 = adminAppointments.find((a) => a.id === "apt_demo_02");
    expect(apt02?.hasScheduleBlockCollision).toBe(true);
    expect(apt02?.hasLeaveCollision).toBe(true);

    // apt_demo_01 at 10:30 is NOT overlapping with the 13:00-16:00 block
    const apt01 = adminAppointments.find((a) => a.id === "apt_demo_01");
    expect(apt01?.hasScheduleBlockCollision).toBe(false);
    expect(apt01?.hasLeaveCollision).toBe(false);

    // 2. Check public getAvailableSlots: 13:00 - 16:00 slots must now be BLOCKED
    const slots = await caller.appointments.getAvailableSlots({
      serviceId: "service_whitening",
      date: "2026-09-25",
      dentistId: "dentist_may",
    });

    const slot1330 = slots.slots.find((s) => s.time === "13:30");
    expect(slot1330?.isAvailable).toBe(false);

    const slot1500 = slots.slots.find((s) => s.time === "15:00");
    expect(slot1500?.isAvailable).toBe(false);

    // Slot 17:00 (after block) should still be available
    const slot1700 = slots.slots.find((s) => s.time === "17:00");
    expect(slot1700?.isAvailable).toBe(true);

    // 3. Strict Reschedule Validation: Reject reschedule if dentist is off-duty
    // Dr. May works Mon(1), Wed(3), Fri(5), Sat(6). Tuesday 2026-09-29 is off-duty!
    await expect(
      caller.appointments.reschedule({
        id: "apt_demo_01",
        newDate: "2026-09-29", // Tuesday
        newStartTime: "10:30",
      }),
    ).rejects.toThrow("ทันตแพทย์ไม่ได้เข้าเวรในวันหรือช่วงเวลาดังกล่าว");

    // 4. Strict Reschedule Validation: Reject reschedule if overlapping with Schedule Block
    // Dr. May has a schedule block from 13:00 to 16:00 on 2026-09-25
    await expect(
      caller.appointments.reschedule({
        id: "apt_demo_01",
        newDate: "2026-09-25",
        newStartTime: "14:00",
      }),
    ).rejects.toThrow("ช่วงเวลาใหม่ที่เลือกตรงกับช่วงเวลาที่ทันตแพทย์ติดภารกิจลา");
  });
});
