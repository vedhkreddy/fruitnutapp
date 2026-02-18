import { useApp, UserProfile } from '@/lib/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  farmer: 'leaf',
  volunteer: 'hand-left',
  center: 'storefront',
};

function ProfileCard({ profile, onSelect }: { profile: UserProfile; onSelect: () => void }) {
  const label = profile.role === 'farmer'
    ? 'Farmer'
    : profile.role === 'volunteer'
    ? 'Volunteer'
    : 'Donation Center';

  const entityName = profile.role === 'farmer'
    ? null   // farm name not stored directly on profile — shown via label
    : profile.role === 'volunteer'
    ? profile.volunteerName
    : null;

  return (
    <TouchableOpacity style={styles.profileCard} onPress={onSelect} activeOpacity={0.85}>
      <View style={styles.profileCardIcon}>
        <Ionicons name={ROLE_ICONS[profile.role]} size={36} color="#3C6E47" />
      </View>
      <View style={styles.profileCardText}>
        <Text style={styles.profileCardRole}>{label}</Text>
        {entityName ? <Text style={styles.profileCardName}>{entityName}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#66785F" />
    </TouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();
  const { profiles, setActiveProfile, signOut } = useApp();

  function handleSelect(profile: UserProfile) {
    setActiveProfile(profile);
    // _layout.tsx AuthGuard will redirect to /<role>
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>FruitNut</Text>
      <Text style={styles.subtitle}>Choose a role to continue</Text>

      {profiles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No roles set up yet.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/auth/role-setup')}>
            <Text style={styles.primaryButtonText}>Add a Role</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {profiles.map(p => (
            <ProfileCard key={p.id} profile={p} onSelect={() => handleSelect(p)} />
          ))}

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/auth/role-setup')}>
            <Ionicons name="add-circle-outline" size={18} color="#3C6E47" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryButtonText}>Add Another Role</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  content: { padding: 24, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '800', color: '#2C4C3B', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#66785F', marginBottom: 32 },
  profileCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#3C6E47',
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2,
    flexDirection: 'row', alignItems: 'center',
  },
  profileCardIcon: { marginRight: 16 },
  profileCardText: { flex: 1 },
  profileCardRole: { fontSize: 17, fontWeight: '700', color: '#2C4C3B' },
  profileCardName: { fontSize: 13, color: '#66785F', marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 16 },
  emptyText: { color: '#66785F', fontSize: 15 },
  primaryButton: { backgroundColor: '#3C6E47', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3C6E47', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 24 },
  secondaryButtonText: { color: '#3C6E47', fontWeight: '600', fontSize: 15 },
  signOutButton: { alignItems: 'center', paddingVertical: 12 },
  signOutText: { color: '#C0392B', fontWeight: '600', fontSize: 15 },
});
