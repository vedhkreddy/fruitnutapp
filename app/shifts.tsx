import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Shift = {
  id: string;
  date: string;
  time: string;
  fruit: string;
  volunteerLimit: number;
  signedUp: number;
  status: "active" | "full" | "cancelled";
};

export default function ManageShifts() {
  const [shifts] = useState<Shift[]>([
    { id: "1", date: "Oct 5, 2025", time: "9:00 AM - 1:00 PM", fruit: "Apples", volunteerLimit: 8, signedUp: 6, status: "active" },
    { id: "2", date: "Oct 12, 2025", time: "8:00 AM - 12:00 PM", fruit: "Pears", volunteerLimit: 10, signedUp: 10, status: "full" },
    { id: "3", date: "Oct 19, 2025", time: "10:00 AM - 2:00 PM", fruit: "Oranges", volunteerLimit: 6, signedUp: 3, status: "active" },
  ]);

  // Modal & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [form, setForm] = useState({ date: '', time: '', fruit: '', volunteerLimit: '' });

  return (
    <>
    <FlatList
      style={styles.container}
      data={shifts}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <>
          {/* Create New Shift Button */}
          <View style={styles.createButtonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                setEditingShift(null);
                setForm({ date: '', time: '', fruit: '', volunteerLimit: '' });
                setShowCreateModal(true);
              }}
            >
              <Text style={styles.createButtonText}>+ Create New Shift</Text>
            </TouchableOpacity>
          </View>

          {/* Active Shifts */}
          <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
        </>
      )}
      renderItem={({ item }) => (
        <View style={[styles.shiftCard, item.status === "full" && styles.fullCard]}>
          <View style={styles.shiftHeader}>
            <Text style={styles.shiftFruit}>{item.fruit} Picking</Text>
            <View style={[styles.statusBadge, 
              item.status === "full" && styles.fullBadge,
              item.status === "cancelled" && styles.cancelledBadge
            ]}>
              <Text style={styles.statusText}>
                {item.status === "full" ? "FULL" : item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.shiftDate}>{item.date}</Text>
          <Text style={styles.shiftTime}>{item.time}</Text>
          
          <View style={styles.volunteerInfo}>
            <Text style={styles.volunteerCount}>
              {item.signedUp}/{item.volunteerLimit} volunteers signed up
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { 
                  width: `${(item.signedUp / item.volunteerLimit) * 100}%` 
                }]} 
              />
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setEditingShift(item);
                setForm({ date: item.date, time: item.time, fruit: item.fruit, volunteerLimit: String(item.volunteerLimit) });
                setShowCreateModal(true);
              }}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setEditingShift(item);
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
            <Text style={styles.actionTitle}>Duplicate Last Shift</Text>
            <Text style={styles.actionSubtitle}>Copy settings from your most recent shift</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionTitle}>Weekly Template</Text>
            <Text style={styles.actionSubtitle}>Set up recurring weekly shifts</Text>
          </TouchableOpacity>
        </View>
      )}
    />
      {/* Create/Edit Shift Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingShift ? 'Edit Shift' : 'Create New Shift'}</Text>
            <TextInput style={styles.input} placeholder="Date (e.g. Oct 5, 2025)" value={form.date} onChangeText={(t) => setForm({...form, date: t})} />
            <TextInput style={styles.input} placeholder="Time (e.g. 9:00 AM - 1:00 PM)" value={form.time} onChangeText={(t) => setForm({...form, time: t})} />
            <TextInput style={styles.input} placeholder="Fruit" value={form.fruit} onChangeText={(t) => setForm({...form, fruit: t})} />
            <TextInput style={styles.input} placeholder="Volunteer Limit" value={form.volunteerLimit} onChangeText={(t) => setForm({...form, volunteerLimit: t})} keyboardType="numeric" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }]} onPress={() => {
                // TODO: POST /api/shifts (or PUT /api/shifts/:id when editing) with form data
                setShowCreateModal(false);
                setEditingShift(null);
              }}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Shift Details Modal */}
      <Modal visible={showDetailsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Shift Details</Text>
            {editingShift ? (
              <View>
                <Text style={styles.detailRow}>Fruit: {editingShift.fruit}</Text>
                <Text style={styles.detailRow}>Date: {editingShift.date}</Text>
                <Text style={styles.detailRow}>Time: {editingShift.time}</Text>
                <Text style={styles.detailRow}>Signed up: {editingShift.signedUp}/{editingShift.volunteerLimit}</Text>
                <Text style={styles.detailRow}>Status: {editingShift.status}</Text>
              </View>
            ) : <Text>No shift selected</Text>}
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

// Modal state/hooks placed outside the main return so we can reference them

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 16,
  },
  createButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  createButton: {
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
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C4C3B",
    marginBottom: 16,
    marginTop: 8,
  },
  shiftCard: {
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
  fullCard: {
    borderLeftColor: "#E67E22",
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  shiftFruit: {
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
  fullBadge: {
    backgroundColor: "#FDF2E9",
  },
  cancelledBadge: {
    backgroundColor: "#FADBD8",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3C6E47",
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C4C3B",
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: "#66785F",
    marginBottom: 12,
  },
  volunteerInfo: {
    marginBottom: 16,
  },
  volunteerCount: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8F3EC",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3C6E47",
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
  quickActions: {
    marginTop: 24,
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
});