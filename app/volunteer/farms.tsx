import { DEMO_VOLUNTEER_NAME } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type MyHarvest = {
  signup_id: string;
  shift_id: string;
  date: string;
  time: string;
  fruit: string;
  farm_name: string;
  center_name: string;
  amount_picked_lbs: number;
  amount_donated_lbs: number;
  logged_donation: boolean;
};

function isPast(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d < today;
}

export default function MyHarvests() {
  const [harvests, setHarvests] = useState<MyHarvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loggingHarvest, setLoggingHarvest] = useState<MyHarvest | null>(null);
  const [form, setForm] = useState({ amount_picked_lbs: '', amount_donated_lbs: '' });

  async function fetchHarvests() {
    setLoading(true);
    const { data } = await supabase
      .from('shift_signups')
      .select('id, shift_id, amount_picked_lbs, amount_donated_lbs, logged_donation, shifts(date, time, fruit, farms(name), donation_centers(name))')
      .eq('volunteer_name', DEMO_VOLUNTEER_NAME)
      .order('created_at', { ascending: false });

    if (data) {
      setHarvests(
        data.map((row: any) => ({
          signup_id: row.id,
          shift_id: row.shift_id,
          date: row.shifts?.date ?? '',
          time: row.shifts?.time ?? '',
          fruit: row.shifts?.fruit ?? '',
          farm_name: row.shifts?.farms?.name ?? 'Unknown Farm',
          center_name: row.shifts?.donation_centers?.name ?? 'Unknown Center',
          amount_picked_lbs: row.amount_picked_lbs ?? 0,
          amount_donated_lbs: row.amount_donated_lbs ?? 0,
          logged_donation: row.logged_donation ?? false,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => { fetchHarvests(); }, []);

  function openLog(harvest: MyHarvest) {
    setLoggingHarvest(harvest);
    setForm({ amount_picked_lbs: '', amount_donated_lbs: '' });
    setShowLogModal(true);
  }

  async function handleLogSave() {
    if (!loggingHarvest) return;
    setSaving(true);
    await supabase
      .from('shift_signups')
      .update({
        amount_picked_lbs: Number(form.amount_picked_lbs) || 0,
        amount_donated_lbs: Number(form.amount_donated_lbs) || 0,
        logged_donation: true,
      })
      .eq('id', loggingHarvest.signup_id);
    setSaving(false);
    setShowLogModal(false);
    setLoggingHarvest(null);
    fetchHarvests();
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  const upcoming = harvests.filter(h => !h.logged_donation && !isPast(h.date));
  const readyToLog = harvests.filter(h => !h.logged_donation && isPast(h.date));
  const done = harvests.filter(h => h.logged_donation);

  function HarvestCard({ item, section }: { item: MyHarvest; section: 'upcoming' | 'ready' | 'done' }) {
    return (
      <View style={[styles.harvestCard, section === 'ready' && styles.readyCard, section === 'done' && styles.doneCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.fruitText}>{item.fruit} Picking</Text>
          {section === 'done' && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>LOGGED</Text>
            </View>
          )}
          {section === 'ready' && (
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>LOG READY</Text>
            </View>
          )}
        </View>
        <Text style={styles.farmName}>{item.farm_name}</Text>
        <Text style={styles.centerLabel}>→ {item.center_name}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
        {section === 'done' && (
          <View style={styles.loggedAmounts}>
            <Text style={styles.loggedAmount}>Picked: {item.amount_picked_lbs} lbs</Text>
            <Text style={styles.loggedAmount}>Donated: {item.amount_donated_lbs} lbs</Text>
          </View>
        )}
        {section === 'ready' && (
          <TouchableOpacity style={styles.logButton} onPress={() => openLog(item)}>
            <Text style={styles.logButtonText}>Log My Contribution</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const allSections = [
    ...(readyToLog.length > 0 ? [{ key: 'ready-header' as const }, ...readyToLog.map(h => ({ key: h.signup_id, item: h, section: 'ready' as const }))] : []),
    ...(upcoming.length > 0 ? [{ key: 'upcoming-header' as const }, ...upcoming.map(h => ({ key: h.signup_id, item: h, section: 'upcoming' as const }))] : []),
    ...(done.length > 0 ? [{ key: 'done-header' as const }, ...done.map(h => ({ key: h.signup_id, item: h, section: 'done' as const }))] : []),
  ];

  return (
    <>
      <FlatList
        style={styles.container}
        data={allSections}
        keyExtractor={item => item.key}
        ListHeaderComponent={() => (
          <Text style={styles.pageTitle}>My Harvests</Text>
        )}
        renderItem={({ item }) => {
          if (item.key === 'ready-header') return <Text style={styles.sectionTitle}>Ready to Log</Text>;
          if (item.key === 'upcoming-header') return <Text style={styles.sectionTitle}>Upcoming</Text>;
          if (item.key === 'done-header') return <Text style={styles.sectionTitle}>Done</Text>;
          if ('item' in item) return <HarvestCard item={item.item} section={item.section} />;
          return null;
        }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#66785F', fontSize: 15 }}>No harvests yet.</Text>
            <Text style={{ color: '#66785F', fontSize: 13, marginTop: 8 }}>Sign up for a harvest on the Shifts tab.</Text>
          </View>
        )}
      />

      <Modal visible={showLogModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log My Contribution</Text>
            {loggingHarvest && (
              <ScrollView>
                <Text style={styles.detailRow}>{loggingHarvest.fruit} — {loggingHarvest.date}</Text>
                <Text style={[styles.detailRow, { marginBottom: 16 }]}>{loggingHarvest.farm_name}</Text>

                <Text style={styles.inputLabel}>Amount I Picked (lbs)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={form.amount_picked_lbs}
                  onChangeText={t => setForm({ ...form, amount_picked_lbs: t })}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Amount I'm Donating (lbs)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={form.amount_donated_lbs}
                  onChangeText={t => setForm({ ...form, amount_donated_lbs: t })}
                  keyboardType="numeric"
                />
              </ScrollView>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => { setShowLogModal(false); setLoggingHarvest(null); }}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]} onPress={handleLogSave} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Submit'}</Text>
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
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#3C6E47', marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  harvestCard: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  readyCard: { borderLeftColor: '#E67E22' },
  doneCard: { borderLeftColor: '#BDC3C7', opacity: 0.85 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fruitText: { fontSize: 16, fontWeight: '600', color: '#2C4C3B' },
  doneBadge: { backgroundColor: '#E8F3EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  doneBadgeText: { fontSize: 11, fontWeight: '600', color: '#3C6E47' },
  readyBadge: { backgroundColor: '#FDF2E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  readyBadgeText: { fontSize: 11, fontWeight: '600', color: '#E67E22' },
  farmName: { fontSize: 13, color: '#66785F', fontStyle: 'italic', marginBottom: 2 },
  centerLabel: { fontSize: 13, color: '#3C6E47', marginBottom: 4 },
  dateText: { fontSize: 14, fontWeight: '500', color: '#2C4C3B', marginBottom: 2 },
  timeText: { fontSize: 13, color: '#66785F', marginBottom: 8 },
  loggedAmounts: { flexDirection: 'row', gap: 16, marginTop: 4 },
  loggedAmount: { fontSize: 13, fontWeight: '600', color: '#3C6E47' },
  logButton: { backgroundColor: '#E67E22', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  logButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 12 },
  detailRow: { fontSize: 14, color: '#444', marginBottom: 4 },
  inputLabel: { fontSize: 13, color: '#2C4C3B', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#FAF9F6' },
  modalActions: { flexDirection: 'row', marginTop: 12 },
  primaryButton: { backgroundColor: '#3C6E47', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3C6E47', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 14 },
});
