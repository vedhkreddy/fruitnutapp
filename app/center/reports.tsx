import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Donation = {
  id: string;
  date: string;
  fruit: string;
  amount_donated_lbs: number;
  farm_name: string;
};

type FruitStat = { fruit: string; lbs: number; count: number };
type FarmStat = { farm: string; lbs: number; count: number };

export default function CenterReports() {
  const { centerId } = useApp();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'fruit' | 'farm'>('overview');

  useEffect(() => {
    if (!centerId) return;
    supabase
      .from('donations')
      .select('id, date, fruit, amount_donated_lbs, farms(name)')
      .eq('center_id', centerId)
      .neq('status', 'nullified')
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setDonations(
            data.map((d: any) => ({
              id: d.id,
              date: d.date,
              fruit: d.fruit,
              amount_donated_lbs: Number(d.amount_donated_lbs) || 0,
              farm_name: d.farms?.name ?? 'Unknown Farm',
            }))
          );
        }
        setLoading(false);
      });
  }, [centerId]);

  const totalLbs = donations.reduce((s, d) => s + d.amount_donated_lbs, 0);

  const byFruit: FruitStat[] = Object.values(
    donations.reduce((acc: Record<string, FruitStat>, d) => {
      if (!acc[d.fruit]) acc[d.fruit] = { fruit: d.fruit, lbs: 0, count: 0 };
      acc[d.fruit].lbs += d.amount_donated_lbs;
      acc[d.fruit].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.lbs - a.lbs);

  const byFarm: FarmStat[] = Object.values(
    donations.reduce((acc: Record<string, FarmStat>, d) => {
      if (!acc[d.farm_name]) acc[d.farm_name] = { farm: d.farm_name, lbs: 0, count: 0 };
      acc[d.farm_name].lbs += d.amount_donated_lbs;
      acc[d.farm_name].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.lbs - a.lbs);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['overview', 'fruit', 'farm'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'overview' ? 'Overview' : t === 'fruit' ? 'By Fruit' : 'By Farm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' && (
        <ScrollView>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalLbs.toFixed(0)}</Text>
              <Text style={styles.statLabel}>lbs Received</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{donations.length}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{byFarm.length}</Text>
              <Text style={styles.statLabel}>Farms</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Donations</Text>
          {donations.slice(0, 10).map(d => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardFruit}>{d.fruit}</Text>
                <Text style={styles.cardDate}>{d.date}</Text>
              </View>
              <Text style={styles.cardFarm}>{d.farm_name}</Text>
              <Text style={styles.cardLbs}>{d.amount_donated_lbs} lbs</Text>
            </View>
          ))}
          {donations.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No donations received yet.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {tab === 'fruit' && (
        <FlatList
          data={byFruit}
          keyExtractor={item => item.fruit}
          ListHeaderComponent={() => <Text style={styles.sectionTitle}>By Fruit Type</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardFruit}>{item.fruit}</Text>
                <Text style={styles.cardLbs}>{item.lbs.toFixed(0)} lbs</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min((item.lbs / totalLbs) * 100, 100)}%` as any }]} />
              </View>
              <Text style={styles.cardSubtext}>{item.count} donation{item.count !== 1 ? 's' : ''}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No data yet.</Text>
            </View>
          )}
        />
      )}

      {tab === 'farm' && (
        <FlatList
          data={byFarm}
          keyExtractor={item => item.farm}
          ListHeaderComponent={() => <Text style={styles.sectionTitle}>By Farm</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardFarm} numberOfLines={1}>{item.farm}</Text>
                <Text style={styles.cardLbs}>{item.lbs.toFixed(0)} lbs</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min((item.lbs / totalLbs) * 100, 100)}%` as any }]} />
              </View>
              <Text style={styles.cardSubtext}>{item.count} donation{item.count !== 1 ? 's' : ''}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No data yet.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  tabRow: { flexDirection: 'row', backgroundColor: '#E8F3EC', borderRadius: 10, marginBottom: 16, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#66785F' },
  tabTextActive: { color: '#2C4C3B' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#E8F3EC', borderRadius: 12, padding: 14, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#3C6E47' },
  statLabel: { fontSize: 11, color: '#3C6E47', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2C4C3B', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardFruit: { fontSize: 15, fontWeight: '600', color: '#2C4C3B', flex: 1 },
  cardFarm: { fontSize: 13, color: '#66785F', flex: 1 },
  cardDate: { fontSize: 12, color: '#66785F' },
  cardLbs: { fontSize: 15, fontWeight: '700', color: '#3C6E47' },
  cardSubtext: { fontSize: 12, color: '#66785F', marginTop: 6 },
  progressBar: { height: 6, backgroundColor: '#E8F3EC', borderRadius: 3, overflow: 'hidden', marginVertical: 6 },
  progressFill: { height: '100%', backgroundColor: '#3C6E47' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#66785F', fontSize: 14 },
});
