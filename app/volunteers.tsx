import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Volunteer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  shiftsCompleted: number;
  upcomingShifts: string[];
  status: "active" | "new" | "inactive";
  rating: number;
};

export default function Volunteers() {
  const [volunteers] = useState<Volunteer[]>([
    { 
      id: "1", 
      name: "Sarah Johnson", 
      email: "sarah.j@email.com", 
      phone: "(555) 123-4567",
      shiftsCompleted: 12,
      upcomingShifts: ["Oct 5 - Apples", "Oct 12 - Pears"],
      status: "active",
      rating: 4.8
    },
    { 
      id: "2", 
      name: "Mike Chen", 
      email: "mike.chen@email.com", 
      phone: "(555) 234-5678",
      shiftsCompleted: 8,
      upcomingShifts: ["Oct 5 - Apples"],
      status: "active",
      rating: 4.6
    },
    { 
      id: "3", 
      name: "Emily Rodriguez", 
      email: "emily.r@email.com", 
      phone: "(555) 345-6789",
      shiftsCompleted: 0,
      upcomingShifts: ["Oct 19 - Oranges"],
      status: "new",
      rating: 0
    },
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "new">("all");

  const filteredVolunteers = volunteers.filter(volunteer => {
    if (activeTab === "upcoming") return volunteer.upcomingShifts.length > 0;
    if (activeTab === "new") return volunteer.status === "new";
    return true;
  });

  return (
    <FlatList
      style={styles.container}
      data={filteredVolunteers}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <>
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{volunteers.length}</Text>
              <Text style={styles.statLabel}>Total Volunteers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {volunteers.filter(v => v.upcomingShifts.length > 0).length}
              </Text>
              <Text style={styles.statLabel}>Upcoming Shifts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {volunteers.filter(v => v.status === "new").length}
              </Text>
              <Text style={styles.statLabel}>New This Month</Text>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "all" && styles.activeTab]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
                All Volunteers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>
                Upcoming Shifts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "new" && styles.activeTab]}
              onPress={() => setActiveTab("new")}
            >
              <Text style={[styles.tabText, activeTab === "new" && styles.activeTabText]}>
                New Volunteers
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      renderItem={({ item }) => (
        <View style={[styles.volunteerCard, item.status === "new" && styles.newVolunteerCard]}>
          <View style={styles.volunteerHeader}>
            <View>
              <Text style={styles.volunteerName}>{item.name}</Text>
              {item.status === "new" && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            {item.shiftsCompleted > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {item.rating}</Text>
              </View>
            )}
          </View>

          <Text style={styles.volunteerEmail}>{item.email}</Text>
          <Text style={styles.volunteerPhone}>{item.phone}</Text>
          
          <View style={styles.volunteerStats}>
            <Text style={styles.shiftsCompleted}>
              {item.shiftsCompleted} shifts completed
            </Text>
          </View>

          {item.upcomingShifts.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.upcomingTitle}>Upcoming:</Text>
              {item.upcomingShifts.map((shift, index) => (
                <Text key={index} style={styles.upcomingShift}>• {shift}</Text>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionTitle}>Send Reminder</Text>
            <Text style={styles.actionSubtitle}>Notify volunteers about upcoming shifts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionTitle}>Export Contact List</Text>
            <Text style={styles.actionSubtitle}>Download volunteer contact information</Text>
          </TouchableOpacity>
        </View>
      )}
    />
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#3C6E47",
  },
  statLabel: {
    fontSize: 12,
    color: "#3C6E47",
    marginTop: 4,
    textAlign: "center",
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
  volunteerCard: {
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
  newVolunteerCard: {
    borderLeftColor: "#E67E22",
  },
  volunteerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 4,
  },
  newBadge: {
    backgroundColor: "#E67E22",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  ratingContainer: {
    backgroundColor: "#FDF2E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E67E22",
  },
  volunteerEmail: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 2,
  },
  volunteerPhone: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 8,
  },
  volunteerStats: {
    marginBottom: 12,
  },
  shiftsCompleted: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  upcomingSection: {
    backgroundColor: "#F8FBF9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 4,
  },
  upcomingShift: {
    fontSize: 13,
    color: "#66785F",
    marginBottom: 2,
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
  detailsButton: {
    backgroundColor: "#3C6E47",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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