import { describe, expect, it } from "bun:test";
import { createTestDb } from "@smilecraft-clinic/db";
import { appRouter } from "../src/routers/index";

describe("Ticket 1: Baseline Domain Foundation & Demo Seed Environment", () => {
  it("resets and seeds initial clinic data via tRPC seam", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });

    // Execute reset mutation
    const resetResult = await caller.demo.reset();
    expect(resetResult.success).toBe(true);
    expect(resetResult.dentistsCount).toBe(2);
    expect(resetResult.servicesCount).toBe(4);
    expect(resetResult.appointmentsCount).toBe(5);

    // Verify dentists list
    const dentists = await caller.dentists.list();
    expect(dentists.length).toBe(2);

    const may = dentists.find((d) => d.id === "dentist_may");
    expect(may).toBeDefined();
    expect(may?.name).toContain("ทพญ. เมย์");
    expect(may?.services.length).toBe(2); // Scaling & Whitening
    expect(may?.dutySchedules.length).toBe(4); // Mon, Wed, Fri, Sat

    const chanon = dentists.find((d) => d.id === "dentist_chanon");
    expect(chanon).toBeDefined();
    expect(chanon?.name).toContain("ทพ. ชนน");
    expect(chanon?.services.length).toBe(3); // Scaling, Ortho Consult, Ortho Appliance
    expect(chanon?.dutySchedules.length).toBe(3); // Tue, Thu, Sun

    // Verify services list
    const services = await caller.services.list();
    expect(services.length).toBe(4);
    const scaling = services.find((s) => s.id === "service_scaling");
    expect(scaling?.durationMinutes).toBe(30);
    expect(scaling?.price).toBe(900);

    const whitening = services.find((s) => s.id === "service_whitening");
    expect(whitening?.durationMinutes).toBe(60);
    expect(whitening?.price).toBe(3500);
  });

  it("is idempotent when called repeatedly", async () => {
    const db = await createTestDb();
    const caller = appRouter.createCaller({ db, session: null });

    await caller.demo.reset();
    const secondReset = await caller.demo.reset();
    expect(secondReset.success).toBe(true);

    const dentists = await caller.dentists.list();
    expect(dentists.length).toBe(2);
  });
});
