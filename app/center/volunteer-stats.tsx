import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type IncomingDonation = {
  id: string;
  date: string;
  fruit: string;
  amount_donated_lbs: number;
  volunteer_count: number;
  farm_name: string;
  status: string;
  nullification_reason: string | null;
  shift_date?: string;
  shift_fruit?: string;
};

export default function IncomingDonations() {
  const { centerId } = useApp();
  const [donations, setDonations] = useState<IncomingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNullifyModal, setShowNullifyModal] = useState(false);
  const [nullifyingId, setNullifyingId] = useState<string | null>(null);
  const [nullifyReason, setNullifyReason] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchDonations() {
    setLoading(true);
    const { data } = await supabase
      .from('donations')
      .select('*, farms(name), shifts(date, fruit)')
      .eq('center_id', centerId)
      .order('created_at', { ascending: false });

    if (data) {
      setDonations(
        data.map((d: any) => ({
          id: d.id,
          date: d.date,
          fruit: d.fruit,
          amount_donated_lbs: d.amount_donated_lbs,
          volunteer_count: d.volunteer_count,
          farm_name: d.farms?.name ?? 'Unknown Farm',
          status: d.status,
          nullification_reason: d.nullification_reason ?? null,
          shift_date: d.shifts?.date,
          shift_fruit: d.shifts?.fruit,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => { fetchDonations(); }, [centerId]);

  function openNullify(id: string) {
    setNullifyingId(id);
    setNullifyReason('');
    setShowNullifyModal(true);
  }

  async function handleNullify() {
    if (!nullifyingId) return;
    setSaving(true);
    await supabase
      .from('donations')
      .update({ status: 'nullified', nullification_reason: nullifyReason })
      .eq('id', nullifyingId);
    setSaving(false);
    setShowNullifyModal(false);
    setNullifyingId(null);
    fetchDonations();
  }

  const totalReceived = donations.filter(d => d.status !== 'nullified').reduce((s, d) => s + Number(d.amount_donated_lbs), 0);
  const nullifiedCount = donations.filter(d => d.status === 'nullified').length;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.container}
        data={donations}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalReceived}</Text>
                <Text style={styles.statLabel}>lbs Received</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{donations.length}</Text>
                <Text style={styles.statLabel}>Deliveries</Text>
              </View>
              <View style={[styles.statCard, nullifiedCount > 0 && styles.statCardWarning]}>
                <Text style={[styles.statNumber, nullifiedCount > 0 && styles.statNumberWarning]}>{nullifiedCount}</Text>
                <Text style={[styles.statLabel, nullifiedCount > 0 && styles.statLabelWarning]}>Nullified</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Incoming Donations</Text>
          </>
        )}
        renderItem={({ item }) => (
          <View style={[
            styles.donationCard,
            item.status === 'pending' && styles.pendingCard,
            item.status === 'nullified' && styles.nullifiedCard,
          ]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardFarm}>{item.farm_name}</Text>
              <View style={[
                styles.statusBadge,
                item.status === 'pending' && styles.pendingBadge,
                item.status === 'nullified' && styles.nullifiedBadge,
              ]}>
                <Text style={[styles.statusText, item.status === 'nullified' && styles.nullifiedStatusText]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            {item.shift_date ? (
              <Text style={styles.harvestLabel}>Harvest: {item.shift_date} – {item.shift_fruit}</Text>
            ) : null}
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text style={styles.cardFruit}>{item.fruit}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardAmount}>{item.amount_donated_lbs} lbs</Text>
              <Text style={styles.cardVolunteers}>{item.volunteer_count} volunteers</Text>
            </View>
            {item.status === 'nullified' && item.nullification_reason ? (
              <Text style={styles.nullificationReason}>Reason: {item.nullification_reason}</Text>
            ) : null}
            {item.status !== 'nullified' && (
              <TouchableOpacity style={styles.nullifyButton} onPress={() => openNullify(item.id)}>
                <Text style={styles.nullifyButtonText}>Nullify</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#66785F' }}>No incoming donations yet.</Text>
          </View>
        )}
      />

      <Modal visible={showNullifyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nullify Donation</Text>
            <Text style={styles.modalSubtitle}>Please provide a reason for nullifying this donation.</Text>
            <TextInput
              style={[styles.input, styles.reasonInput]}
              placeholder="e.g. Quality standards not met, incorrect items..."
              value={nullifyReason}
              onChangeText={setNullifyReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => { setShowNullifyModal(false); setNullifyingId(null); }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dangerButton, { flex: 1, marginLeft: 8 }]}
                onPress={handleNullify}
                disabled={saving || !nullifyReason.trim()}
              >
                <Text style={styles.dangerButtonText}>{saving ? 'Saving...' : 'Confirm Nullify'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#E8F3EC', borderRadius: 12, padding: 14, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  statCardWarning: { backgroundColor: '#FADBD8' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#3C6E47' },
  statNumberWarning: { color: '#E74C3C' },
  statLabel: { fontSize: 11, color: '#3C6E47', marginTop: 4, textAlign: 'center' },
  statLabelWarning: { color: '#E74C3C' },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#2C4C3B', marginBottom: 12 },
  donationCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 1 },
  pendingCard: { borderLeftColor: '#E67E22' },
  nullifiedCard: { borderLeftColor: '#E74C3C' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardFarm: { fontSize: 16, fontWeight: '600', color: '#2C4C3B', flex: 1 },
  statusBadge: { backgroundColor: '#E8F3EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pendingBadge: { backgroundColor: '#FDF2E9' },
  nullifiedBadge: { backgroundColor: '#FADBD8' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#3C6E47' },
  nullifiedStatusText: { color: '#E74C3C' },
  harvestLabel: { fontSize: 12, color: '#66785F', marginBottom: 2 },
  cardDate: { fontSize: 13, color: '#66785F', marginBottom: 2 },
  cardFruit: { fontSize: 14, color: '#2C4C3B', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardAmount: { fontSize: 15, fontWeight: '700', color: '#3C6E47' },
  cardVolunteers: { fontSize: 13, color: '#66785F' },
  nullificationReason: { fontSize: 13, color: '#E74C3C', fontStyle: 'italic', marginTop: 4 },
  nullifyButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E74C3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  nullifyButtonText: { color: '#E74C3C', fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#66785F', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, backgroundColor: '#FAF9F6' },
  reasonInput: { height: 80, textAlignVertical: 'top', marginBottom: 16 },
  modalActions: { flexDirection: 'row' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3C6E47', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 14 },
  dangerButton: { backgroundColor: '#E74C3C', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  dangerButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
