import { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type DonationCenter = {
  id: string;
  name: string;
  address: string;
  phone: string;
  capacity: string;
  pickupTimes: string;
  dropoffTimes: string;
  acceptedFruits: string[];
  distance: string;
  status: "active" | "full" | "inactive";
  lastDonation: string;
  totalDonated: string;
};

export default function DonationCenters() {
  const [centers] = useState<DonationCenter[]>([
    {
      id: "1",
      name: "City Food Bank",
      address: "123 Main St, Downtown",
      phone: "(555) 100-2000",
      capacity: "500 lbs/week",
      pickupTimes: "Mon-Fri 9AM-5PM",
      dropoffTimes: "Mon-Sat 8AM-6PM",
      acceptedFruits: ["Apples", "Pears", "Oranges"],
      distance: "2.3 miles",
      status: "active",
      lastDonation: "Sep 28, 2025",
      totalDonated: "340 lbs"
    },
    {
      id: "2",
      name: "Community Kitchen",
      address: "456 Oak Ave, Midtown",
      phone: "(555) 200-3000",
      capacity: "200 lbs/week",
      pickupTimes: "Tue-Thu 10AM-3PM",
      dropoffTimes: "Mon-Fri 7AM-4PM",
      acceptedFruits: ["All seasonal fruits"],
      distance: "3.7 miles",
      status: "active",
      lastDonation: "Sep 20, 2025",
      totalDonated: "185 lbs"
    },
    {
      id: "3",
      name: "Harvest Hope",
      address: "789 Elm St, Northside",
      phone: "(555) 300-4000",
      capacity: "300 lbs/week",
      pickupTimes: "Wed-Fri 11AM-4PM",
      dropoffTimes: "Tue-Sat 9AM-5PM",
      acceptedFruits: ["Apples", "Pears"],
      distance: "4.1 miles",
      status: "full",
      lastDonation: "Oct 5, 2025",
      totalDonated: "215 lbs"
    },
    {
      id: "4",
      name: "Neighborhood Pantry",
      address: "321 Pine Rd, Westside",
      phone: "(555) 400-5000",
      capacity: "150 lbs/week",
      pickupTimes: "Mon, Wed, Fri 12PM-4PM",
      dropoffTimes: "Mon-Thu 10AM-3PM",
      acceptedFruits: ["Oranges", "Citrus"],
      distance: "5.8 miles",
      status: "inactive",
      lastDonation: "Aug 15, 2025",
      totalDonated: "95 lbs"
    }
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "active" | "partnerships">("all");

  const filteredCenters = centers.filter(center => {
    if (activeTab === "active") return center.status === "active";
    return true;
  });

  return (
    <>
      {activeTab === "partnerships" ? (
        <ScrollView style={styles.container}>
          <View style={styles.partnershipsContainer}>
            <View style={styles.partnershipCard}>
              <Text style={styles.partnershipTitle}>Partnership Benefits</Text>
              <Text style={styles.partnershipText}>
                • Tax deduction receipts{'\n'}
                • Regular pickup scheduling{'\n'}
                • Impact reporting{'\n'}
                • Volunteer coordination
              </Text>
            </View>
            
            <View style={styles.partnershipCard}>
              <Text style={styles.partnershipTitle}>Requirements</Text>
              <Text style={styles.partnershipText}>
                • Minimum 100 lbs capacity{'\n'}
                • Regular pickup/dropoff hours{'\n'}
                • Food safety certification{'\n'}
                • Volunteer coordination contact
              </Text>
            </View>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Partnership Agreement Template</Text>
              <Text style={styles.actionSubtitle}>Download standard partnership document</Text>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Find New Centers</Text>
                <Text style={styles.actionSubtitle}>Search for food banks and pantries nearby</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionTitle}>Schedule Pickup</Text>
                <Text style={styles.actionSubtitle}>Coordinate pickup times with centers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          style={styles.container}
          data={filteredCenters}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <>
              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{centers.length}</Text>
                  <Text style={styles.statLabel}>Partner Centers</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {centers.filter(c => c.status === "active").length}
                  </Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {centers.reduce((sum, center) => 
                      sum + parseInt(center.totalDonated.split(' ')[0]), 0
                    )} lbs
                  </Text>
                  <Text style={styles.statLabel}>Total Donated</Text>
                </View>
              </View>

              {/* Add Center Button */}
              <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Add New Partner Center</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === "all" && styles.activeTab]}
                  onPress={() => setActiveTab("all")}
                >
                  <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
                    All Centers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === "active" && styles.activeTab]}
                  onPress={() => setActiveTab("active")}
                >
                  <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>
                    Active Partners
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, (activeTab as string) === "partnerships" && styles.activeTab]}
                  onPress={() => setActiveTab("partnerships")}
                >
                  <Text style={[styles.tabText, (activeTab as string) === "partnerships" && styles.activeTabText]}>
                    Partnerships
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          renderItem={({ item }) => (
            <View style={[styles.centerCard, 
              item.status === "full" && styles.fullCard,
              item.status === "inactive" && styles.inactiveCard
            ]}>
              <View style={styles.centerHeader}>
                <View style={styles.centerNameContainer}>
                  <Text style={styles.centerName}>{item.name}</Text>
                  <View style={[styles.statusBadge, 
                    item.status === "full" && styles.fullBadge,
                    item.status === "inactive" && styles.inactiveBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.distance}>{item.distance}</Text>
              </View>

              <Text style={styles.centerAddress}>{item.address}</Text>
              <Text style={styles.centerPhone}>{item.phone}</Text>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Capacity:</Text>
                  <Text style={styles.infoValue}>{item.capacity}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pickup:</Text>
                  <Text style={styles.infoValue}>{item.pickupTimes}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Drop-off:</Text>
                  <Text style={styles.infoValue}>{item.dropoffTimes}</Text>
                </View>
              </View>

              <View style={styles.fruitsSection}>
                <Text style={styles.fruitsLabel}>Accepted fruits:</Text>
                <View style={styles.fruitsContainer}>
                  {item.acceptedFruits.map((fruit, index) => (
                    <View key={index} style={styles.fruitTag}>
                      <Text style={styles.fruitTagText}>{fruit}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.statsSection}>
                <View style={styles.statRow}>
                  <Text style={styles.centerStatLabel}>Last donation:</Text>
                  <Text style={styles.statValue}>{item.lastDonation}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.centerStatLabel}>Total donated:</Text>
                  <Text style={styles.statValueHighlight}>{item.totalDonated}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.assignButton}>
                  <Text style={styles.assignButtonText}>Assign Harvest</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  addButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  addButton: {
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
  addButtonText: {
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
  centerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3C6E47",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  fullCard: {
    borderLeftColor: "#E67E22",
  },
  inactiveCard: {
    borderLeftColor: "#BDC3C7",
    opacity: 0.7,
  },
  centerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  centerNameContainer: {
    flex: 1,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: "#E8F3EC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  fullBadge: {
    backgroundColor: "#FDF2E9",
  },
  inactiveBadge: {
    backgroundColor: "#F4F6F6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3C6E47",
  },
  distance: {
    fontSize: 14,
    color: "#66785F",
    fontWeight: "500",
  },
  centerAddress: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 4,
  },
  centerPhone: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 12,
  },
  infoSection: {
    backgroundColor: "#F8FBF9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#66785F",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#2C4C3B",
    flex: 1,
    textAlign: "right",
  },
  fruitsSection: {
    marginBottom: 12,
  },
  fruitsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C4C3B",
    marginBottom: 6,
  },
  fruitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  fruitTag: {
    backgroundColor: "#E8F3EC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  fruitTagText: {
    fontSize: 12,
    color: "#3C6E47",
    fontWeight: "500",
  },
  statsSection: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  centerStatLabel: {
    fontSize: 14,
    color: "#66785F",
  },
  statValue: {
    fontSize: 14,
    color: "#2C4C3B",
    fontWeight: "500",
  },
  statValueHighlight: {
    fontSize: 14,
    color: "#3C6E47",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactButton: {
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
  contactButtonText: {
    color: "#3C6E47",
    fontWeight: "600",
    fontSize: 14,
  },
  assignButton: {
    backgroundColor: "#3C6E47",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  assignButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  partnershipsContainer: {
    marginBottom: 20,
  },
  partnershipCard: {
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
  partnershipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 12,
  },
  partnershipText: {
    fontSize: 14,
    color: "#66785F",
    lineHeight: 20,
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
});