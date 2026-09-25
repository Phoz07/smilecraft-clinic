import { describe, expect, it } from "bun:test";
import { createTestDb } from "@smilecraft-clinic/db";
import { appRouter } from "../src/routers/index";

describe("Ticket 3: Digital Appointment Pass & Patient Status Lookup", () => {
  it("retrieves appointment when phone and booking code match", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // From seed: apt_demo_02 has phone "0898765432" and code "#SC-20260925-K8M4"
    const apt = await caller.appointments.lookup({
      phone: "0898765432",
      bookingCode: "#SC-20260925-K8M4",
    });

    expect(apt).toBeDefined();
    expect(apt.patientName).toBe("คุณกัญญา พรทิพย์");
    expect(apt.status).toBe("CONFIRMED");
    expect(apt.medicalNotes).toContain("แพ้ยาเพนิซิลลิน");
    expect(apt.dentist?.name).toContain("ทพญ. เมย์");
    expect(apt.service?.name).toContain("ฟอกสีฟัน");
  });

  it("handles case-insensitivity on booking code", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    const apt = await caller.appointments.lookup({
      phone: "0898765432",
      bookingCode: "#sc-20260925-k8m4", // lowercase
    });

    expect(apt).toBeDefined();
    expect(apt.patientName).toBe("คุณกัญญา พรทิพย์");
  });

  it("rejects mismatched phone or invalid booking code", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });
    await caller.demo.reset();

    // Correct code, wrong phone
    expect(
      caller.appointments.lookup({
        phone: "0819999999",
        bookingCode: "#SC-20260925-K8M4",
      }),
    ).rejects.toThrow("ไม่พบข้อมูลการนัดหมาย");

    // Non-existent code
    expect(
      caller.appointments.lookup({
        phone: "0898765432",
        bookingCode: "#SC-20260925-9999",
      }),
    ).rejects.toThrow("ไม่พบข้อมูลการนัดหมาย");
  });
});
