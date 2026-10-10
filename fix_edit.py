import re

filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';", 
                          "import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';\nimport { Ionicons } from '@expo/vector-icons';")

# 2. States
states_replace = """  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Schedule States
  const [existingSchedules, setExistingSchedules] = useState<any[]>([]);
  const [newSchedules, setNewSchedules] = useState<string[]>([]);
  const [deletedScheduleIds, setDeletedScheduleIds] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('08:00');"""

content = re.sub(r"  const \[startDate, setStartDate\] = useState\(''\);\n  const \[endDate, setEndDate\] = useState\(''\);\n  const \[notes, setNotes\] = useState\(''\);", states_replace, content)

# 3. Load Schedules
load_replace = """        setStartDate(med.start_date.split('T')[0]);
        setEndDate(med.end_date ? med.end_date.split('T')[0] : '');
        setNotes(med.notes || '');
        setExistingSchedules(med.schedules || []);"""
content = content.replace("        setStartDate(med.start_date.split('T')[0]);\n        setEndDate(med.end_date ? med.end_date.split('T')[0] : '');\n        setNotes(med.notes || '');", load_replace)

# 4. Save logic
save_logic = """    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Validation Error', 'Name and dosage are required.');
      return;
    }
    
    // Validate we have at least one schedule left
    if (existingSchedules.length - deletedScheduleIds.length + newSchedules.length === 0) {
      Alert.alert('Required', 'A medicine must have at least one scheduled time.');
      return;
    }

    setSaving(true);
    try {
      // 1. Update medicine details
      await MedicineService.updateMedicine(id!, {
        name: name.trim(),
        genericName: genericName.trim() || null,
        dosage: dosage.trim(),
        dosageUnit,
        medicineType,
        instructions: instructions.trim() || null,
        startDate,
        endDate: endDate || null,
        notes: notes.trim() || null,
      });

      // 2. Delete removed schedules
      for (const sId of deletedScheduleIds) {
        await MedicineService.deleteSchedule(sId);
      }

      // 3. Add new schedules
      for (const time of newSchedules) {
        await MedicineService.addSchedule(id!, {
          scheduleTime: time,
          frequencyType: 'DAILY',
        });
      }

      Alert.alert('Updated', 'Medicine updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);"""
content = re.sub(
    r"    if \(!name\.trim\(\) \|\| !dosage\.trim\(\)\) \{\n      Alert\.alert\('Validation Error', 'Name and dosage are required\.'\);\n      return;\n    \}\n\n    setSaving\(true\);\n    try \{\n      await MedicineService\.updateMedicine.*?router\.back\(\) \},\n      \]\);",
    save_logic,
    content,
    flags=re.DOTALL
)

# 5. UI Logic & Render
ui_logic = """  const handleAddSchedule = () => {
    // Check if it already exists
    const existsInExisting = existingSchedules.find(s => s.schedule_time.startsWith(newTime) && !deletedScheduleIds.includes(s.id));
    const existsInNew = newSchedules.includes(newTime);
    if (existsInExisting || existsInNew) {
      Alert.alert('Duplicate', 'This time is already scheduled.');
      return;
    }
    setNewSchedules([...newSchedules, newTime].sort());
  };

  const handleRemoveExisting = (scheduleId: string) => {
    setDeletedScheduleIds([...deletedScheduleIds, scheduleId]);
  };

  const handleRemoveNew = (time: string) => {
    setNewSchedules(newSchedules.filter(t => t !== time));
  };

  if (loading) {"""
content = content.replace("  if (loading) {", ui_logic)

# 6. Render UI
ui_render = """          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 16, color: Colors.textPrimary }]}>Scheduled Times</Text>
          
          <View style={styles.scheduleList}>
            {existingSchedules.filter(s => !deletedScheduleIds.includes(s.id)).map(s => {
               // Format time
               let displayTime = s.schedule_time;
               if (displayTime && displayTime.length > 5) displayTime = displayTime.substring(0, 5);
               return (
                <View key={s.id} style={styles.scheduleItem}>
                  <Ionicons name="alarm" size={20} color={Colors.primary} />
                  <Text style={styles.scheduleTimeText}>{displayTime}</Text>
                  <TouchableOpacity onPress={() => handleRemoveExisting(s.id)}>
                    <Ionicons name="close-circle" size={24} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
            
            {newSchedules.map((time, idx) => (
              <View key={`new-${idx}`} style={styles.scheduleItem}>
                <Ionicons name="alarm" size={20} color={Colors.success} />
                <Text style={styles.scheduleTimeText}>{time} (New)</Text>
                <TouchableOpacity onPress={() => handleRemoveNew(time)}>
                  <Ionicons name="close-circle" size={24} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addScheduleRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: Spacing.sm }]}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="HH:MM"
              keyboardType="numbers-and-punctuation"
            />
            <TouchableOpacity style={styles.addTimeBtn} onPress={handleAddSchedule}>
              <Text style={styles.addTimeBtnText}>Add Time</Text>
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton"""
content = content.replace("""          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        <PrimaryButton""", ui_render)

# 7. Styles
styles = """  row: {
    flexDirection: 'row',
  },
  scheduleList: {
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleTimeText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  addScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addTimeBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  addTimeBtnText: {
    ...Typography.button,
    color: Colors.primaryDark,
    fontSize: 14,
  },
});"""
content = content.replace("""  row: {
    flexDirection: 'row',
  },
});""", styles)

with open(filepath, 'w') as f:
    f.write(content)
