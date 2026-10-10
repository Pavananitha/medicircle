filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_row = """          <View style={styles.addScheduleRow}>
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
          </View>"""

new_row = """          <View style={[styles.addScheduleRow, { alignItems: 'flex-end', gap: Spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <TimePicker
                label="Pick Schedule Time"
                value={newTime}
                onChange={setNewTime}
              />
            </View>
            <TouchableOpacity style={[styles.addTimeBtn, { backgroundColor: Colors.primary, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }]} onPress={handleAddSchedule}>
              <Ionicons name="add" size={24} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>"""

content = content.replace(old_row, new_row)

with open(filepath, 'w') as f:
    f.write(content)
