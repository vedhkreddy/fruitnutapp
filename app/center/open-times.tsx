import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Center = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  open_hours: string;
  capacity_lbs: number;
};

export default function CenterOpenTimes() {
  const { centerId } = useApp();
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ open_hours: '', capacity_lbs: '' });

  async function fetchCenter() {
    setLoading(true);
    const { data } = await supabase.from('donation_centers').select('*').eq('id', centerId).single();
    if (data) {
      setCenter(data);
      setForm({ open_hours: data.open_hours ?? '', capacity_lbs: String(data.capacity_lbs ?? '') });
    }
    setLoading(false);
  }

  useEffect(() => { fetchCenter(); }, [centerId]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('donation_centers')
      .update({ open_hours: form.open_hours, capacity_lbs: Number(form.capacity_lbs) || 0 })
      .eq('id', centerId);
    setSaving(false);
    setShowEditModal(false);
    if (error) {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } else {
      fetchCenter();
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  if (!center) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#66785F' }}>Center not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.centerName}>{center.name}</Text>
        {center.address ? <Text style={styles.centerDetail}>{center.address}</Text> : null}
        {center.phone ? <Text style={styles.centerDetail}>{center.phone}</Text> : null}
        {center.email ? <Text style={styles.centerDetail}>{center.email}</Text> : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Hours</Text>
          <TouchableOpacity onPress={() => setShowEditModal(true)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hoursText}>{center.open_hours || 'Not set'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Donation Capacity</Text>
          <TouchableOpacity onPress={() => setShowEditModal(true)}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.capacityRow}>
          <View style={styles.capacityCard}>
            <Text style={styles.capacityNumber}>{center.capacity_lbs}</Text>
            <Text style={styles.capacityLabel}>Max lbs/Day</Text>
          </View>
        </View>
        <View style={styles.capacityBar}>
          <View style={[styles.capacityFill, { width: '60%' }]} />
        </View>
        <Text style={styles.capacityHint}>Estimated current utilization: 60%</Text>
      </View>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Center Info</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Open Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mon-Fri: 8am-5pm, Sat: 9am-2pm"
              value={form.open_hours}
              onChangeText={t => setForm({ ...form, open_hours: t })}
              multiline
            />

            <Text style={styles.inputLabel}>Daily Capacity (lbs)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              value={form.capacity_lbs}
              onChangeText={t => setForm({ ...form, capacity_lbs: t })}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowEditModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  headerCard: { backgroundColor: '#3C6E47', borderRadius: 14, padding: 20, marginBottom: 20 },
  centerName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  centerDetail: { fontSize: 14, color: '#E8F3EC', marginBottom: 2 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2C4C3B' },
  editLink: { fontSize: 14, color: '#3C6E47', fontWeight: '600' },
  hoursText: { fontSize: 15, color: '#2C4C3B', lineHeight: 22 },
  capacityRow: { flexDirection: 'row', marginBottom: 12 },
  capacityCard: { backgroundColor: '#E8F3EC', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1 },
  capacityNumber: { fontSize: 32, fontWeight: '700', color: '#3C6E47' },
  capacityLabel: { fontSize: 12, color: '#3C6E47', marginTop: 4 },
  capacityBar: { height: 10, backgroundColor: '#E8F3EC', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  capacityFill: { height: '100%', backgroundColor: '#3C6E47', borderRadius: 5 },
  capacityHint: { fontSize: 12, color: '#66785F' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalClose: { fontSize: 20, color: '#66785F' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B' },
  inputLabel: { fontSize: 13, color: '#2C4C3B', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#FAF9F6' },
  modalActions: { flexDirection: 'row', marginTop: 4 },
  primaryButton: { backgroundColor: '#3C6E47', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3C6E47', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 14 },
});
