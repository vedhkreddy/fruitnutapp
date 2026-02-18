import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Donation = {
  id: string;
  date: string;
  fruit: string;
  amount_picked_lbs: number;
  amount_donated_lbs: number;
  center_id: string | null;
  center_name?: string;
  volunteer_count: number;
  status: "completed" | "pending" | "delivered" | "nullified";
  shift_id: string | null;
  shift_label?: string;
  nullification_reason?: string | null;
};

type Center = { id: string; name: string };
type Shift = { id: string; date: string; fruit: string };

export default function Donations() {
  const { farmId } = useApp();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recent" | "pending" | "analytics">("recent");

  const [showLogModal, setShowLogModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: '',
    fruit: '',
    amount_picked_lbs: '',
    amount_donated_lbs: '',
    center_id: '',
    volunteer_count: '',
    status: 'pending' as Exclude<Donation['status'], 'nullified'>,
    shift_id: '',
  });

  async function fetchData() {
    setLoading(true);
    const [donationsRes, centersRes, shiftsRes] = await Promise.all([
      supabase
        .from('donations')
        .select('*, donation_centers(name), shifts(date, fruit)')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false }),
      supabase.from('donation_centers').select('id, name'),
      supabase.from('shifts').select('id, date, fruit').eq('farm_id', farmId).order('date', { ascending: false }),
    ]);

    if (donationsRes.data) {
      setDonations(
        donationsRes.data.map((d: any) => ({
          ...d,
          center_name: d.donation_centers?.name ?? '',
          shift_label: d.shifts ? `${d.shifts.date} – ${d.shifts.fruit}` : null,
        }))
      );
    }
    if (centersRes.data) setCenters(centersRes.data);
    if (shiftsRes.data) setShifts(shiftsRes.data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [farmId]);

  const totalPicked = donations.reduce((s, d) => s + Number(d.amount_picked_lbs), 0);
  const totalDonated = donations.reduce((s, d) => s + Number(d.amount_donated_lbs), 0);

  function openCreate() {
    setEditingDonation(null);
    setForm({ date: '', fruit: '', amount_picked_lbs: '', amount_donated_lbs: '', center_id: centers[0]?.id ?? '', volunteer_count: '', status: 'pending', shift_id: '' });
    setShowLogModal(true);
  }

  function openEdit(item: Donation) {
    if (item.status === 'nullified') return;
    setEditingDonation(item);
    setForm({
      date: item.date,
      fruit: item.fruit,
      amount_picked_lbs: String(item.amount_picked_lbs),
      amount_donated_lbs: String(item.amount_donated_lbs),
      center_id: item.center_id ?? '',
      volunteer_count: String(item.volunteer_count),
      status: item.status as Exclude<Donation['status'], 'nullified'>,
      shift_id: item.shift_id ?? '',
    });
    setShowLogModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      farm_id: farmId,
      date: form.date,
      fruit: form.fruit,
      amount_picked_lbs: Number(form.amount_picked_lbs) || 0,
      amount_donated_lbs: Number(form.amount_donated_lbs) || 0,
      center_id: form.center_id || null,
      volunteer_count: Number(form.volunteer_count) || 0,
      status: form.status,
      shift_id: form.shift_id || null,
    };

    if (editingDonation) {
      await supabase.from('donations').update(payload).eq('id', editingDonation.id);
    } else {
      await supabase.from('donations').insert(payload);
    }

    setSaving(false);
    setShowLogModal(false);
    setEditingDonation(null);
    fetchData();
  }

  const displayedDonations = activeTab === 'pending'
    ? donations.filter(d => d.status === 'pending')
    : donations;

  // Analytics computed from real data
  const fruitTotals = donations.reduce<Record<string, number>>((acc, d) => {
    acc[d.fruit] = (acc[d.fruit] ?? 0) + Number(d.amount_donated_lbs);
    return acc;
  }, {});
  const centerTotals = donations.reduce<Record<string, number>>((acc, d) => {
    const name = d.center_name ?? 'Unknown';
    acc[name] = (acc[name] ?? 0) + Number(d.amount_donated_lbs);
    return acc;
  }, {});
  const topCenters = Object.entries(centerTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const wasteRate = totalPicked > 0 ? (((totalPicked - totalDonated) / totalPicked) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <>
      {activeTab === "analytics" ? (
        <ScrollView style={styles.container}>
          <View style={styles.tabContainer}>
            {(['recent', 'pending', 'analytics'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
                <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Donation Efficiency</Text>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Average waste:</Text>
                <Text style={styles.efficiencyValue}>{wasteRate}%</Text>
              </View>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Total harvests:</Text>
                <Text style={styles.efficiencyValue}>{donations.length}</Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Top Donation Centers</Text>
              {topCenters.map(([name, amt], i) => (
                <View key={name} style={styles.centerRank}>
                  <Text style={styles.centerName}>{i + 1}. {name}</Text>
                  <Text style={styles.centerAmount}>{amt} lbs</Text>
                </View>
              ))}
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Fruit Type Breakdown</Text>
              <View style={styles.fruitBreakdown}>
                {Object.entries(fruitTotals).map(([fruit, amt]) => (
                  <View key={fruit} style={styles.fruitRow}>
                    <Text style={styles.fruitType}>{fruit}</Text>
                    <Text style={styles.fruitAmount}>{amt} lbs</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          style={styles.container}
          data={displayedDonations}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{totalPicked} lbs</Text>
                  <Text style={styles.statLabel}>Total Picked</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{totalDonated} lbs</Text>
                  <Text style={styles.statLabel}>Total Donated</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{donations.length}</Text>
                  <Text style={styles.statLabel}>Total Harvests</Text>
                </View>
              </View>

              <View style={styles.logButtonContainer}>
                <TouchableOpacity style={styles.logButton} onPress={openCreate}>
                  <Text style={styles.logButtonText}>+ Log New Donation</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabContainer}>
                {(['recent', 'pending', 'analytics'] as const).map(t => (
                  <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
                    <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          renderItem={({ item }) => (
            <View style={[
              styles.donationCard,
              item.status === "pending" && styles.pendingCard,
              item.status === "nullified" && styles.nullifiedCard,
            ]}>
              <View style={styles.donationHeader}>
                <Text style={styles.donationFruit}>{item.fruit}</Text>
                <View style={[
                  styles.statusBadge,
                  item.status === "pending" && styles.pendingBadge,
                  item.status === "delivered" && styles.deliveredBadge,
                  item.status === "nullified" && styles.nullifiedBadge,
                ]}>
                  <Text style={[styles.statusText, item.status === "nullified" && styles.nullifiedStatusText]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.donationDate}>{item.date}</Text>
              <Text style={styles.donationCenter}>→ {item.center_name || 'No center'}</Text>
              {item.shift_label ? (
                <Text style={styles.shiftLabel}>Harvest: {item.shift_label}</Text>
              ) : null}
              {item.status === 'nullified' && item.nullification_reason ? (
                <Text style={styles.nullificationReason}>Reason: {item.nullification_reason}</Text>
              ) : null}
              <View style={styles.amountContainer}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Picked:</Text>
                  <Text style={styles.amountValue}>{item.amount_picked_lbs} lbs</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Donated:</Text>
                  <Text style={styles.amountValueHighlight}>{item.amount_donated_lbs} lbs</Text>
                </View>
              </View>
              <Text style={styles.volunteerInfo}>{item.volunteer_count} volunteers participated</Text>
              {item.status !== 'nullified' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(item)}>
                    <Text style={styles.secondaryButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButton} onPress={() => { setEditingDonation(item); setShowDetailsModal(true); }}>
                    <Text style={styles.primaryButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#66785F' }}>No donations yet. Log your first one!</Text>
            </View>
          )}
        />
      )}

      {/* Log / Edit Donation Modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{editingDonation ? 'Edit Donation' : 'Log New Donation'}</Text>
              <TouchableOpacity onPress={() => { setShowLogModal(false); setEditingDonation(null); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput style={styles.input} placeholder="Oct 5, 2025" value={form.date} onChangeText={t => setForm({ ...form, date: t })} />

              <Text style={styles.inputLabel}>Crop / Fruit</Text>
              <TextInput style={styles.input} placeholder="Apples" value={form.fruit} onChangeText={t => setForm({ ...form, fruit: t })} />

              <Text style={styles.inputLabel}>Amount Picked (lbs)</Text>
              <TextInput style={styles.input} placeholder="120" value={form.amount_picked_lbs} onChangeText={t => setForm({ ...form, amount_picked_lbs: t })} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Amount Donated (lbs)</Text>
              <TextInput style={styles.input} placeholder="115" value={form.amount_donated_lbs} onChangeText={t => setForm({ ...form, amount_donated_lbs: t })} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Donation Center</Text>
              {centers.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.centerOption, form.center_id === c.id && styles.centerOptionSelected]}
                  onPress={() => setForm({ ...form, center_id: c.id })}
                >
                  <Text style={[styles.centerOptionText, form.center_id === c.id && styles.centerOptionTextSelected]}>{c.name}</Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.inputLabel}>Linked Harvest (optional)</Text>
              <TouchableOpacity
                style={[styles.centerOption, form.shift_id === '' && styles.centerOptionSelected]}
                onPress={() => setForm({ ...form, shift_id: '' })}
              >
                <Text style={[styles.centerOptionText, form.shift_id === '' && styles.centerOptionTextSelected]}>None</Text>
              </TouchableOpacity>
              {shifts.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.centerOption, form.shift_id === s.id && styles.centerOptionSelected]}
                  onPress={() => setForm({ ...form, shift_id: s.id })}
                >
                  <Text style={[styles.centerOptionText, form.shift_id === s.id && styles.centerOptionTextSelected]}>{s.date} – {s.fruit}</Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.inputLabel}>Volunteers</Text>
              <TextInput style={styles.input} placeholder="8" value={form.volunteer_count} onChangeText={t => setForm({ ...form, volunteer_count: t })} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusRow}>
                {(['pending', 'completed', 'delivered'] as const).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusOption, form.status === s && styles.statusOptionSelected]}
                    onPress={() => setForm({ ...form, status: s })}
                  >
                    <Text style={[styles.statusOptionText, form.status === s && styles.statusOptionTextSelected]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => { setShowLogModal(false); setEditingDonation(null); }}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Donation Details Modal */}
      <Modal visible={showDetailsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Donation Details</Text>
            {editingDonation && (
              <View>
                <Text style={styles.detailRow}>Fruit: {editingDonation.fruit}</Text>
                <Text style={styles.detailRow}>Date: {editingDonation.date}</Text>
                <Text style={styles.detailRow}>Picked: {editingDonation.amount_picked_lbs} lbs</Text>
                <Text style={styles.detailRow}>Donated: {editingDonation.amount_donated_lbs} lbs</Text>
                <Text style={styles.detailRow}>Center: {editingDonation.center_name || 'None'}</Text>
                {editingDonation.shift_label ? (
                  <Text style={styles.detailRow}>Harvest: {editingDonation.shift_label}</Text>
                ) : null}
                <Text style={styles.detailRow}>Volunteers: {editingDonation.volunteer_count}</Text>
                <Text style={styles.detailRow}>Status: {editingDonation.status}</Text>
                {editingDonation.nullification_reason ? (
                  <Text style={[styles.detailRow, { color: '#E74C3C' }]}>Reason: {editingDonation.nullification_reason}</Text>
                ) : null}
              </View>
            )}
            <View style={[styles.modalActions, { marginTop: 12 }]}>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.primaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6", padding: 16 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statCard: { backgroundColor: "#E8F3EC", borderRadius: 12, padding: 16, alignItems: "center", flex: 1, marginHorizontal: 4 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#3C6E47" },
  statLabel: { fontSize: 12, color: "#3C6E47", marginTop: 4, textAlign: "center" },
  logButtonContainer: { alignItems: "center", marginBottom: 20 },
  logButton: { backgroundColor: "#3C6E47", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  logButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  tabContainer: { flexDirection: "row", backgroundColor: "#E8F3EC", borderRadius: 12, marginBottom: 20, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: "center" },
  activeTab: { backgroundColor: "#3C6E47" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#3C6E47" },
  activeTabText: { color: "#fff" },
  donationCard: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#3C6E47", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  pendingCard: { borderLeftColor: "#E67E22" },
  nullifiedCard: { borderLeftColor: "#E74C3C" },
  donationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  donationFruit: { fontSize: 18, fontWeight: "600", color: "#2C4C3B" },
  statusBadge: { backgroundColor: "#E8F3EC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pendingBadge: { backgroundColor: "#FDF2E9" },
  deliveredBadge: { backgroundColor: "#E8F3EC" },
  nullifiedBadge: { backgroundColor: "#FADBD8" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#3C6E47" },
  nullifiedStatusText: { color: "#E74C3C" },
  donationDate: { fontSize: 16, fontWeight: "500", color: "#2C4C3B", marginBottom: 4 },
  donationCenter: { fontSize: 14, color: "#66785F", marginBottom: 4, fontStyle: "italic" },
  shiftLabel: { fontSize: 13, color: "#66785F", marginBottom: 8 },
  nullificationReason: { fontSize: 13, color: "#E74C3C", marginBottom: 8, fontStyle: "italic" },
  amountContainer: { backgroundColor: "#F8FBF9", padding: 12, borderRadius: 8, marginBottom: 12 },
  amountRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  amountLabel: { fontSize: 14, color: "#66785F" },
  amountValue: { fontSize: 14, fontWeight: "600", color: "#2C4C3B" },
  amountValueHighlight: { fontSize: 14, fontWeight: "600", color: "#3C6E47" },
  volunteerInfo: { fontSize: 13, color: "#444", marginBottom: 16 },
  actionButtons: { flexDirection: "row", justifyContent: "space-between" },
  primaryButton: { backgroundColor: "#3C6E47", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#3C6E47", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, marginRight: 8, alignItems: "center" },
  secondaryButtonText: { color: "#3C6E47", fontWeight: "600", fontSize: 14 },
  analyticsContainer: { marginBottom: 20 },
  analyticsCard: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  analyticsTitle: { fontSize: 18, fontWeight: "600", color: "#2C4C3B", marginBottom: 12 },
  efficiencyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  efficiencyLabel: { fontSize: 14, color: "#66785F" },
  efficiencyValue: { fontSize: 14, fontWeight: "600", color: "#3C6E47" },
  centerRank: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  centerName: { fontSize: 14, color: "#2C4C3B" },
  centerAmount: { fontSize: 14, fontWeight: "600", color: "#3C6E47" },
  fruitBreakdown: { marginTop: 8 },
  fruitRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  fruitType: { fontSize: 14, color: "#2C4C3B" },
  fruitAmount: { fontSize: 14, fontWeight: "600", color: "#3C6E47" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#FAF9F6' },
  modalActions: { flexDirection: 'row', marginTop: 12 },
  detailRow: { fontSize: 14, color: '#444', marginBottom: 6 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalClose: { fontSize: 20, color: '#66785F' },
  inputLabel: { fontSize: 13, color: '#2C4C3B', marginBottom: 6, fontWeight: '600' },
  centerOption: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, marginBottom: 8 },
  centerOptionSelected: { borderColor: '#3C6E47', backgroundColor: '#E8F3EC' },
  centerOptionText: { color: '#2C4C3B', fontSize: 14 },
  centerOptionTextSelected: { color: '#3C6E47', fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statusOption: { flex: 1, borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 8, alignItems: 'center' },
  statusOptionSelected: { borderColor: '#3C6E47', backgroundColor: '#E8F3EC' },
  statusOptionText: { color: '#2C4C3B', fontSize: 13 },
  statusOptionTextSelected: { color: '#3C6E47', fontWeight: '600' },
});
