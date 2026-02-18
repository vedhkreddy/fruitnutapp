import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Spring Harvest Season Open',
    body: 'New shifts are being added weekly. Check the Shifts tab to sign up for apple and pear harvests starting this weekend.',
    date: '2026-02-15',
    pinned: true,
  },
  {
    id: '2',
    title: 'Waiver Reminder',
    body: 'All volunteers must have a signed waiver on file before participating. Please sign your waiver in the Waiver tab if you haven\'t already.',
    date: '2026-02-10',
    pinned: false,
  },
  {
    id: '3',
    title: 'New Donation Center: Harvest Hope',
    body: 'Harvest Hope Center has joined the network. Donations from select farms will now be routed to this center.',
    date: '2026-02-05',
    pinned: false,
  },
  {
    id: '4',
    title: 'Thank You — January Recap',
    body: 'Volunteers donated over 1,200 lbs of fresh fruit in January. Thank you for your incredible support!',
    date: '2026-02-01',
    pinned: false,
  },
];

export default function VolunteerMessages() {
  const pinned = ANNOUNCEMENTS.filter(a => a.pinned);
  const rest = ANNOUNCEMENTS.filter(a => !a.pinned);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Messages & Notices</Text>

      {pinned.map(a => (
        <View key={a.id} style={[styles.card, styles.pinnedCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="pin" size={16} color="#3C6E47" style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>{a.title}</Text>
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedBadgeText}>PINNED</Text>
            </View>
          </View>
          <Text style={styles.cardBody}>{a.body}</Text>
          <Text style={styles.cardDate}>{a.date}</Text>
        </View>
      ))}

      <Text style={styles.sectionLabel}>Announcements</Text>

      {rest.map(a => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.cardTitle}>{a.title}</Text>
          <Text style={styles.cardBody}>{a.body}</Text>
          <Text style={styles.cardDate}>{a.date}</Text>
        </View>
      ))}

      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportBody}>Reach out to our support team with any questions about shifts, scheduling, or the app.</Text>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => Linking.openURL('mailto:support@fruitnut.app')}
        >
          <Ionicons name="mail" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#66785F', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#E8F3EC', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  pinnedCard: { borderLeftColor: '#3C6E47' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#2C4C3B', flex: 1 },
  pinnedBadge: { backgroundColor: '#E8F3EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pinnedBadgeText: { fontSize: 10, fontWeight: '700', color: '#3C6E47' },
  cardBody: { fontSize: 13, color: '#66785F', lineHeight: 19, marginBottom: 8 },
  cardDate: { fontSize: 11, color: '#B0BDB7' },
  supportCard: { backgroundColor: '#3C6E47', borderRadius: 14, padding: 16, marginTop: 8, marginBottom: 24 },
  supportTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  supportBody: { fontSize: 13, color: '#B8D4BE', marginBottom: 14, lineHeight: 18 },
  supportButton: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 8, alignItems: 'center', alignSelf: 'flex-start' },
  supportButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
