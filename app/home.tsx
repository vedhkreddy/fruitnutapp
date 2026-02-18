import { useApp } from '@/lib/AppContext';
import { useRouter } from 'expo-router';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const { setRole } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FruitNut</Text>
      <Text style={styles.subtitle}>Choose your role to continue</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.roleButton, styles.farmerButton]}
          onPress={() => {
            setRole('farmer');
            router.push('/farmer');
          }}
        >
          <Text style={styles.roleText}>Login as Farmer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, styles.volunteerButton]}
          onPress={() => {
            setRole('volunteer');
            router.push('/volunteer');
          }}
        >
          <Text style={styles.roleText}>Login as Volunteer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, styles.centerButton]}
          onPress={() => {
            setRole('center');
            router.push('/center');
          }}
        >
          <Text style={styles.roleText}>Login as Donation Center</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C4C3B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#66785F",
    textAlign: "center",
    marginBottom: 40,
  },
  buttons: {
    gap: 12,
  },
  roleButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  farmerButton: {
    backgroundColor: "#3C6E47",
  },
  volunteerButton: {
    backgroundColor: "#5A8E6A",
  },
  centerButton: {
    backgroundColor: "#7EA98A",
  },
  roleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
