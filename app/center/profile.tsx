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

export default function CenterProfile() {
  const { centerId, profiles, setActiveProfile, signOut } = useApp();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' });

  useEffect(() => {
    if (!centerId) return;
    supabase
      .from('donation_centers')
      .select('name, address, phone, email')
      .eq('id', centerId)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            name: data.name ?? '',
            address: data.address ?? '',
            phone: data.phone ?? '',
            email: data.email ?? '',
          });
        }
        setLoading(false);
      });
  }, [centerId]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('donation_centers')
      .update({ name: form.name, address: form.address, phone: form.phone, email: form.email })
      .eq('id', centerId);
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile.');
    } else {
      Alert.alert('Saved', 'Center profile updated.');
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>Center Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Info</Text>

        {([
          { key: 'name', label: 'Center Name', placeholder: 'Center name' },
          { key: 'address', label: 'Address', placeholder: 'Street address' },
          { key: 'phone', label: 'Phone', placeholder: 'Phone number', keyboard: 'phone-pad' },
          { key: 'email', label: 'Email', placeholder: 'Email address', keyboard: 'email-address' },
        ] as const).map(field => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={form[field.key]}
              onChangeText={t => setForm({ ...form, [field.key]: t })}
              placeholder={field.placeholder}
              keyboardType={(field as any).keyboard}
              autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={[styles.primaryButton, { marginBottom: 10 }]}
          onPress={() => { setActiveProfile(null); router.replace('/home'); }}
        >
          <Text style={styles.primaryButtonText}>Switch / Add Role</Text>
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
});
