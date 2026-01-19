import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    shiftReminders: true,
    volunteerUpdates: true,
    donationAlerts: false,
    weeklyReports: true,
  });

  const [farmInfo, setFarmInfo] = useState({
    farmName: "Green Valley Farm",
    ownerName: "John Smith",
    email: "john@greenvalley.com",
    phone: "(555) 123-4567",
    address: "1234 Farm Road, Valley County",
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Farm Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Profile</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Farm Name</Text>
          <TextInput
            style={styles.textInput}
            value={farmInfo.farmName}
            onChangeText={(text) => setFarmInfo({...farmInfo, farmName: text})}
            placeholder="Enter farm name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Owner Name</Text>
          <TextInput
            style={styles.textInput}
            value={farmInfo.ownerName}
            onChangeText={(text) => setFarmInfo({...farmInfo, ownerName: text})}
            placeholder="Enter owner name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={farmInfo.email}
            onChangeText={(text) => setFarmInfo({...farmInfo, email: text})}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.textInput}
            value={farmInfo.phone}
            onChangeText={(text) => setFarmInfo({...farmInfo, phone: text})}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={farmInfo.address}
            onChangeText={(text) => setFarmInfo({...farmInfo, address: text})}
            placeholder="Enter farm address"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
          <Text style={styles.saveButtonText}>Save Profile Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        <View style={styles.notificationItem}>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>Shift Reminders</Text>
            <Text style={styles.notificationSubtitle}>Get notified about upcoming volunteer shifts</Text>
          </View>
          <Switch
            value={notifications.shiftReminders}
            onValueChange={() => toggleNotification('shiftReminders')}
            trackColor={{ false: "#E8F3EC", true: "#3C6E47" }}
            thumbColor={notifications.shiftReminders ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>Volunteer Updates</Text>
            <Text style={styles.notificationSubtitle}>When volunteers sign up or cancel shifts</Text>
          </View>
          <Switch
            value={notifications.volunteerUpdates}
            onValueChange={() => toggleNotification('volunteerUpdates')}
            trackColor={{ false: "#E8F3EC", true: "#3C6E47" }}
            thumbColor={notifications.volunteerUpdates ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>Donation Alerts</Text>
            <Text style={styles.notificationSubtitle}>Updates about donation center capacity</Text>
          </View>
          <Switch
            value={notifications.donationAlerts}
            onValueChange={() => toggleNotification('donationAlerts')}
            trackColor={{ false: "#E8F3EC", true: "#3C6E47" }}
            thumbColor={notifications.donationAlerts ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>Weekly Reports</Text>
            <Text style={styles.notificationSubtitle}>Summary of weekly farm activity</Text>
          </View>
          <Switch
            value={notifications.weeklyReports}
            onValueChange={() => toggleNotification('weeklyReports')}
            trackColor={{ false: "#E8F3EC", true: "#3C6E47" }}
            thumbColor={notifications.weeklyReports ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <TouchableOpacity style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Default Shift Duration</Text>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceValueText}>4 hours</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Measurement Units</Text>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceValueText}>Pounds (lbs)</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Time Format</Text>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceValueText}>12-hour</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <Text style={styles.preferenceTitle}>Language</Text>
          <View style={styles.preferenceValue}>
            <Text style={styles.preferenceValueText}>English</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Export My Data</Text>
          <Text style={styles.actionSubtitle}>Download all your farm data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Privacy Policy</Text>
          <Text style={styles.actionSubtitle}>Read our privacy policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Terms of Service</Text>
          <Text style={styles.actionSubtitle}>View terms and conditions</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Change Password</Text>
          <Text style={styles.actionSubtitle}>Update your account password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Backup Data</Text>
          <Text style={styles.actionSubtitle}>Create a backup of your farm data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, styles.dangerItem]} onPress={() => setShowDeleteModal(true)}>
          <Text style={[styles.actionTitle, styles.dangerText]}>Delete Account</Text>
          <Text style={styles.actionSubtitle}>Permanently delete your account</Text>
        </TouchableOpacity>
      </View>
      {/* Save confirmation modal */}
      <Modal visible={showSaveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Profile</Text>
            <Text style={styles.detailRow}>Your farm profile will be updated.
              {/* TODO: call PUT /api/farm/profile with farmInfo payload */}
            </Text>
            <View style={[styles.modalActions, { marginTop: 12 }]}> 
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowSaveModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { flex: 1, marginLeft: 8 }]} onPress={() => {
                // TODO: await api.put('/farm/profile', farmInfo)
                setShowSaveModal(false);
              }}>
                <Text style={styles.saveButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete account confirmation modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.detailRow}>This will permanently delete your account and data. This action cannot be undone.</Text>
            <Text style={{ color: '#66785F' }}>{/* TODO: call DELETE /api/account when confirmed */}</Text>
            <View style={[styles.modalActions, { marginTop: 12 }]}> 
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.preferenceValue, { flex: 1, justifyContent: 'center', marginLeft: 8 }]} onPress={() => {
                // TODO: await api.delete('/account')
                setShowDeleteModal(false);
              }}>
                <Text style={[styles.preferenceValueText, { color: '#E74C3C', fontWeight: '700' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>October 2025</Text>
        </View>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Contact Support</Text>
          <Text style={styles.actionSubtitle}>Get help with the app</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Rate This App</Text>
          <Text style={styles.actionSubtitle}>Share your feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 16,
  },
  
  // Form inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C4C3B",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E8F3EC",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2C4C3B",
    backgroundColor: "#FAF9F6",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#3C6E47",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Notifications
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  notificationText: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: "#66785F",
  },

  // Preferences
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
  },
  preferenceValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  preferenceValueText: {
    fontSize: 14,
    color: "#66785F",
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: "#BDC3C7",
  },

  // Action items
  actionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#66785F",
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: "#E74C3C",
  },

  // Info items
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
  },
  infoValue: {
    fontSize: 14,
    color: "#66785F",
  },
  /* Modal & button styles used by confirmation dialogs */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C4C3B',
    marginBottom: 8,
  },
  detailRow: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3C6E47',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3C6E47',
    fontWeight: '600',
    fontSize: 14,
  },
});