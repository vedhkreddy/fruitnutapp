import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function VolunteerFarms() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farms</Text>
      <Text style={styles.subtitle}>Discover farms where you can volunteer.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C4C3B' },
  subtitle: { marginTop: 8, color: '#66785F' },
});
