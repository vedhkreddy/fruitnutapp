import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CenterProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Center Profile</Text>
      <Text style={styles.subtitle}>Manage contact info, capacity, and pickup preferences.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#2C4C3B' },
  subtitle: { marginTop: 8, color: '#66785F' },
});
