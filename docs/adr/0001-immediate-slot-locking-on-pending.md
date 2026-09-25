# Immediate Slot Reservation on Pending Appointments

## Context
When patients book an appointment online at Smile Craft Dental Clinic, appointments enter a `PENDING` state awaiting clinic staff confirmation. Without immediate slot reservation, competing patients could select the same time slot before staff reviews the submission, resulting in double-booking conflicts. However, introducing automated reservation expiry requires background cron workers, adding infrastructure complexity beyond the 3-hour demo and 10-day budget scope.

## Decision
We reserve and lock the target dentist's time slot immediately upon `PENDING` creation. The slot remains occupied until either staff confirms the appointment or actively cancels it (`CANCELLED`), which immediately releases the slot back to the available pool.

## Consequences
- Guaranteed zero double-booking or race conditions without requiring payment gateways or complex distributed locking.
- Administrative staff must actively manage and triage `PENDING` appointments; stale or illegitimate bookings will occupy slots until staff marks them cancelled.
