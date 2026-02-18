import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Center = { id: string; name: string };

export default function RoleSetup() {
  const router = useRouter();
  const { refreshProfiles } = useApp();

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [farmerForm, setFarmerForm] = useState({ farmName: '', ownerName: '' });
  const [volunteerForm, setVolunteerForm] = useState({ volunteerName: '', phone: '' });
  const [centerMode, setCenterMode] = useState<'join' | 'create'>('join');
  const [centerForm, setCenterForm] = useState({ selectedCenterId: '' });
  const [newCenterForm, setNewCenterForm] = useState({ name: '', address: '', phone: '', email: '' });
  const [centers, setCenters] = useState<Center[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('donation_centers').select('id, name').then(({ data }) => {
      if (data) setCenters(data);
    });
  }, []);

  function toggleRole(role: string) {
    setSelectedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }

  async function handleComplete() {
    if (selectedRoles.size === 0) {
      Alert.alert('Select a role', 'Please select at least one role to continue.');
      return;
    }
    // Get session directly — context may not have updated yet when this screen first renders
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const userId = currentSession?.user?.id;
    if (!userId) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }

    setSaving(true);
    try {
      for (const role of selectedRoles) {
        if (role === 'farmer') {
          if (!farmerForm.farmName.trim()) {
            Alert.alert('Missing info', 'Please enter your farm name.');
            setSaving(false);
            return;
          }
          const { data: farm, error: farmError } = await supabase
            .from('farms')
            .insert({ name: farmerForm.farmName.trim(), owner_name: farmerForm.ownerName.trim(), user_id: userId })
            .select('id')
            .single();
          if (farmError || !farm) {
            Alert.alert('Error', 'Failed to create farm. Please try again.');
            setSaving(false);
            return;
          }
          await supabase.from('user_profiles').insert({
            user_id: userId,
            role: 'farmer',
            farm_id: farm.id,
          });
        }

        if (role === 'volunteer') {
          if (!volunteerForm.volunteerName.trim()) {
            Alert.alert('Missing info', 'Please enter your volunteer name.');
            setSaving(false);
            return;
          }
          await supabase.from('user_profiles').insert({
            user_id: userId,
            role: 'volunteer',
            volunteer_name: volunteerForm.volunteerName.trim(),
            phone: volunteerForm.phone.trim() || null,
          });
        }

        if (role === 'center') {
          let centerId: string;
          if (centerMode === 'create') {
            if (!newCenterForm.name.trim()) {
              Alert.alert('Missing info', 'Please enter your center name.');
              setSaving(false);
              return;
            }
            const { data: newCenter, error: centerError } = await supabase
              .from('donation_centers')
              .insert({
                name: newCenterForm.name.trim(),
                address: newCenterForm.address.trim() || null,
                phone: newCenterForm.phone.trim() || null,
                email: newCenterForm.email.trim() || null,
              })
              .select('id')
              .single();
            if (centerError || !newCenter) {
              Alert.alert('Error', 'Failed to create donation center. Please try again.');
              setSaving(false);
              return;
            }
            centerId = newCenter.id;
          } else {
            if (!centerForm.selectedCenterId) {
              Alert.alert('Missing info', 'Please select a donation center.');
              setSaving(false);
              return;
            }
            centerId = centerForm.selectedCenterId;
          }
          await supabase.from('user_profiles').insert({
            user_id: userId,
            role: 'center',
            center_id: centerId,
          });
        }
      }

      await refreshProfiles();
      router.replace('/home');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>FruitNut</Text>
        <Text style={styles.heading}>Set Up Your Roles</Text>
        <Text style={styles.subheading}>You can select multiple roles and switch between them later.</Text>

        {/* Role toggle buttons */}
        <View style={styles.roleRow}>
          {(['farmer', 'volunteer', 'center'] as const).map(role => (
            <TouchableOpacity
              key={role}
              style={[styles.roleToggle, selectedRoles.has(role) && styles.roleToggleActive]}
              onPress={() => toggleRole(role)}
            >
              <Text style={[styles.roleToggleText, selectedRoles.has(role) && styles.roleToggleTextActive]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Farmer form */}
        {selectedRoles.has('farmer') && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Farmer Details</Text>
            <Text style={styles.label}>Farm Name *</Text>
            <TextInput
              style={styles.input}
              value={farmerForm.farmName}
              onChangeText={t => setFarmerForm({ ...farmerForm, farmName: t })}
              placeholder="e.g. Sunny Acres Farm"
              placeholderTextColor="#B0BDB7"
            />
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={styles.input}
              value={farmerForm.ownerName}
              onChangeText={t => setFarmerForm({ ...farmerForm, ownerName: t })}
              placeholder="Your full name"
              placeholderTextColor="#B0BDB7"
            />
          </View>
        )}

        {/* Volunteer form */}
        {selectedRoles.has('volunteer') && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Volunteer Details</Text>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              value={volunteerForm.volunteerName}
              onChangeText={t => setVolunteerForm({ ...volunteerForm, volunteerName: t })}
              placeholder="e.g. Jane Smith"
              placeholderTextColor="#B0BDB7"
            />
            <Text style={styles.label}>Phone (optional)</Text>
            <TextInput
              style={styles.input}
              value={volunteerForm.phone}
              onChangeText={t => setVolunteerForm({ ...volunteerForm, phone: t })}
              placeholder="e.g. 555-0100"
              placeholderTextColor="#B0BDB7"
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Center form */}
        {selectedRoles.has('center') && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Donation Center</Text>

            {/* Join / Create toggle */}
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeToggle, centerMode === 'join' && styles.modeToggleActive]}
                onPress={() => setCenterMode('join')}
              >
                <Text style={[styles.modeToggleText, centerMode === 'join' && styles.modeToggleTextActive]}>
                  Join Existing
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeToggle, centerMode === 'create' && styles.modeToggleActive]}
                onPress={() => setCenterMode('create')}
              >
                <Text style={[styles.modeToggleText, centerMode === 'create' && styles.modeToggleTextActive]}>
                  Register New
                </Text>
              </TouchableOpacity>
            </View>

            {centerMode === 'join' ? (
              <>
                <Text style={styles.label}>Select your center *</Text>
                {centers.length === 0 ? (
                  <ActivityIndicator color="#3C6E47" style={{ marginVertical: 12 }} />
                ) : (
                  centers.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.centerOption, centerForm.selectedCenterId === c.id && styles.centerOptionActive]}
                      onPress={() => setCenterForm({ selectedCenterId: c.id })}
                    >
                      <Text style={[styles.centerOptionText, centerForm.selectedCenterId === c.id && styles.centerOptionTextActive]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </>
            ) : (
              <>
                <Text style={styles.label}>Center Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newCenterForm.name}
                  onChangeText={t => setNewCenterForm({ ...newCenterForm, name: t })}
                  placeholder="e.g. Westside Food Bank"
                  placeholderTextColor="#B0BDB7"
                />
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={newCenterForm.address}
                  onChangeText={t => setNewCenterForm({ ...newCenterForm, address: t })}
                  placeholder="Street address"
                  placeholderTextColor="#B0BDB7"
                />
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={newCenterForm.phone}
                  onChangeText={t => setNewCenterForm({ ...newCenterForm, phone: t })}
                  placeholder="e.g. 555-0100"
                  placeholderTextColor="#B0BDB7"
                  keyboardType="phone-pad"
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newCenterForm.email}
                  onChangeText={t => setNewCenterForm({ ...newCenterForm, email: t })}
                  placeholder="contact@center.org"
                  placeholderTextColor="#B0BDB7"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={handleComplete} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9F6', paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40 },
  appName: { fontSize: 28, fontWeight: '800', color: '#2C4C3B', marginBottom: 4 },
  heading: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 6 },
  subheading: { fontSize: 14, color: '#66785F', marginBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleToggle: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E8F3EC', alignItems: 'center', backgroundColor: '#fff' },
  roleToggleActive: { backgroundColor: '#3C6E47', borderColor: '#3C6E47' },
  roleToggleText: { fontWeight: '600', color: '#66785F', fontSize: 14 },
  roleToggleTextActive: { color: '#fff' },
  formSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#2C4C3B', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '500', color: '#2C4C3B', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 12, backgroundColor: '#FAF9F6', color: '#2C4C3B', fontSize: 15, marginBottom: 14 },
  centerOption: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E8F3EC', marginBottom: 8, backgroundColor: '#FAF9F6' },
  centerOptionActive: { backgroundColor: '#E8F3EC', borderColor: '#3C6E47' },
  centerOptionText: { color: '#66785F', fontSize: 14 },
  centerOptionTextActive: { color: '#2C4C3B', fontWeight: '600' },
  modeToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modeToggle: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8F3EC', alignItems: 'center', backgroundColor: '#FAF9F6' },
  modeToggleActive: { backgroundColor: '#3C6E47', borderColor: '#3C6E47' },
  modeToggleText: { fontWeight: '600', color: '#66785F', fontSize: 14 },
  modeToggleTextActive: { color: '#fff' },
  primaryButton: { backgroundColor: '#3C6E47', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
