import { useState } from "react";
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Donation = {
  id: string;
  date: string;
  fruit: string;
  amountPicked: string;
  amountDonated: string;
  center: string;
  volunteers: number;
  status: "completed" | "pending" | "delivered";
};

export default function Donations() {
  const [donations] = useState<Donation[]>([
    { 
      id: "1", 
      date: "Sep 28, 2025", 
      fruit: "Apples", 
      amountPicked: "150 lbs", 
      amountDonated: "140 lbs",
      center: "City Food Bank",
      volunteers: 8,
      status: "completed"
    },
    { 
      id: "2", 
      date: "Sep 20, 2025", 
      fruit: "Oranges", 
      amountPicked: "90 lbs", 
      amountDonated: "85 lbs",
      center: "Community Kitchen",
      volunteers: 6,
      status: "completed"
    },
    { 
      id: "3", 
      date: "Oct 5, 2025", 
      fruit: "Apples", 
      amountPicked: "120 lbs", 
      amountDonated: "115 lbs",
      center: "Harvest Hope",
      volunteers: 8,
      status: "pending"
    },
  ]);

  const [activeTab, setActiveTab] = useState<"recent" | "pending" | "analytics">("recent");

  const totalPicked = donations.reduce((sum, donation) => 
    sum + parseInt(donation.amountPicked.split(' ')[0]), 0
  );
  
  const totalDonated = donations.reduce((sum, donation) => 
    sum + parseInt(donation.amountDonated.split(' ')[0]), 0
  );

  // Modal state and form state for donation actions
  const [showLogModal, setShowLogModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [form, setForm] = useState({ date: '', fruit: '', amountPicked: '', amountDonated: '', center: '', volunteers: '' });

  return (
    <>
      {activeTab === "analytics" ? (
        <ScrollView style={styles.container}>
          {/* Tab Navigation - allow switching back from analytics */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "recent" && styles.activeTab]}
              onPress={() => setActiveTab("recent")}
            >
              <Text style={[styles.tabText, activeTab === "recent" && styles.activeTabText]}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "pending" && styles.activeTab]}
              onPress={() => setActiveTab("pending")}
            >
              <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, (activeTab as string) === "analytics" && styles.activeTab]}
              onPress={() => setActiveTab("analytics")}
            >
              <Text style={[styles.tabText, (activeTab as string) === "analytics" && styles.activeTabText]}>Analytics</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Donation Efficiency</Text>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Average waste:</Text>
                <Text style={styles.efficiencyValue}>6.7%</Text>
              </View>
              <View style={styles.efficiencyRow}>
                <Text style={styles.efficiencyLabel}>Best month:</Text>
                <Text style={styles.efficiencyValue}>September</Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Top Donation Centers</Text>
              <View style={styles.centerRank}>
                <Text style={styles.centerName}>1. City Food Bank</Text>
                <Text style={styles.centerAmount}>140 lbs</Text>
              </View>
              <View style={styles.centerRank}>
                <Text style={styles.centerName}>2. Harvest Hope</Text>
                <Text style={styles.centerAmount}>115 lbs</Text>
              </View>
              <View style={styles.centerRank}>
                <Text style={styles.centerName}>3. Community Kitchen</Text>
                <Text style={styles.centerAmount}>85 lbs</Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Fruit Type Breakdown</Text>
              <View style={styles.fruitBreakdown}>
                <View style={styles.fruitRow}>
                  <Text style={styles.fruitType}>🍎 Apples</Text>
                  <Text style={styles.fruitAmount}>255 lbs (74%)</Text>
                </View>
                <View style={styles.fruitRow}>
                  <Text style={styles.fruitType}>🍊 Oranges</Text>
                  <Text style={styles.fruitAmount}>85 lbs (26%)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Export Donation Records</Text>
              <Text style={styles.actionSubtitle}>Download donation history for tax purposes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Generate Impact Report</Text>
              <Text style={styles.actionSubtitle}>Create summary of your community impact</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          style={styles.container}
          data={activeTab === "pending" ? 
            donations.filter(d => d.status === "pending") : 
            donations
          }
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              {/* Quick Stats */}
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

              {/* Log New Donation Button */}
                  <View style={styles.logButtonContainer}>
                    <TouchableOpacity
                      style={styles.logButton}
                      onPress={() => {
                        setEditingDonation(null);
                        setForm({ date: '', fruit: '', amountPicked: '', amountDonated: '', center: '', volunteers: '' });
                        setShowLogModal(true);
                      }}
                    >
                      <Text style={styles.logButtonText}>+ Log New Donation</Text>
                    </TouchableOpacity>
                  </View>

              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === "recent" && styles.activeTab]}
                  onPress={() => setActiveTab("recent")}
                >
                  <Text style={[styles.tabText, activeTab === "recent" && styles.activeTabText]}>
                    Recent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === "pending" && styles.activeTab]}
                  onPress={() => setActiveTab("pending")}
                >
                  <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
                    Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, (activeTab as string) === "analytics" && styles.activeTab]}
                  onPress={() => setActiveTab("analytics")}
                >
                  <Text style={[styles.tabText, (activeTab as string) === "analytics" && styles.activeTabText]}>
                    Analytics
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          renderItem={({ item }) => (
            <View style={[styles.donationCard, 
              item.status === "pending" && styles.pendingCard
            ]}>
              <View style={styles.donationHeader}>
                <Text style={styles.donationFruit}>{item.fruit}</Text>
                <View style={[styles.statusBadge, 
                  item.status === "pending" && styles.pendingBadge,
                  item.status === "delivered" && styles.deliveredBadge
                ]}>
                  <Text style={styles.statusText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.donationDate}>{item.date}</Text>
              <Text style={styles.donationCenter}>→ {item.center}</Text>
              
              <View style={styles.amountContainer}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Picked:</Text>
                  <Text style={styles.amountValue}>{item.amountPicked}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Donated:</Text>
                  <Text style={styles.amountValueHighlight}>{item.amountDonated}</Text>
                </View>
              </View>
              
              <Text style={styles.volunteerInfo}>
                {item.volunteers} volunteers participated
              </Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setEditingDonation(item);
                    setForm({
                      date: item.date,
                      fruit: item.fruit,
                      amountPicked: item.amountPicked,
                      amountDonated: item.amountDonated,
                      center: item.center,
                      volunteers: String(item.volunteers),
                    });
                    setShowLogModal(true);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    setEditingDonation(item);
                    setShowDetailsModal(true);
                  }}
                >
                  <Text style={styles.primaryButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Export Donation Records</Text>
                <Text style={styles.actionSubtitle}>Download donation history for tax purposes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Generate Impact Report</Text>
                <Text style={styles.actionSubtitle}>Create summary of your community impact</Text>
              </TouchableOpacity>
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
              <TextInput style={styles.input} placeholder="Oct 5, 2025" value={form.date} onChangeText={(t) => setForm({...form, date: t})} />

              <Text style={styles.inputLabel}>Crop / Fruit</Text>
              <TextInput style={styles.input} placeholder="Apples" value={form.fruit} onChangeText={(t) => setForm({...form, fruit: t})} />

              <Text style={styles.inputLabel}>Amount Picked</Text>
              <TextInput style={styles.input} placeholder="120 lbs" value={form.amountPicked} onChangeText={(t) => setForm({...form, amountPicked: t})} />

              <Text style={styles.inputLabel}>Amount Donated</Text>
              <TextInput style={styles.input} placeholder="115 lbs" value={form.amountDonated} onChangeText={(t) => setForm({...form, amountDonated: t})} />

              <Text style={styles.inputLabel}>Donation Center</Text>
              <TextInput style={styles.input} placeholder="City Food Bank" value={form.center} onChangeText={(t) => setForm({...form, center: t})} />

              <Text style={styles.inputLabel}>Volunteers</Text>
              <TextInput style={styles.input} placeholder="8" value={form.volunteers} onChangeText={(t) => setForm({...form, volunteers: t})} keyboardType="numeric" />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowLogModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]}
                onPress={() => {
                  // TODO: send POST (or PUT if editing) to backend API to save donation
                  // Example: await api.post('/donations', { ...form })
                  setShowLogModal(false);
                  setEditingDonation(null);
                }}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
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
            {editingDonation ? (
              <View>
                <Text style={styles.detailRow}>Fruit: {editingDonation.fruit}</Text>
                <Text style={styles.detailRow}>Date: {editingDonation.date}</Text>
                <Text style={styles.detailRow}>Picked: {editingDonation.amountPicked}</Text>
                <Text style={styles.detailRow}>Donated: {editingDonation.amountDonated}</Text>
                <Text style={styles.detailRow}>Center: {editingDonation.center}</Text>
                <Text style={styles.detailRow}>Volunteers: {editingDonation.volunteers}</Text>
                <Text style={styles.detailRow}>Status: {editingDonation.status}</Text>
              </View>
            ) : (
              <Text>No donation selected</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
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
  logButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logButton: {
    backgroundColor: "#3C6E47",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  logButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#3C6E47",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3C6E47",
  },
  activeTabText: {
    color: "#fff",
  },
  donationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3C6E47",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  pendingCard: {
    borderLeftColor: "#E67E22",
  },
  donationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  donationFruit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
  },
  statusBadge: {
    backgroundColor: "#E8F3EC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadge: {
    backgroundColor: "#FDF2E9",
  },
  deliveredBadge: {
    backgroundColor: "#E8F3EC",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3C6E47",
  },
  donationDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
    marginBottom: 4,
  },
  donationCenter: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 12,
    fontStyle: "italic",
  },
  amountContainer: {
    backgroundColor: "#F8FBF9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: "#66785F",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C4C3B",
  },
  amountValueHighlight: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C6E47",
  },
  volunteerInfo: {
    fontSize: 13,
    color: "#444",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryButton: {
    backgroundColor: "#3C6E47",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3C6E47",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#3C6E47",
    fontWeight: "600",
    fontSize: 14,
  },
  analyticsContainer: {
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 12,
  },
  efficiencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  efficiencyLabel: {
    fontSize: 14,
    color: "#66785F",
  },
  efficiencyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C6E47",
  },
  centerRank: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  centerName: {
    fontSize: 14,
    color: "#2C4C3B",
  },
  centerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C6E47",
  },
  fruitBreakdown: {
    marginTop: 8,
  },
  fruitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fruitType: {
    fontSize: 14,
    color: "#2C4C3B",
  },
  fruitAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C6E47",
  },
  quickActions: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 16,
  },
  actionCard: {
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
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#66785F",
  },
  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C4C3B',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8F3EC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FAF9F6',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  detailRow: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalClose: {
    fontSize: 20,
    color: '#66785F',
  },
  inputLabel: {
    fontSize: 13,
    color: '#2C4C3B',
    marginBottom: 6,
    fontWeight: '600',
  },
});