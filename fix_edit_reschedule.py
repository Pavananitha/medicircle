import re

filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 4. Add logic to reschedule existing schedules
save_logic_old = """      // 3. Add new schedules
      for (const time of newSchedules) {
        const sched = await MedicineService.addSchedule(id!, {
          scheduleTime: time,
          frequencyType: 'DAILY',
        });
        if (sched && sched.id) {
          await NotificationService.scheduleMedicineReminder(
            name.trim(),
            dosage.trim(),
            dosageUnit,
            time,
            sched.id
          );
        }
      }"""

save_logic_new = """      // 3. Add new schedules
      for (const time of newSchedules) {
        const sched = await MedicineService.addSchedule(id!, {
          scheduleTime: time,
          frequencyType: 'DAILY',
        });
        if (sched && sched.id) {
          await NotificationService.scheduleMedicineReminder(
            name.trim(),
            dosage.trim(),
            dosageUnit,
            time,
            sched.id
          );
        }
      }

      // 4. Update existing schedules' notifications with new medicine name/dosage
      for (const s of existingSchedules) {
        if (!deletedScheduleIds.includes(s.id)) {
          await NotificationService.cancelReminder(s.id);
          await NotificationService.scheduleMedicineReminder(
            name.trim(),
            dosage.trim(),
            dosageUnit,
            s.schedule_time,
            s.id
          );
        }
      }"""

content = content.replace(save_logic_old, save_logic_new)

with open(filepath, 'w') as f:
    f.write(content)
