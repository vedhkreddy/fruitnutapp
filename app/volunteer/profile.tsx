import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function VolunteerProfile() {
  const { session, profiles, setActiveProfile, refreshProfiles, signOut } = useApp();
  const router = useRouter();

  const [volunteerName, setVolunteerName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState('');
  const [waiverAgreed, setWaiverAgreed] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('role', 'volunteer')
      .single()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id);
          setVolunteerName(data.volunteer_name ?? '');
          setPhone(data.phone ?? '');
          setWaiverAgreed(data.waiver_agreed ?? false);
        }
        setLoading(false);
      });
  }, [session?.user?.id]);

  async function handleSave() {
    if (!volunteerName.trim()) {
      Alert.alert('Missing info', 'Please enter your name.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({ volunteer_name: volunteerName.trim(), phone: phone.trim() || null })
      .eq('id', profileId);
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile.');
      return;
    }
    await refreshProfiles();
    Alert.alert('Saved', 'Profile updated.');
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>My Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Volunteer Info</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={volunteerName}
            onChangeText={setVolunteerName}
            placeholder="Your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number (optional)"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Waiver</Text>
        <TouchableOpacity style={styles.waiverRow} onPress={() => router.push('/volunteer/waiver')}>
          <View>
            <Text style={styles.waiverLabel}>Waiver Status</Text>
            <Text style={[styles.waiverStatus, waiverAgreed ? styles.waiverSigned : styles.waiverPending]}>
              {waiverAgreed ? '✓ Signed' : 'Tap to review & sign'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={[styles.secondaryButton, { marginBottom: 10 }]}
          onPress={() => { setActiveProfile(null); router.replace('/home'); }}
        >
          <Text style={styles.secondaryButtonText}>Switch / Add Role</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} onPress={signOut}>
          <Text style={styles.dangerButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 16 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C4C3B', marginBottom: 14 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#2C4C3B', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 12, backgroundColor: '#FAF9F6', color: '#2C4C3B', fontSize: 15 },
  primaryButton: { backgroundColor: '#3C6E47', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryButton: { borderWidth: 1, borderColor: '#3C6E47', padding: 12, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 15 },
  dangerButton: { borderWidth: 1, borderColor: '#C0392B', padding: 12, borderRadius: 8, alignItems: 'center' },
  dangerButtonText: { color: '#C0392B', fontWeight: '600', fontSize: 15 },
  waiverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  waiverLabel: { fontSize: 15, fontWeight: '500', color: '#2C4C3B', marginBottom: 4 },
  waiverStatus: { fontSize: 13, fontWeight: '500' },
  waiverSigned: { color: '#3C6E47' },
  waiverPending: { color: '#C0392B' },
  chevron: { fontSize: 22, color: '#BDC3C7' },
});
