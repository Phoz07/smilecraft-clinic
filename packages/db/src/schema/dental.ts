import { defineRelationsPart, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dentist = sqliteTable("dentist", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  specialization: text("specialization").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const service = sqliteTable("service", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const dentistService = sqliteTable(
  "dentist_service",
  {
    id: text("id").primaryKey(),
    dentistId: text("dentist_id")
      .notNull()
      .references(() => dentist.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("dentist_service_dentist_idx").on(table.dentistId),
    index("dentist_service_service_idx").on(table.serviceId),
  ],
);

export const dutySchedule = sqliteTable(
  "duty_schedule",
  {
    id: text("id").primaryKey(),
    dentistId: text("dentist_id")
      .notNull()
      .references(() => dentist.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    startTime: text("start_time").notNull(), // "10:00"
    endTime: text("end_time").notNull(), // "20:00"
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  },
  (table) => [index("duty_schedule_dentist_idx").on(table.dentistId)],
);

export const scheduleBlock = sqliteTable(
  "schedule_block",
  {
    id: text("id").primaryKey(),
    dentistId: text("dentist_id")
      .notNull()
      .references(() => dentist.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // "YYYY-MM-DD"
    startTime: text("start_time").notNull(), // "10:00"
    endTime: text("end_time").notNull(), // "20:00"
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("schedule_block_dentist_idx").on(table.dentistId),
    index("schedule_block_date_idx").on(table.date),
  ],
);

export const appointment = sqliteTable(
  "appointment",
  {
    id: text("id").primaryKey(),
    bookingCode: text("booking_code").notNull().unique(), // e.g. "#SC-20260925-A8F2"
    patientName: text("patient_name").notNull(),
    patientPhone: text("patient_phone").notNull(),
    medicalNotes: text("medical_notes"),
    dentistId: text("dentist_id")
      .notNull()
      .references(() => dentist.id, { onDelete: "restrict" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "restrict" }),
    appointmentDate: text("appointment_date").notNull(), // "YYYY-MM-DD"
    startTime: text("start_time").notNull(), // "10:00"
    endTime: text("end_time").notNull(), // "10:30"
    status: text("status", {
      enum: ["PENDING", "CONFIRMED", "IN_TREATMENT", "COMPLETED", "CANCELLED", "NO_SHOW"],
    })
      .default("PENDING")
      .notNull(),
    internalNotes: text("internal_notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("appointment_date_idx").on(table.appointmentDate),
    index("appointment_dentist_idx").on(table.dentistId),
    index("appointment_phone_idx").on(table.patientPhone),
    index("appointment_booking_code_idx").on(table.bookingCode),
  ],
);

export const dentalRelations = defineRelationsPart(
  {
    dentist,
    service,
    dentistService,
    dutySchedule,
    scheduleBlock,
    appointment,
  },
  (r) => ({
    dentist: {
      services: r.many.dentistService({
        from: r.dentist.id,
        to: r.dentistService.dentistId,
      }),
      dutySchedules: r.many.dutySchedule({
        from: r.dentist.id,
        to: r.dutySchedule.dentistId,
      }),
      scheduleBlocks: r.many.scheduleBlock({
        from: r.dentist.id,
        to: r.scheduleBlock.dentistId,
      }),
      appointments: r.many.appointment({
        from: r.dentist.id,
        to: r.appointment.dentistId,
      }),
    },
    service: {
      dentists: r.many.dentistService({
        from: r.service.id,
        to: r.dentistService.serviceId,
      }),
      appointments: r.many.appointment({
        from: r.service.id,
        to: r.appointment.serviceId,
      }),
    },
    dentistService: {
      dentist: r.one.dentist({
        from: r.dentistService.dentistId,
        to: r.dentist.id,
      }),
      service: r.one.service({
        from: r.dentistService.serviceId,
        to: r.service.id,
      }),
    },
    dutySchedule: {
      dentist: r.one.dentist({
        from: r.dutySchedule.dentistId,
        to: r.dentist.id,
      }),
    },
    scheduleBlock: {
      dentist: r.one.dentist({
        from: r.scheduleBlock.dentistId,
        to: r.dentist.id,
      }),
    },
    appointment: {
      dentist: r.one.dentist({
        from: r.appointment.dentistId,
        to: r.dentist.id,
      }),
      service: r.one.service({
        from: r.appointment.serviceId,
        to: r.service.id,
      }),
    },
  }),
);
