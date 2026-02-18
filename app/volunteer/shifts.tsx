import { DEMO_VOLUNTEER_NAME } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Shift = {
  id: string;
  date: string;
  time: string;
  fruit: string;
  volunteer_limit: number;
  signed_up: number;
  status: 'active' | 'full' | 'cancelled';
  farm_name: string;
  center_name?: string;
};

export default function VolunteerShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);

  async function fetchShifts() {
    setLoading(true);
    const { data } = await supabase
      .from('shifts')
      .select('*, shift_signups(count), farms(name), donation_centers(name)')
      .in('status', ['active', 'full'])
      .order('created_at', { ascending: false });

    if (data) {
      setShifts(
        data.map((s: any) => ({
          id: s.id,
          date: s.date,
          time: s.time,
          fruit: s.fruit,
          volunteer_limit: s.volunteer_limit,
          signed_up: s.shift_signups?.[0]?.count ?? 0,
          status: s.status,
          farm_name: s.farms?.name ?? 'Unknown Farm',
          center_name: s.donation_centers?.name,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => { fetchShifts(); }, []);

  async function handleSignup(shift: Shift) {
    if (shift.status === 'full') {
      Alert.alert('Shift Full', 'This shift is already full.');
      return;
    }
    setSigningUp(shift.id);
    await supabase.from('shift_signups').insert({ shift_id: shift.id, volunteer_name: DEMO_VOLUNTEER_NAME });

    // Update status to full if at limit
    const newCount = shift.signed_up + 1;
    if (newCount >= shift.volunteer_limit) {
      await supabase.from('shifts').update({ status: 'full' }).eq('id', shift.id);
    }

    setSigningUp(null);
    setShowSignupModal(false);
    Alert.alert('Signed Up!', `You've signed up for ${shift.fruit} picking on ${shift.date}.`);
    fetchShifts();
  }

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
        data={shifts}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>Available Shifts</Text>
        )}
        renderItem={({ item }) => (
          <View style={[styles.shiftCard, item.status === 'full' && styles.fullCard]}>
            <View style={styles.shiftHeader}>
              <Text style={styles.shiftFruit}>{item.fruit} Picking</Text>
              <View style={[styles.statusBadge, item.status === 'full' && styles.fullBadge]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.farmName}>{item.farm_name}</Text>
            {item.center_name ? (
              <Text style={styles.centerName}>→ {item.center_name}</Text>
            ) : null}
            <Text style={styles.shiftDate}>{item.date}</Text>
            <Text style={styles.shiftTime}>{item.time}</Text>
            <View style={styles.volunteerInfo}>
              <Text style={styles.volunteerCount}>{item.signed_up}/{item.volunteer_limit} volunteers</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min((item.signed_up / item.volunteer_limit) * 100, 100)}%` }]} />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.signupButton, item.status === 'full' && styles.signupButtonDisabled]}
              onPress={() => { setSelectedShift(item); setShowSignupModal(true); }}
              disabled={item.status === 'full'}
            >
              <Text style={styles.signupButtonText}>
                {item.status === 'full' ? 'Shift Full' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#66785F' }}>No shifts available right now.</Text>
          </View>
        )}
      />

      <Modal visible={showSignupModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Sign Up</Text>
            {selectedShift && (
              <View>
                <Text style={styles.detailRow}>Farm: {selectedShift.farm_name}</Text>
                <Text style={styles.detailRow}>Fruit: {selectedShift.fruit}</Text>
                <Text style={styles.detailRow}>Date: {selectedShift.date}</Text>
                <Text style={styles.detailRow}>Time: {selectedShift.time}</Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowSignupModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signupButton, { flex: 1, marginLeft: 8 }]}
                onPress={() => selectedShift && handleSignup(selectedShift)}
                disabled={signingUp !== null}
              >
                <Text style={styles.signupButtonText}>{signingUp ? 'Signing Up...' : 'Confirm'}</Text>
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
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 16 },
  shiftCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  fullCard: { borderLeftColor: '#E67E22', opacity: 0.7 },
  shiftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  shiftFruit: { fontSize: 18, fontWeight: '600', color: '#2C4C3B' },
  statusBadge: { backgroundColor: '#E8F3EC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  fullBadge: { backgroundColor: '#FDF2E9' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#3C6E47' },
  farmName: { fontSize: 13, color: '#66785F', marginBottom: 2, fontStyle: 'italic' },
  centerName: { fontSize: 13, color: '#3C6E47', marginBottom: 4 },
  shiftDate: { fontSize: 15, fontWeight: '500', color: '#2C4C3B', marginBottom: 2 },
  shiftTime: { fontSize: 13, color: '#66785F', marginBottom: 10 },
  volunteerInfo: { marginBottom: 14 },
  volunteerCount: { fontSize: 13, color: '#444', marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: '#E8F3EC', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3C6E47' },
  signupButton: { backgroundColor: '#3C6E47', padding: 10, borderRadius: 8, alignItems: 'center' },
  signupButtonDisabled: { backgroundColor: '#BDC3C7' },
  signupButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 12 },
  detailRow: { fontSize: 14, color: '#444', marginBottom: 6 },
  modalActions: { flexDirection: 'row', marginTop: 16 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3C6E47', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 14 },
});
