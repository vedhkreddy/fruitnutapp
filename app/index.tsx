import { useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ShiftOrDonation = {
  id: string;
  date: string;
  fruit: string;
  volunteers: number;
  amount: string;
  type: "upcoming" | "past";
};

export default function Index() {
  const [items] = useState<ShiftOrDonation[]>([
    { id: "1", date: "Oct 5, 2025", fruit: "Apples", volunteers: 8, amount: "120 lbs", type: "upcoming" },
    { id: "2", date: "Sep 20, 2025", fruit: "Oranges", volunteers: 6, amount: "90 lbs", type: "past" },
    { id: "3", date: "Sep 10, 2025", fruit: "Pears", volunteers: 10, amount: "150 lbs", type: "past" },
  ]);

  const upcoming = items.filter((o) => o.type === "upcoming");
  const past = items.filter((o) => o.type === "past");

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farmer Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your farm’s contributions</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>360 lbs</Text>
          <Text style={styles.statLabel}>Total Picked & Donated</Text>
        </View>
      </View>

      {/* Upcoming Shifts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Volunteering Shifts</Text>
      </View>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Shift </Text>
        </TouchableOpacity>
      </View>
      <Text> {'\n'}</Text>
      {upcoming.length > 0 ? (
        <FlatList
          data={upcoming}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.fruit}</Text>
              <Text style={styles.cardSubtitle}>{item.date}</Text>
              <Text style={styles.cardDetail}>Volunteers: {item.volunteers}</Text>
              <Text style={styles.cardDetail}>Estimated: {item.amount}</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No upcoming shifts</Text>
      )}

      {/* Past Donations */}
      <Text style={styles.sectionTitle}>Past Donations</Text>
      {past.length > 0 ? (
        <FlatList
          data={past}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, styles.pastCard]}>
              <Text style={styles.cardTitle}>{item.fruit}</Text>
              <Text style={styles.cardSubtitle}>{item.date}</Text>
              <Text style={styles.cardDetail}>Donated: {item.amount}</Text>
              <Text style={styles.cardDetail}>Volunteers: {item.volunteers}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No past donations</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6", // light neutral
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C4C3B", // rich green
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#66785F",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#E8F3EC",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3C6E47",
  },
  statLabel: {
    fontSize: 14,
    color: "#3C6E47",
    marginTop: 4,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flex: 1, 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C4C3B",
    marginVertical: 12,
  },
  addButtonContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#3C6E47",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 6,
    borderLeftColor: "#3C6E47",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  pastCard: {
    borderLeftColor: "#A3B18A", // muted green for past
    backgroundColor: "#F5F5F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C4C3B",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 13,
    color: "#444",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#3C6E47",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
});