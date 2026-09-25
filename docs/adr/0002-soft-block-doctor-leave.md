# Soft Block for Doctor Leaves with Collision Alerts

## Context
When a clinic administrator marks a dentist as on leave or blocks a schedule window, existing confirmed or pending patient appointments may already occupy those slots. If the system enforced a hard block (preventing the leave from being recorded until all appointments were cancelled or moved), emergency leaves or urgent schedule changes would be blocked. If the system automatically cancelled those appointments, patients would receive sudden disruptions without prior coordination.

## Decision
We implement a soft block policy:
1. Recording a schedule block immediately prevents any new public appointments for the affected dentist and time range.
2. Existing appointments on that date remain active but are immediately highlighted on the Admin Dashboard with an urgent warning badge (`⚠️ แพทย์ติดภารกิจลา / กรุณาติดต่อเลื่อนนัด`).
3. Reception staff can view the patient contact details directly and use the integrated Reschedule modal to coordinate a mutually agreeable alternative slot.

## Consequences
- Immediate protection against new incoming bookings during dentist absences.
- Clinic reception maintains full personal care and communication with affected patients without technical friction.
