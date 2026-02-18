import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DonationRow = {
  date: string;
  fruit: string;
  amount_picked_lbs: number;
  amount_donated_lbs: number;
  volunteer_count: number;
  donation_centers: { name: string } | null;
};

export default function Reports() {
  const { farmId } = useApp();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [shiftCount, setShiftCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "production" | "volunteers" | "impact">("overview");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'csv' | 'email' | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [donRes, shiftRes] = await Promise.all([
        supabase
          .from('donations')
          .select('date, fruit, amount_picked_lbs, amount_donated_lbs, volunteer_count, donation_centers(name)')
          .eq('farm_id', farmId),
        supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('farm_id', farmId).eq('status', 'active'),
      ]);
      if (donRes.data) setDonations(donRes.data as DonationRow[]);
      if (shiftRes.count != null) setShiftCount(shiftRes.count);
      setLoading(false);
    }
    fetchData();
  }, [farmId]);

  const totalPicked = donations.reduce((s, d) => s + Number(d.amount_picked_lbs), 0);
  const totalDonated = donations.reduce((s, d) => s + Number(d.amount_donated_lbs), 0);
  const wasteRate = totalPicked > 0 ? (((totalPicked - totalDonated) / totalPicked) * 100).toFixed(1) : '0.0';
  const totalVolunteers = donations.reduce((s, d) => s + d.volunteer_count, 0);

  // Fruit breakdown
  const fruitTotals = donations.reduce<Record<string, number>>((acc, d) => {
    acc[d.fruit] = (acc[d.fruit] ?? 0) + Number(d.amount_donated_lbs);
    return acc;
  }, {});
  const fruitList = Object.entries(fruitTotals).map(([type, amount]) => ({
    type,
    amount,
    percentage: totalDonated > 0 ? ((amount / totalDonated) * 100).toFixed(1) : '0.0',
    color: ['#E74C3C', '#F39C12', '#FF9500', '#27AE60', '#3498DB'][Object.keys(fruitTotals).indexOf(type) % 5],
  }));

  // Center breakdown
  const centerTotals = donations.reduce<Record<string, number>>((acc, d) => {
    const name = d.donation_centers?.name ?? 'Unknown';
    acc[name] = (acc[name] ?? 0) + Number(d.amount_donated_lbs);
    return acc;
  }, {});
  const centerList = Object.entries(centerTotals).sort((a, b) => b[1] - a[1]);

  const renderOverview = () => (
    <View>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{totalPicked.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>lbs Picked (Total)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{totalDonated.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>lbs Donated (Total)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{wasteRate}%</Text>
          <Text style={styles.metricLabel}>Waste Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{totalVolunteers}</Text>
          <Text style={styles.metricLabel}>Volunteer Shifts</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Summary</Text>
        <View style={styles.efficiencyRow}>
          <Text style={styles.efficiencyLabel}>Total Donations Logged:</Text>
          <Text style={styles.efficiencyValue}>{donations.length}</Text>
        </View>
        <View style={styles.efficiencyRow}>
          <Text style={styles.efficiencyLabel}>Active Shifts:</Text>
          <Text style={styles.efficiencyValue}>{shiftCount}</Text>
        </View>
        <View style={styles.efficiencyRow}>
          <Text style={styles.efficiencyLabel}>Partner Centers:</Text>
          <Text style={styles.efficiencyValue}>{centerList.length}</Text>
        </View>
      </View>
    </View>
  );

  const renderProduction = () => (
    <View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Fruit Type Distribution</Text>
        {fruitList.length === 0 && <Text style={{ color: '#66785F' }}>No data yet</Text>}
        {fruitList.map((fruit) => (
          <View key={fruit.type} style={styles.fruitRow}>
            <View style={styles.fruitInfo}>
              <Text style={styles.fruitType}>{fruit.type}</Text>
              <Text style={styles.fruitAmount}>{fruit.amount} lbs ({fruit.percentage}%)</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${fruit.percentage}%`, backgroundColor: fruit.color }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.efficiencyContainer}>
        <Text style={styles.sectionTitle}>Efficiency Metrics</Text>
        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyValue2}>{totalPicked > 0 ? (100 - Number(wasteRate)).toFixed(1) : '—'}%</Text>
            <Text style={styles.efficiencyLabel}>Donation Rate</Text>
          </View>
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyValue2}>{donations.length > 0 ? (totalPicked / donations.length).toFixed(0) : '—'}</Text>
            <Text style={styles.efficiencyLabel}>Avg lbs/Harvest</Text>
          </View>
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyValue2}>{donations.length}</Text>
            <Text style={styles.efficiencyLabel}>Harvests Total</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderVolunteers = () => (
    <View>
      <View style={styles.volunteerStatsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalVolunteers}</Text>
          <Text style={styles.statLabel}>Volunteer Slots Filled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{shiftCount}</Text>
          <Text style={styles.statLabel}>Active Shifts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{donations.length}</Text>
          <Text style={styles.statLabel}>Donations</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Volunteer Activity by Donation</Text>
        {donations.slice(0, 5).map((d, i) => (
          <View key={i} style={styles.volunteerRow}>
            <View style={styles.volunteerInfo}>
              <Text style={styles.volunteerName}>{d.fruit} — {d.date}</Text>
              <Text style={styles.volunteerStats}>{d.volunteer_count} volunteers</Text>
            </View>
          </View>
        ))}
        {donations.length === 0 && <Text style={{ color: '#66785F' }}>No donation data yet</Text>}
      </View>
    </View>
  );

  const renderImpact = () => {
    const meals = Math.round(totalDonated / 0.25);
    const foodValue = (totalDonated * 1.5).toFixed(0);
    const co2Saved = (totalDonated * 0.0005).toFixed(2);

    return (
      <View>
        <View style={styles.impactContainer}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{meals.toLocaleString()}</Text>
            <Text style={styles.impactLabel}>Meals Provided*</Text>
            <Text style={styles.impactNote}>*Based on 0.25 lbs per meal</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>${Number(foodValue).toLocaleString()}</Text>
            <Text style={styles.impactLabel}>Estimated Food Value</Text>
            <Text style={styles.impactNote}>*Average $1.50/lb market value</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactNumber}>{co2Saved} tons</Text>
            <Text style={styles.impactLabel}>CO₂ Saved from Waste</Text>
            <Text style={styles.impactNote}>*Prevented food waste emissions</Text>
          </View>
        </View>

        <View style={styles.partnersContainer}>
          <Text style={styles.sectionTitle}>Partner Center Distribution</Text>
          {centerList.map(([name, amt]) => (
            <View key={name} style={styles.partnerRow}>
              <Text style={styles.partnerName}>{name}</Text>
              <Text style={styles.partnerAmount}>{amt} lbs ({totalDonated > 0 ? ((amt / totalDonated) * 100).toFixed(0) : 0}%)</Text>
            </View>
          ))}
          {centerList.length === 0 && <Text style={{ color: '#66785F' }}>No partner centers yet</Text>}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        {(['overview', 'production', 'volunteers', 'impact'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "overview" && renderOverview()}
      {activeTab === "production" && renderProduction()}
      {activeTab === "volunteers" && renderVolunteers()}
      {activeTab === "impact" && renderImpact()}

      <View style={styles.exportContainer}>
        <Text style={styles.sectionTitle}>Export Reports</Text>
        {(['pdf', 'csv', 'email'] as const).map(t => (
          <TouchableOpacity key={t} style={styles.exportButton} onPress={() => { setExportType(t); setShowExportModal(true); }}>
            <Text style={styles.exportButtonText}>
              {t === 'pdf' ? '📊' : t === 'csv' ? '📈' : '📧'} Export to {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showExportModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Reports</Text>
            <Text style={styles.detailRow}>Preparing {exportType?.toUpperCase()} export...</Text>
            <Text style={{ color: '#66785F', marginTop: 8 }}>Export functionality coming soon.</Text>
            <View style={[styles.modalActions, { marginTop: 12 }]}>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => setShowExportModal(false)}>
                <Text style={styles.primaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F6", padding: 16 },
  tabContainer: { flexDirection: "row", backgroundColor: "#E8F3EC", borderRadius: 12, marginBottom: 20, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, alignItems: "center" },
  activeTab: { backgroundColor: "#3C6E47" },
  tabText: { fontSize: 13, fontWeight: "500", color: "#3C6E47" },
  activeTabText: { color: "#fff" },
  sectionTitle: { fontSize: 20, fontWeight: "600", color: "#2C4C3B", marginBottom: 16 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  metricCard: { backgroundColor: "#fff", width: "48%", padding: 16, borderRadius: 12, marginBottom: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  metricNumber: { fontSize: 24, fontWeight: "bold", color: "#3C6E47" },
  metricLabel: { fontSize: 12, color: "#66785F", marginTop: 4, textAlign: "center" },
  chartContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  chartTitle: { fontSize: 18, fontWeight: "600", color: "#2C4C3B", marginBottom: 16 },
  efficiencyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  efficiencyLabel: { fontSize: 14, color: "#66785F" },
  efficiencyValue: { fontSize: 14, fontWeight: "600", color: "#3C6E47" },
  fruitRow: { marginBottom: 16 },
  fruitInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  fruitType: { fontSize: 16, fontWeight: "500", color: "#2C4C3B" },
  fruitAmount: { fontSize: 14, color: "#66785F" },
  progressBarContainer: { height: 8, backgroundColor: "#E8F3EC", borderRadius: 4, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 4 },
  efficiencyContainer: { marginTop: 8 },
  efficiencyGrid: { flexDirection: "row", justifyContent: "space-between" },
  efficiencyCard: { backgroundColor: "#F8FBF9", padding: 16, borderRadius: 12, alignItems: "center", flex: 1, marginHorizontal: 4 },
  efficiencyValue2: { fontSize: 20, fontWeight: "bold", color: "#3C6E47" },
  volunteerStatsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statCard: { backgroundColor: "#E8F3EC", borderRadius: 12, padding: 16, alignItems: "center", flex: 1, marginHorizontal: 4 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#3C6E47" },
  statLabel: { fontSize: 12, color: "#3C6E47", marginTop: 4, textAlign: "center" },
  volunteerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  volunteerInfo: { flex: 1 },
  volunteerName: { fontSize: 16, fontWeight: "500", color: "#2C4C3B" },
  volunteerStats: { fontSize: 12, color: "#66785F", marginTop: 2 },
  impactContainer: { marginBottom: 24 },
  impactCard: { backgroundColor: "#fff", padding: 20, borderRadius: 12, marginBottom: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  impactNumber: { fontSize: 28, fontWeight: "bold", color: "#3C6E47" },
  impactLabel: { fontSize: 16, color: "#2C4C3B", marginTop: 4, textAlign: "center" },
  impactNote: { fontSize: 12, color: "#66785F", marginTop: 4, fontStyle: "italic" },
  partnersContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  partnerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  partnerName: { fontSize: 14, color: "#2C4C3B" },
  partnerAmount: { fontSize: 14, fontWeight: "600", color: "#3C6E47" },
  exportContainer: { marginTop: 24, marginBottom: 32 },
  exportButton: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 2 },
  exportButtonText: { fontSize: 16, fontWeight: "500", color: "#2C4C3B", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2C4C3B', marginBottom: 8 },
  detailRow: { fontSize: 14, color: '#444', marginBottom: 8 },
  modalActions: { flexDirection: 'row' },
  primaryButton: { backgroundColor: '#3C6E47', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
