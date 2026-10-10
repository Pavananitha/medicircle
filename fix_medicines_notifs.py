import re

filepath = 'mobile/app/(patient)/medicines.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add NotificationService import
content = content.replace("import { MedicineService } from '../../services/medicine.service';",
                          "import { MedicineService } from '../../services/medicine.service';\nimport { NotificationService } from '../../utils/notifications';")

# 2. Find the medicine that is being deleted to cancel its schedules
delete_logic_old = """  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await MedicineService.deleteMedicine(deleteTargetId);
      setDeleteTargetId(null);
      loadMedicines();
    } catch (err: any) {"""

delete_logic_new = """  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      // Find the medicine to get its schedules
      const medToDelete = medicines.find(m => m.id === deleteTargetId);
      if (medToDelete && medToDelete.schedules) {
        for (const s of medToDelete.schedules) {
          await NotificationService.cancelReminder(s.id);
        }
      }
      
      await MedicineService.deleteMedicine(deleteTargetId);
      setDeleteTargetId(null);
      loadMedicines();
    } catch (err: any) {"""

content = content.replace(delete_logic_old, delete_logic_new)

with open(filepath, 'w') as f:
    f.write(content)
