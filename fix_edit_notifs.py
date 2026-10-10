import re

filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add NotificationService import
content = content.replace("import { DatePicker } from '../../../components/DatePicker';",
                          "import { DatePicker } from '../../../components/DatePicker';\nimport { NotificationService } from '../../../utils/notifications';")

# 2. Add notification logic into the save handler
save_logic_old = """      // 2. Delete removed schedules
      for (const sId of deletedScheduleIds) {
        await MedicineService.deleteSchedule(sId);
      }

      // 3. Add new schedules
      for (const time of newSchedules) {
        await MedicineService.addSchedule(id!, {
          scheduleTime: time,
          frequencyType: 'DAILY',
        });
      }"""

save_logic_new = """      // 2. Delete removed schedules
      for (const sId of deletedScheduleIds) {
        await MedicineService.deleteSchedule(sId);
        await NotificationService.cancelReminder(sId);
      }

      // 3. Add new schedules
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

content = content.replace(save_logic_old, save_logic_new)

with open(filepath, 'w') as f:
    f.write(content)
