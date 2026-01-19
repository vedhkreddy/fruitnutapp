import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CenterHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donation Center Dashboard</Text>
      <Text style={styles.subtitle}>Manage pickups, capacity, and assignments.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#2C4C3B' },
  subtitle: { marginTop: 8, color: '#66785F' },
});
