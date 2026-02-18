import { DEMO_VOLUNTEER_NAME } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

type Contribution = {
  id: string;
  date: string;
  fruit: string;
  farm_name: string;
  center_name: string;
  amount_picked_lbs: number;
  amount_donated_lbs: number;
};

export default function MyContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContributions() {
      setLoading(true);
      const { data } = await supabase
        .from('shift_signups')
        .select('id, amount_picked_lbs, amount_donated_lbs, shifts(date, fruit, farms(name), donation_centers(name))')
        .eq('volunteer_name', DEMO_VOLUNTEER_NAME)
        .eq('logged_donation', true)
        .order('created_at', { ascending: false });

      if (data) {
        setContributions(
          data.map((row: any) => ({
            id: row.id,
            date: row.shifts?.date ?? '',
            fruit: row.shifts?.fruit ?? '',
            farm_name: row.shifts?.farms?.name ?? 'Unknown Farm',
            center_name: row.shifts?.donation_centers?.name ?? 'Unknown Center',
            amount_picked_lbs: row.amount_picked_lbs ?? 0,
            amount_donated_lbs: row.amount_donated_lbs ?? 0,
          }))
        );
      }
      setLoading(false);
    }
    fetchContributions();
  }, []);

  const totalPicked = contributions.reduce((s, c) => s + Number(c.amount_picked_lbs), 0);
  const totalDonated = contributions.reduce((s, c) => s + Number(c.amount_donated_lbs), 0);

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
      data={contributions}
      keyExtractor={item => item.id}
      ListHeaderComponent={() => (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalDonated} lbs</Text>
            <Text style={styles.summaryLabel}>Total I've Donated</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summarySubStat}>
                <Text style={styles.summarySubNumber}>{totalPicked} lbs</Text>
                <Text style={styles.summarySubLabel}>Total Picked</Text>
              </View>
              <View style={styles.summarySubStat}>
                <Text style={styles.summarySubNumber}>{contributions.length}</Text>
                <Text style={styles.summarySubLabel}>Harvests</Text>
              </View>
            </View>
          </View>
          <Text style={styles.sectionTitle}>My Contribution History</Text>
        </>
      )}
      renderItem={({ item }) => (
        <View style={styles.contributionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.fruitText}>{item.fruit}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <Text style={styles.farmName}>{item.farm_name}</Text>
          <Text style={styles.centerLabel}>→ {item.center_name}</Text>
          <View style={styles.amountsRow}>
            <View style={styles.amountBox}>
              <Text style={styles.amountNumber}>{item.amount_picked_lbs} lbs</Text>
              <Text style={styles.amountLabel}>Picked</Text>
            </View>
            <View style={styles.amountDivider} />
            <View style={styles.amountBox}>
              <Text style={[styles.amountNumber, styles.donatedNumber]}>{item.amount_donated_lbs} lbs</Text>
              <Text style={styles.amountLabel}>Donated</Text>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: '#66785F', fontSize: 15 }}>No contributions logged yet.</Text>
          <Text style={{ color: '#66785F', fontSize: 13, marginTop: 8 }}>Go to My Harvests to log your contributions.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  summaryCard: { backgroundColor: '#3C6E47', borderRadius: 14, padding: 20, marginBottom: 20, alignItems: 'center' },
  summaryNumber: { fontSize: 36, fontWeight: '700', color: '#fff' },
  summaryLabel: { fontSize: 14, color: '#E8F3EC', marginTop: 4, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 32 },
  summarySubStat: { alignItems: 'center' },
  summarySubNumber: { fontSize: 18, fontWeight: '600', color: '#fff' },
  summarySubLabel: { fontSize: 12, color: '#B8D4BE', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2C4C3B', marginBottom: 12 },
  contributionCard: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fruitText: { fontSize: 16, fontWeight: '600', color: '#2C4C3B' },
  dateText: { fontSize: 13, color: '#66785F' },
  farmName: { fontSize: 13, color: '#66785F', fontStyle: 'italic', marginBottom: 2 },
  centerLabel: { fontSize: 13, color: '#3C6E47', marginBottom: 10 },
  amountsRow: { flexDirection: 'row', backgroundColor: '#F8FBF9', borderRadius: 8, padding: 10, alignItems: 'center' },
  amountBox: { flex: 1, alignItems: 'center' },
  amountNumber: { fontSize: 16, fontWeight: '700', color: '#2C4C3B' },
  donatedNumber: { color: '#3C6E47' },
  amountLabel: { fontSize: 12, color: '#66785F', marginTop: 2 },
  amountDivider: { width: 1, height: 30, backgroundColor: '#E8F3EC', marginHorizontal: 8 },
});
