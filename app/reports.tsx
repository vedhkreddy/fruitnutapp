import { useState } from "react";
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"overview" | "production" | "volunteers" | "impact">("overview");

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'csv' | 'email' | null>(null);

  // Sample data for charts and stats
  const yearlyStats = {
    totalPicked: 2420,
    totalDonated: 2285,
    wastePercentage: 5.6,
    volunteersEngaged: 45,
    shiftsCompleted: 28,
    centersPartnered: 4
  };

  const monthlyData = [
    { month: "Jul", picked: 180, donated: 170 },
    { month: "Aug", picked: 320, donated: 305 },
    { month: "Sep", picked: 450, donated: 425 },
    { month: "Oct", picked: 380, donated: 365 },
  ];

  const fruitBreakdown = [
    { type: "Apples", amount: 1450, percentage: 63.5, color: "#E74C3C" },
    { type: "Pears", amount: 485, percentage: 21.2, color: "#F39C12" },
    { type: "Oranges", amount: 350, percentage: 15.3, color: "#FF9500" },
  ];

  const topVolunteers = [
    { name: "Sarah Johnson", shifts: 12, hours: 48 },
    { name: "Mike Chen", shifts: 8, hours: 32 },
    { name: "Emily Rodriguez", shifts: 6, hours: 24 },
  ];

  const renderOverview = () => (
    <View>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{yearlyStats.totalPicked.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>lbs Picked (YTD)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{yearlyStats.totalDonated.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>lbs Donated (YTD)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{yearlyStats.wastePercentage}%</Text>
          <Text style={styles.metricLabel}>Waste Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{yearlyStats.volunteersEngaged}</Text>
          <Text style={styles.metricLabel}>Active Volunteers</Text>
        </View>
      </View>

      {/* Monthly Trend */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Production Trend</Text>
        <View style={styles.chartArea}>
          {monthlyData.map((data, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barGroup}>
                <View style={[styles.bar, styles.pickedBar, { 
                  height: (data.picked / 500) * 120 
                }]} />
                <View style={[styles.bar, styles.donatedBar, { 
                  height: (data.donated / 500) * 120 
                }]} />
              </View>
              <Text style={styles.barLabel}>{data.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.pickedBar]} />
            <Text style={styles.legendText}>Picked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.donatedBar]} />
            <Text style={styles.legendText}>Donated</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderProduction = () => (
    <View>
      {/* Fruit Type Breakdown */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Fruit Type Distribution</Text>
        {fruitBreakdown.map((fruit, index) => (
          <View key={index} style={styles.fruitRow}>
            <View style={styles.fruitInfo}>
              <Text style={styles.fruitType}>{fruit.type}</Text>
              <Text style={styles.fruitAmount}>{fruit.amount} lbs ({fruit.percentage}%)</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[styles.progressBar, { 
                  width: `${fruit.percentage}%`,
                  backgroundColor: fruit.color 
                }]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Efficiency Metrics */}
      <View style={styles.efficiencyContainer}>
        <Text style={styles.sectionTitle}>Efficiency Metrics</Text>
        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyValue}>93.4%</Text>
            <Text style={styles.efficiencyLabel}>Donation Rate</Text>
          </View>
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyValue}>4.2 hrs</Text>
            <Text style={styles.efficiencyLabel}>Avg Shift Duration</Text>
          </View>
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyValue}>86 lbs</Text>
            <Text style={styles.efficiencyLabel}>Avg per Shift</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderVolunteers = () => (
    <View>
      {/* Volunteer Stats */}
      <View style={styles.volunteerStatsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{yearlyStats.volunteersEngaged}</Text>
          <Text style={styles.statLabel}>Total Volunteers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{yearlyStats.shiftsCompleted}</Text>
          <Text style={styles.statLabel}>Shifts Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
      </View>

      {/* Top Volunteers */}
      <View style={styles.topVolunteersContainer}>
        <Text style={styles.sectionTitle}>Top Contributors</Text>
        {topVolunteers.map((volunteer, index) => (
          <View key={index} style={styles.volunteerRow}>
            <View style={styles.volunteerRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.volunteerInfo}>
              <Text style={styles.volunteerName}>{volunteer.name}</Text>
              <Text style={styles.volunteerStats}>
                {volunteer.shifts} shifts • {volunteer.hours} hours
              </Text>
            </View>
            <View style={styles.volunteerProgress}>
              <View style={[styles.progressBar, { 
                width: `${(volunteer.shifts / 15) * 100}%`,
                backgroundColor: "#3C6E47"
              }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderImpact = () => (
    <View>
      {/* Community Impact */}
      <View style={styles.impactContainer}>
        <Text style={styles.sectionTitle}>Community Impact</Text>
        
        <View style={styles.impactCard}>
          <Text style={styles.impactNumber}>9,140</Text>
          <Text style={styles.impactLabel}>Meals Provided*</Text>
          <Text style={styles.impactNote}>*Based on 0.25 lbs per meal</Text>
        </View>

        <View style={styles.impactCard}>
          <Text style={styles.impactNumber}>$3,427</Text>
          <Text style={styles.impactLabel}>Estimated Food Value</Text>
          <Text style={styles.impactNote}>*Average $1.50/lb market value</Text>
        </View>

        <View style={styles.impactCard}>
          <Text style={styles.impactNumber}>1.2 tons</Text>
          <Text style={styles.impactLabel}>CO₂ Saved from Waste</Text>
          <Text style={styles.impactNote}>*Prevented food waste emissions</Text>
        </View>
      </View>

      {/* Partner Centers Performance */}
      <View style={styles.partnersContainer}>
        <Text style={styles.sectionTitle}>Partner Center Distribution</Text>
        <View style={styles.partnerRow}>
          <Text style={styles.partnerName}>City Food Bank</Text>
          <Text style={styles.partnerAmount}>940 lbs (41%)</Text>
        </View>
        <View style={styles.partnerRow}>
          <Text style={styles.partnerName}>Community Kitchen</Text>
          <Text style={styles.partnerAmount}>685 lbs (30%)</Text>
        </View>
        <View style={styles.partnerRow}>
          <Text style={styles.partnerName}>Harvest Hope</Text>
          <Text style={styles.partnerAmount}>435 lbs (19%)</Text>
        </View>
        <View style={styles.partnerRow}>
          <Text style={styles.partnerName}>Neighborhood Pantry</Text>
          <Text style={styles.partnerAmount}>225 lbs (10%)</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "production" && styles.activeTab]}
          onPress={() => setActiveTab("production")}
        >
          <Text style={[styles.tabText, activeTab === "production" && styles.activeTabText]}>
            Production
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "volunteers" && styles.activeTab]}
          onPress={() => setActiveTab("volunteers")}
        >
          <Text style={[styles.tabText, activeTab === "volunteers" && styles.activeTabText]}>
            Volunteers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "impact" && styles.activeTab]}
          onPress={() => setActiveTab("impact")}
        >
          <Text style={[styles.tabText, activeTab === "impact" && styles.activeTabText]}>
            Impact
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "production" && renderProduction()}
      {activeTab === "volunteers" && renderVolunteers()}
      {activeTab === "impact" && renderImpact()}

      {/* Export Actions */}
      <View style={styles.exportContainer}>
        <Text style={styles.sectionTitle}>Export Reports</Text>
        <TouchableOpacity style={styles.exportButton} onPress={() => { setExportType('pdf'); setShowExportModal(true); }}>
          <Text style={styles.exportButtonText}>📊 Export to PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={() => { setExportType('csv'); setShowExportModal(true); }}>
          <Text style={styles.exportButtonText}>📈 Export to CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton} onPress={() => { setExportType('email'); setShowExportModal(true); }}>
          <Text style={styles.exportButtonText}>📧 Email Report</Text>
        </TouchableOpacity>
      </View>
      {/* Export Modal */}
      <Modal visible={showExportModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Reports</Text>
            <Text style={styles.detailRow}>Preparing {exportType?.toUpperCase()} export...</Text>
            <Text style={{ color: '#66785F', marginTop: 8 }}>
              {/* TODO: Call backend export API with chosen parameters and return a file link or email result. */}
              This will trigger a backend job to generate the requested report and return a downloadable file or send an email.
            </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E8F3EC",
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#3C6E47",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3C6E47",
  },
  activeTabText: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 16,
  },
  
  // Overview styles
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3C6E47",
  },
  metricLabel: {
    fontSize: 12,
    color: "#66785F",
    marginTop: 4,
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: "center",
  },
  barGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: 15,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  pickedBar: {
    backgroundColor: "#3C6E47",
  },
  donatedBar: {
    backgroundColor: "#A3B18A",
  },
  barLabel: {
    fontSize: 12,
    color: "#66785F",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#66785F",
  },

  // Production styles
  fruitRow: {
    marginBottom: 16,
  },
  fruitInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fruitType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
  },
  fruitAmount: {
    fontSize: 14,
    color: "#66785F",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E8F3EC",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  efficiencyContainer: {
    marginTop: 8,
  },
  efficiencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  efficiencyCard: {
    backgroundColor: "#F8FBF9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  efficiencyValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3C6E47",
  },
  efficiencyLabel: {
    fontSize: 12,
    color: "#66785F",
    marginTop: 4,
    textAlign: "center",
  },

  // Volunteers styles
  volunteerStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#E8F3EC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3C6E47",
  },
  statLabel: {
    fontSize: 12,
    color: "#3C6E47",
    marginTop: 4,
    textAlign: "center",
  },
  topVolunteersContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  volunteerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  volunteerRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3C6E47",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
  },
  volunteerStats: {
    fontSize: 12,
    color: "#66785F",
    marginTop: 2,
  },
  volunteerProgress: {
    width: 60,
    height: 6,
    backgroundColor: "#E8F3EC",
    borderRadius: 3,
    overflow: "hidden",
  },

  // Impact styles
  impactContainer: {
    marginBottom: 24,
  },
  impactCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  impactNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3C6E47",
  },
  impactLabel: {
    fontSize: 16,
    color: "#2C4C3B",
    marginTop: 4,
    textAlign: "center",
  },
  impactNote: {
    fontSize: 12,
    color: "#66785F",
    marginTop: 4,
    fontStyle: "italic",
  },
  partnersContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  partnerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 14,
    color: "#2C4C3B",
  },
  partnerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C6E47",
  },

  // Export styles
  exportContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  exportButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C4C3B',
    marginBottom: 8,
  },
  detailRow: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#3C6E47',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});