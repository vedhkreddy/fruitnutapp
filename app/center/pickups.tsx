import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CompletedDonation = {
  id: string;
  date: string;
  fruit: string;
  amount_donated_lbs: number;
  volunteer_count: number;
  farm_name: string;
};

export default function CenterPickups() {
  const { centerId } = useApp();
  const [donations, setDonations] = useState<CompletedDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  async function fetchDonations() {
    setLoading(true);
    const { data } = await supabase
      .from('donations')
      .select('*, farms(name)')
      .eq('center_id', centerId)
      .eq('status', 'completed')
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
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => { fetchDonations(); }, [centerId]);

  async function handleMarkPickedUp(id: string) {
    setMarking(id);
    const { error } = await supabase
      .from('donations')
      .update({ status: 'delivered' })
      .eq('id', id);
    setMarking(null);
    if (error) {
      Alert.alert('Error', 'Could not update pickup status.');
    } else {
      fetchDonations();
    }
  }

  const totalLbs = donations.reduce((s, d) => s + d.amount_donated_lbs, 0);

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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalLbs.toFixed(0)} lbs</Text>
            <Text style={styles.summaryLabel}>Ready for Pickup</Text>
            <Text style={styles.summaryCount}>{donations.length} deliveries awaiting pickup</Text>
          </View>
          <Text style={styles.pageTitle}>Ready for Pickup</Text>
        </>
      )}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardFarm}>{item.farm_name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>ASSIGNED</Text>
            </View>
          </View>
          <Text style={styles.cardDate}>{item.date}</Text>
          <Text style={styles.cardFruit}>{item.fruit}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardLbs}>{item.amount_donated_lbs} lbs</Text>
            <Text style={styles.cardVolunteers}>{item.volunteer_count} volunteers</Text>
          </View>
          <TouchableOpacity
            style={[styles.pickupButton, marking === item.id && styles.pickupButtonDisabled]}
            onPress={() => handleMarkPickedUp(item.id)}
            disabled={marking === item.id}
          >
            <Text style={styles.pickupButtonText}>
              {marking === item.id ? 'Updating...' : 'Mark Picked Up'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pickups ready.</Text>
          <Text style={styles.emptySubtext}>Mark donations as assigned in the Assignments tab first.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  summaryCard: { backgroundColor: '#3C6E47', borderRadius: 14, padding: 20, marginBottom: 16, alignItems: 'center' },
  summaryNumber: { fontSize: 32, fontWeight: '700', color: '#fff' },
  summaryLabel: { fontSize: 14, color: '#E8F3EC', marginTop: 4 },
  summaryCount: { fontSize: 12, color: '#B8D4BE', marginTop: 4 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardFarm: { fontSize: 16, fontWeight: '600', color: '#2C4C3B', flex: 1 },
  statusBadge: { backgroundColor: '#E8F3EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#3C6E47' },
  cardDate: { fontSize: 13, color: '#66785F', marginBottom: 2 },
  cardFruit: { fontSize: 14, color: '#2C4C3B', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardLbs: { fontSize: 15, fontWeight: '700', color: '#3C6E47' },
  cardVolunteers: { fontSize: 13, color: '#66785F' },
  pickupButton: { backgroundColor: '#3C6E47', padding: 10, borderRadius: 8, alignItems: 'center' },
  pickupButtonDisabled: { backgroundColor: '#BDC3C7' },
  pickupButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#66785F', fontSize: 14, marginBottom: 8 },
  emptySubtext: { color: '#B0BDB7', fontSize: 12, textAlign: 'center' },
});
