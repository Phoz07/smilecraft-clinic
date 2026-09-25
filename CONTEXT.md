# Dental Appointment Management

Core domain for managing patient appointments, dentist duty schedules, and dental procedure bookings at Smile Craft Dental Clinic.

## Language

**Appointment**:
A scheduled reservation for a specific patient, dentist, service, and time range.
_Avoid_: Booking, reservation, queue, session

**Patient**:
An individual seeking or receiving dental examination or treatment.
_Avoid_: Client, user, customer

**Dentist**:
A licensed dental professional on the clinic's roster who delivers clinical procedures.
_Avoid_: Doctor, provider, specialist, staff

**Service**:
A standardized clinical dental procedure or consultation with an established base price and standard duration.
_Avoid_: Treatment, procedure, operation, package

**Duty Schedule**:
The weekly schedule defining which days and operating hours a dentist is available for appointments.
_Avoid_: Shift, roster, timetable, work hours

**Schedule Block**:
An administrative override marking a dentist as unavailable for a date or specific time window.
_Avoid_: Day off, leave request, closed slot

**Time Slot**:
A discrete window of time during operating hours available for scheduling an appointment.
_Avoid_: Slot, period, booking window

**Booking Code**:
A concise, human-readable identifier assigned to an appointment used for patient tracking and verification.
_Avoid_: Reference number, ticket ID, confirmation token

**Appointment Status**:
The lifecycle stage of an appointment (`PENDING`, `CONFIRMED`, `IN_TREATMENT`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
_Avoid_: State, stage, queue status
