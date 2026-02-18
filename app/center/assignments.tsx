import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PendingDonation = {
  id: string;
  date: string;
  fruit: string;
  amount_donated_lbs: number;
  volunteer_count: number;
  farm_name: string;
  shift_date: string | null;
  shift_fruit: string | null;
};

export default function CenterAssignments() {
  const { centerId } = useApp();
  const [donations, setDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  async function fetchDonations() {
    setLoading(true);
    const { data } = await supabase
      .from('donations')
      .select('*, farms(name), shifts(date, fruit)')
      .eq('center_id', centerId)
      .eq('status', 'pending')
      .order('date', { ascending: false });

    if (data) {
      setDonations(
        data.map((d: any) => ({
          id: d.id,
          date: d.date,
          fruit: d.fruit,
          amount_donated_lbs: Number(d.amount_donated_lbs) || 0,
          volunteer_count: d.volunteer_count ?? 0,
          farm_name: d.farms?.name ?? 'Unknown Farm',
          shift_date: d.shifts?.date ?? null,
          shift_fruit: d.shifts?.fruit ?? null,
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => { fetchDonations(); }, [centerId]);

  async function handleMarkAssigned(id: string) {
    setMarking(id);
    const { error } = await supabase
      .from('donations')
      .update({ status: 'completed' })
      .eq('id', id);
    setMarking(null);
    if (error) {
      Alert.alert('Error', 'Could not update donation status.');
    } else {
      fetchDonations();
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
    <FlatList
      style={styles.container}
      data={donations}
      keyExtractor={item => item.id}
      ListHeaderComponent={() => (
        <>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{donations.length} pending</Text>
          </View>
          <Text style={styles.pageTitle}>Pending Assignments</Text>
        </>
      )}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardFarm}>{item.farm_name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>PENDING</Text>
            </View>
          </View>
          {item.shift_date && (
            <Text style={styles.harvestLabel}>Harvest: {item.shift_date} – {item.shift_fruit}</Text>
          )}
          <Text style={styles.cardDate}>{item.date}</Text>
          <Text style={styles.cardFruit}>{item.fruit}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardLbs}>{item.amount_donated_lbs} lbs</Text>
            <Text style={styles.cardVolunteers}>{item.volunteer_count} volunteers</Text>
          </View>
          <TouchableOpacity
            style={[styles.assignButton, marking === item.id && styles.assignButtonDisabled]}
            onPress={() => handleMarkAssigned(item.id)}
            disabled={marking === item.id}
          >
            <Text style={styles.assignButtonText}>
              {marking === item.id ? 'Updating...' : 'Mark Assigned'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pending donations.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  badge: { backgroundColor: '#E8F3EC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8 },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#3C6E47' },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#E67E22', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardFarm: { fontSize: 16, fontWeight: '600', color: '#2C4C3B', flex: 1 },
  statusBadge: { backgroundColor: '#FDF2E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#E67E22' },
  harvestLabel: { fontSize: 12, color: '#66785F', marginBottom: 2 },
  cardDate: { fontSize: 13, color: '#66785F', marginBottom: 2 },
  cardFruit: { fontSize: 14, color: '#2C4C3B', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardLbs: { fontSize: 15, fontWeight: '700', color: '#3C6E47' },
  cardVolunteers: { fontSize: 13, color: '#66785F' },
  assignButton: { backgroundColor: '#3C6E47', padding: 10, borderRadius: 8, alignItems: 'center' },
  assignButtonDisabled: { backgroundColor: '#BDC3C7' },
  assignButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#66785F', fontSize: 14 },
});
