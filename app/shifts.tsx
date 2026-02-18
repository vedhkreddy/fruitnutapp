import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Shift = {
  id: string;
  date: string;
  time: string;
  fruit: string;
  volunteer_limit: number;
  signed_up: number;
  status: "active" | "full" | "cancelled";
  center_id: string | null;
  center_name?: string;
};

type Center = { id: string; name: string };

type SignupDetail = {
  id: string;
  volunteer_name: string;
  amount_picked_lbs: number;
  amount_donated_lbs: number;
  logged_donation: boolean;
};

export default function ManageShifts() {
  const { farmId } = useApp();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<SignupDetail[]>([]);
  const [loadingSignups, setLoadingSignups] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', fruit: '', volunteerLimit: '', status: 'active' as Shift['status'], center_id: '' });

  async function fetchData() {
    setLoading(true);
    const [shiftsRes, centersRes] = await Promise.all([
      supabase
        .from('shifts')
        .select('*, shift_signups(count), donation_centers(name)')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false }),
      supabase.from('donation_centers').select('id, name'),
    ]);

    if (shiftsRes.data) {
      setShifts(
        shiftsRes.data.map((s: any) => ({
          id: s.id,
          date: s.date,
          time: s.time,
          fruit: s.fruit,
          volunteer_limit: s.volunteer_limit,
          signed_up: s.shift_signups?.[0]?.count ?? 0,
          status: s.status,
          center_id: s.center_id,
          center_name: s.donation_centers?.name,
        }))
      );
    }
    if (centersRes.data) setCenters(centersRes.data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [farmId]);

  async function openDetails(item: Shift) {
    setEditingShift(item);
    setSignups([]);
    setShowDetailsModal(true);
    setLoadingSignups(true);
    const { data } = await supabase
      .from('shift_signups')
      .select('id, volunteer_name, amount_picked_lbs, amount_donated_lbs, logged_donation')
      .eq('shift_id', item.id);
    setSignups(data ?? []);
    setLoadingSignups(false);
  }

  function openCreate() {
    setEditingShift(null);
    setForm({ date: '', time: '', fruit: '', volunteerLimit: '', status: 'active', center_id: centers[0]?.id ?? '' });
    setShowCreateModal(true);
  }

  function openEdit(item: Shift) {
    setEditingShift(item);
    setForm({ date: item.date, time: item.time, fruit: item.fruit, volunteerLimit: String(item.volunteer_limit), status: item.status, center_id: item.center_id ?? '' });
    setShowCreateModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      farm_id: farmId,
      date: form.date,
      time: form.time,
      fruit: form.fruit,
      volunteer_limit: Number(form.volunteerLimit) || 10,
      status: form.status,
      center_id: form.center_id || null,
    };

    if (editingShift) {
      await supabase.from('shifts').update(payload).eq('id', editingShift.id);
    } else {
      await supabase.from('shifts').insert(payload);
    }

    setSaving(false);
    setShowCreateModal(false);
    setEditingShift(null);
    fetchData();
  }

  async function handleDelete(id: string) {
    await supabase.from('shifts').delete().eq('id', id);
    fetchData();
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  const totalPicked = signups.reduce((s, r) => s + Number(r.amount_picked_lbs), 0);
  const totalDonated = signups.reduce((s, r) => s + Number(r.amount_donated_lbs), 0);

  return (
    <>
      <FlatList
        style={styles.container}
        data={shifts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            <View style={styles.createButtonContainer}>
              <TouchableOpacity style={styles.createButton} onPress={openCreate}>
                <Text style={styles.createButtonText}>+ Create New Harvest</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Your Harvests</Text>
          </>
        )}
        renderItem={({ item }) => (
          <View style={[styles.shiftCard, item.status === "full" && styles.fullCard, item.status === "cancelled" && styles.cancelledCard]}>
            <View style={styles.shiftHeader}>
              <Text style={styles.shiftFruit}>{item.fruit} Picking</Text>
              <View style={[styles.statusBadge, item.status === "full" && styles.fullBadge, item.status === "cancelled" && styles.cancelledBadge]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.shiftDate}>{item.date}</Text>
            <Text style={styles.shiftTime}>{item.time}</Text>
            {item.center_name ? (
              <Text style={styles.centerLabel}>→ {item.center_name}</Text>
            ) : null}
            <View style={styles.volunteerInfo}>
              <Text style={styles.volunteerCount}>{item.signed_up}/{item.volunteer_limit} volunteers signed up</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min((item.signed_up / item.volunteer_limit) * 100, 100)}%` }]} />
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(item)}>
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => openDetails(item)}>
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#66785F' }}>No harvests yet. Create your first one!</Text>
          </View>
        )}
      />

      {/* Create/Edit Harvest Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{editingShift ? 'Edit Harvest' : 'Create New Harvest'}</Text>
              <TouchableOpacity onPress={() => { setShowCreateModal(false); setEditingShift(null); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Date (e.g. Oct 5, 2025)" value={form.date} onChangeText={t => setForm({ ...form, date: t })} />
              <TextInput style={styles.input} placeholder="Time (e.g. 9:00 AM - 1:00 PM)" value={form.time} onChangeText={t => setForm({ ...form, time: t })} />
              <TextInput style={styles.input} placeholder="Fruit" value={form.fruit} onChangeText={t => setForm({ ...form, fruit: t })} />
              <TextInput style={styles.input} placeholder="Volunteer Limit" value={form.volunteerLimit} onChangeText={t => setForm({ ...form, volunteerLimit: t })} keyboardType="numeric" />

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

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusRow}>
                {(['active', 'full', 'cancelled'] as Shift['status'][]).map(s => (
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
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => { setShowCreateModal(false); setEditingShift(null); }}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Harvest Details Modal */}
      <Modal visible={showDetailsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Harvest Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {editingShift && (
              <ScrollView>
                <Text style={styles.detailRow}>Fruit: {editingShift.fruit}</Text>
                <Text style={styles.detailRow}>Date: {editingShift.date}</Text>
                <Text style={styles.detailRow}>Time: {editingShift.time}</Text>
                <Text style={styles.detailRow}>Center: {editingShift.center_name || 'None'}</Text>
                <Text style={styles.detailRow}>Signed up: {editingShift.signed_up}/{editingShift.volunteer_limit}</Text>
                <Text style={styles.detailRow}>Status: {editingShift.status}</Text>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Volunteer Contributions</Text>
                {loadingSignups ? (
                  <ActivityIndicator size="small" color="#3C6E47" style={{ marginTop: 8 }} />
                ) : signups.length === 0 ? (
                  <Text style={{ color: '#66785F', fontSize: 13 }}>No volunteers signed up yet.</Text>
                ) : (
                  <>
                    {signups.map(signup => (
                      <View key={signup.id} style={styles.signupRow}>
                        <Text style={styles.signupName}>{signup.volunteer_name}</Text>
                        {signup.logged_donation ? (
                          <View style={styles.signupAmounts}>
                            <Text style={styles.signupAmount}>Picked: {signup.amount_picked_lbs} lbs</Text>
                            <Text style={styles.signupAmount}>Donated: {signup.amount_donated_lbs} lbs</Text>
                          </View>
                        ) : (
                          <Text style={styles.signupPending}>Not logged yet</Text>
                        )}
                      </View>
                    ))}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Picked:</Text>
                      <Text style={styles.totalValue}>{totalPicked} lbs</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Donated:</Text>
                      <Text style={styles.totalValue}>{totalDonated} lbs</Text>
                    </View>
                  </>
                )}
              </ScrollView>
            )}
            <View style={styles.modalActions}>
              {editingShift && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1, borderColor: '#E74C3C' }]}
                  onPress={() => { handleDelete(editingShift.id); setShowDetailsModal(false); }}
                >
                  <Text style={[styles.secondaryButtonText, { color: '#E74C3C' }]}>Delete</Text>
                </TouchableOpacity>
              )}
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
  createButtonContainer: { alignItems: "center", marginBottom: 20 },
  createButton: { backgroundColor: "#3C6E47", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  createButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#2C4C3B", marginBottom: 16, marginTop: 8 },
  shiftCard: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#3C6E47", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  fullCard: { borderLeftColor: "#E67E22" },
  cancelledCard: { borderLeftColor: "#BDC3C7" },
  shiftHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  shiftFruit: { fontSize: 18, fontWeight: "600", color: "#2C4C3B" },
  statusBadge: { backgroundColor: "#E8F3EC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  fullBadge: { backgroundColor: "#FDF2E9" },
  cancelledBadge: { backgroundColor: "#FADBD8" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#3C6E47" },
  shiftDate: { fontSize: 16, fontWeight: "500", color: "#2C4C3B", marginBottom: 4 },
  shiftTime: { fontSize: 14, color: "#66785F", marginBottom: 4 },
  centerLabel: { fontSize: 14, color: "#66785F", fontStyle: "italic", marginBottom: 12 },
  volunteerInfo: { marginBottom: 16 },
  volunteerCount: { fontSize: 14, color: "#444", marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: "#E8F3EC", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#3C6E47" },
  actionButtons: { flexDirection: "row", justifyContent: "space-between" },
  primaryButton: { backgroundColor: "#3C6E47", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#3C6E47", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flex: 1, marginRight: 8, alignItems: "center" },
  secondaryButtonText: { color: "#3C6E47", fontWeight: "600", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalClose: { fontSize: 20, color: '#66785F' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#FAF9F6' },
  inputLabel: { fontSize: 13, color: '#2C4C3B', marginBottom: 6, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusOption: { flex: 1, borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 8, alignItems: 'center' },
  statusOptionSelected: { borderColor: '#3C6E47', backgroundColor: '#E8F3EC' },
  statusOptionText: { color: '#2C4C3B', fontSize: 13 },
  statusOptionTextSelected: { color: '#3C6E47', fontWeight: '600' },
  modalActions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  detailRow: { fontSize: 14, color: '#444', marginBottom: 6 },
  centerOption: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 10, marginBottom: 8 },
  centerOptionSelected: { borderColor: '#3C6E47', backgroundColor: '#E8F3EC' },
  centerOptionText: { color: '#2C4C3B', fontSize: 14 },
  centerOptionTextSelected: { color: '#3C6E47', fontWeight: '600' },
  signupRow: { backgroundColor: '#F8FBF9', padding: 10, borderRadius: 8, marginBottom: 8 },
  signupName: { fontSize: 14, fontWeight: '600', color: '#2C4C3B', marginBottom: 4 },
  signupAmounts: { flexDirection: 'row', gap: 12 },
  signupAmount: { fontSize: 13, color: '#3C6E47' },
  signupPending: { fontSize: 13, color: '#66785F', fontStyle: 'italic' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#E8F3EC', marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#2C4C3B' },
  totalValue: { fontSize: 14, fontWeight: '700', color: '#3C6E47' },
});
