import re

filepath = 'mobile/app/(caregiver)/home.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add MedicationLog and Date imports
content = content.replace("import { CaregiverConnection } from '../../types';", 
                          "import { CaregiverConnection, MedicationLog } from '../../types';\nimport { formatTime } from '../../utils/date';")

# 2. Add state for daily tasks
state_old = """  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [refreshing, setRefreshing] = useState(false);"""

state_new = """  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [dailyTasks, setDailyTasks] = useState<(MedicationLog & { patientName: string })[]>([]);
  const [refreshing, setRefreshing] = useState(false);"""
content = content.replace(state_old, state_new)

# 3. Add fetch logic for daily tasks
fetch_old = """  const loadData = async () => {
    try {
      const data = await CaregiverService.getConnections();
      setConnections(data);
    } catch (e) {
      console.warn(e);
    }
  };"""

fetch_new = """  const loadData = async () => {
    try {
      const data = await CaregiverService.getConnections();
      setConnections(data);
      
      const activeConns = data.filter(c => c.status === 'ACTIVE');
      let allTasks: (MedicationLog & { patientName: string })[] = [];
      
      for (const conn of activeConns) {
        // Fetch history for days=0 (today only)
        const hist = await CaregiverService.getPatientHistory(conn.patient_id, 0);
        // Only keep PENDING or SKIPPED
        const pendingOrSkipped = hist.filter(h => h.status === 'PENDING' || h.status === 'SKIPPED' || h.status === 'MISSED');
        
        pendingOrSkipped.forEach(t => {
          allTasks.push({ ...t, patientName: conn.patient.name });
        });
      }
      
      // Sort by scheduled time
      allTasks.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
      setDailyTasks(allTasks);
      
    } catch (e) {
      console.warn(e);
    }
  };"""
content = content.replace(fetch_old, fetch_new)

# 4. Render daily tasks
render_old = """        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionBox}
            onPress={() => router.push('/(caregiver)/patients')}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.secondaryLight }]}>
              <Ionicons name="people" size={28} color={Colors.secondary} />
            </View>
            <Text style={styles.actionBoxText}>View Patients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBox}
            onPress={() => router.push('/(caregiver)/alerts')}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="notifications" size={28} color="#DC2626" />
            </View>
            <Text style={styles.actionBoxText}>Recent Alerts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Navigate to the Patients tab below to connect with a new patient using their 6-digit access code, or tap View on a connected patient to see their adherence history and schedules.
          </Text>
        </View>

      </ScrollView>"""

render_new = """        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionBox}
            onPress={() => router.push('/(caregiver)/patients')}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.secondaryLight }]}>
              <Ionicons name="people" size={28} color={Colors.secondary} />
            </View>
            <Text style={styles.actionBoxText}>View Patients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBox}
            onPress={() => router.push('/(caregiver)/alerts')}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="notifications" size={28} color="#DC2626" />
            </View>
            <Text style={styles.actionBoxText}>Recent Alerts</Text>
          </TouchableOpacity>
        </View>
        
        {activePatients.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Action Required Today</Text>
            {dailyTasks.length === 0 ? (
              <View style={styles.infoBox}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
                <Text style={styles.infoText}>
                  All patients are completely up to date with their medications for today!
                </Text>
              </View>
            ) : (
              dailyTasks.map(task => {
                const isSkipped = task.status === 'SKIPPED' || task.status === 'MISSED';
                return (
                  <View key={task.id} style={[styles.taskCard, isSkipped && styles.taskCardSkipped]}>
                    <View style={styles.taskTop}>
                      <View style={styles.timePill}>
                        <Ionicons name="time" size={14} color={Colors.primaryDark} />
                        <Text style={styles.timePillText}>{formatTime(task.scheduled_time)}</Text>
                      </View>
                      <View style={[styles.statusBadge, isSkipped && styles.statusBadgeSkipped]}>
                        <Text style={[styles.statusText, isSkipped && styles.statusTextSkipped]}>
                          {task.status}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.taskPatient}>{task.patientName}</Text>
                    <Text style={styles.taskMedicine}>{task.medicine?.name} ({task.medicine?.dosage} {task.medicine?.dosage_unit})</Text>
                  </View>
                );
              })
            )}
          </>
        )}

      </ScrollView>"""
content = content.replace(render_old, render_new)

# 5. Add styles
styles = """  infoText: {
    flex: 1,
    ...Typography.caption,
    color: "#0F766E",
    lineHeight: 20,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  taskCardSkipped: {
    borderLeftColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  timePillText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeSkipped: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  statusTextSkipped: {
    color: '#B91C1C',
  },
  taskPatient: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 2,
  },
  taskMedicine: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
});"""

content = content.replace("""  infoText: {
    flex: 1,
    ...Typography.caption,
    color: "#0F766E",
    lineHeight: 20,
  },
});""", styles)

with open(filepath, 'w') as f:
    f.write(content)
