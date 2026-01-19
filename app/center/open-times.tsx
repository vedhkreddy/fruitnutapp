import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CenterOpenTimes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Times & Capacity</Text>
      <Text style={styles.subtitle}>See donation center open hours and how much they can accept.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C4C3B' },
  subtitle: { marginTop: 8, color: '#66785F' },
});
