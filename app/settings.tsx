import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const { farmId } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    shiftReminders: true,
    volunteerUpdates: true,
    donationAlerts: false,
    weeklyReports: true,
  });

  const [farmInfo, setFarmInfo] = useState({
    name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function fetchFarm() {
    setLoading(true);
    const { data } = await supabase.from('farms').select('*').eq('id', farmId).single();
    if (data) {
      setFarmInfo({
        name: data.name ?? '',
        owner_name: data.owner_name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
      });
    }
    setLoading(false);
  }

  useEffect(() => { fetchFarm(); }, [farmId]);

  async function handleSaveProfile() {
    setSaving(true);
    const { error } = await supabase.from('farms').update(farmInfo).eq('id', farmId);
    setSaving(false);
    setShowSaveModal(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Farm Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Farm Name</Text>
          <TextInput style={styles.textInput} value={farmInfo.name} onChangeText={t => setFarmInfo({ ...farmInfo, name: t })} placeholder="Enter farm name" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Owner Name</Text>
          <TextInput style={styles.textInput} value={farmInfo.owner_name} onChangeText={t => setFarmInfo({ ...farmInfo, owner_name: t })} placeholder="Enter owner name" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.textInput} value={farmInfo.email} onChangeText={t => setFarmInfo({ ...farmInfo, email: t })} placeholder="Enter email address" keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput style={styles.textInput} value={farmInfo.phone} onChangeText={t => setFarmInfo({ ...farmInfo, phone: t })} placeholder="Enter phone number" keyboardType="phone-pad" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput style={[styles.textInput, styles.textArea]} value={farmInfo.address} onChangeText={t => setFarmInfo({ ...farmInfo, address: t })} placeholder="Enter farm address" multiline numberOfLines={3} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
          <Text style={styles.saveButtonText}>Save Profile Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>

        {[
          { key: 'shiftReminders' as const, title: 'Shift Reminders', subtitle: 'Get notified about upcoming volunteer shifts' },
          { key: 'volunteerUpdates' as const, title: 'Volunteer Updates', subtitle: 'When volunteers sign up or cancel shifts' },
          { key: 'donationAlerts' as const, title: 'Donation Alerts', subtitle: 'Updates about donation center capacity' },
          { key: 'weeklyReports' as const, title: 'Weekly Reports', subtitle: 'Summary of weekly farm activity' },
        ].map(item => (
          <View key={item.key} style={styles.notificationItem}>
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
            </View>
            <Switch
              value={notifications[item.key]}
              onValueChange={() => toggleNotification(item.key)}
              trackColor={{ false: "#E8F3EC", true: "#3C6E47" }}
              thumbColor={notifications[item.key] ? "#fff" : "#f4f3f4"}
            />
          </View>
        ))}
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        {[
          { title: 'Default Shift Duration', value: '4 hours' },
          { title: 'Measurement Units', value: 'Pounds (lbs)' },
          { title: 'Time Format', value: '12-hour' },
          { title: 'Language', value: 'English' },
        ].map(item => (
          <TouchableOpacity key={item.title} style={styles.preferenceItem}>
            <Text style={styles.preferenceTitle}>{item.title}</Text>
            <View style={styles.preferenceValue}>
              <Text style={styles.preferenceValueText}>{item.value}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        {[
          { title: 'Export My Data', subtitle: 'Download all your farm data' },
          { title: 'Privacy Policy', subtitle: 'Read our privacy policy' },
          { title: 'Terms of Service', subtitle: 'View terms and conditions' },
        ].map(item => (
          <TouchableOpacity key={item.title} style={styles.actionItem}>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account */}
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

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionTitle}>Contact Support</Text>
          <Text style={styles.actionSubtitle}>Get help with the app</Text>
        </TouchableOpacity>
      </View>

      {/* Save confirmation modal */}
      <Modal visible={showSaveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Profile</Text>
            <Text style={styles.detailRow}>Your farm profile will be updated in the database.</Text>
            <View style={[styles.modalActions, { marginTop: 12 }]}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowSaveModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { flex: 1, marginLeft: 8 }]} onPress={handleSaveProfile} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete account modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.detailRow}>This will permanently delete your account and data. This action cannot be undone.</Text>
            <View style={[styles.modalActions, { marginTop: 12 }]}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1, borderColor: '#E74C3C', marginLeft: 8 }]} onPress={() => setShowDeleteModal(false)}>
                <Text style={[styles.secondaryButtonText, { color: '#E74C3C' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6", padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#2C4C3B", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: "#2C4C3B", marginBottom: 6 },
  textInput: { borderWidth: 1, borderColor: "#E8F3EC", borderRadius: 8, padding: 12, fontSize: 16, color: "#2C4C3B", backgroundColor: "#FAF9F6" },
  textArea: { height: 80, textAlignVertical: "top" },
  saveButton: { backgroundColor: "#3C6E47", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  notificationItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  notificationText: { flex: 1, marginRight: 16 },
  notificationTitle: { fontSize: 16, fontWeight: "500", color: "#2C4C3B", marginBottom: 2 },
  notificationSubtitle: { fontSize: 14, color: "#66785F" },
  preferenceItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  preferenceTitle: { fontSize: 16, fontWeight: "500", color: "#2C4C3B" },
  preferenceValue: { flexDirection: "row", alignItems: "center" },
  preferenceValueText: { fontSize: 14, color: "#66785F", marginRight: 8 },
  chevron: { fontSize: 18, color: "#BDC3C7" },
  actionItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  actionTitle: { fontSize: 16, fontWeight: "500", color: "#2C4C3B", marginBottom: 2 },
  actionSubtitle: { fontSize: 14, color: "#66785F" },
  dangerItem: { borderBottomWidth: 0 },
  dangerText: { color: "#E74C3C" },
  infoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  infoLabel: { fontSize: 16, fontWeight: "500", color: "#2C4C3B" },
  infoValue: { fontSize: 14, color: "#66785F" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 8 },
  detailRow: { fontSize: 14, color: '#444', marginBottom: 8 },
  modalActions: { flexDirection: 'row' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3C6E47', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 14 },
});
