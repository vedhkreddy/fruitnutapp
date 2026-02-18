import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const WAIVER_TEXT = `VOLUNTEER WAIVER AND RELEASE OF LIABILITY

By agreeing to this waiver, you acknowledge and agree to the following:

1. ASSUMPTION OF RISK
You understand that volunteering for fruit harvesting activities involves physical labor and potential risks, including but not limited to: climbing ladders, carrying heavy loads, working in outdoor environments, exposure to sun, heat, insects, and allergens.

2. RELEASE OF LIABILITY
You release FruitNut, its organizers, farm owners, and affiliated donation centers from any and all claims, damages, losses, or expenses arising from your participation in volunteer activities.

3. MEDICAL CONDITIONS
You confirm that you are physically capable of performing volunteer activities and will notify organizers of any medical conditions that may affect your participation.

4. PHOTO RELEASE
You consent to being photographed or filmed during volunteer events. These images may be used for promotional and educational purposes.

5. CODE OF CONDUCT
You agree to follow all safety guidelines provided by farm owners and coordinators, treat all participants with respect, and take reasonable care of equipment and property.

6. EMERGENCY CONTACT
You authorize organizers to obtain emergency medical treatment on your behalf if you are unable to communicate your wishes.

By tapping "I Agree" below, you confirm that you have read, understood, and agree to all terms of this waiver.`;

export default function VolunteerWaiver() {
  const { session, refreshProfiles } = useApp();
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [waiverAgreedAt, setWaiverAgreedAt] = useState<string | null>(null);
  const [profileId, setProfileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('user_profiles')
      .select('id, waiver_agreed, waiver_agreed_at')
      .eq('user_id', session.user.id)
      .eq('role', 'volunteer')
      .single()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id);
          setWaiverAgreed(data.waiver_agreed ?? false);
          setWaiverAgreedAt(data.waiver_agreed_at ?? null);
        }
        setLoading(false);
      });
  }, [session?.user?.id]);

  async function handleAgree() {
    setSaving(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('user_profiles')
      .update({ waiver_agreed: true, waiver_agreed_at: now })
      .eq('id', profileId);
    setSaving(false);
    if (error) {
      Alert.alert('Error', 'Could not save waiver agreement. Please try again.');
      return;
    }
    setWaiverAgreed(true);
    setWaiverAgreedAt(now);
    await refreshProfiles();
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3C6E47" />
      </View>
    );
  }

  if (waiverAgreed) {
    const dateStr = waiverAgreedAt
      ? new Date(waiverAgreedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'on file';

    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <View style={styles.signedCard}>
          <Text style={styles.signedIcon}>✓</Text>
          <Text style={styles.signedTitle}>Waiver Signed</Text>
          <Text style={styles.signedDate}>Agreed on {dateStr}</Text>
          <Text style={styles.signedSubtext}>
            Thank you for signing the volunteer waiver. You are cleared to participate in harvest activities.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Volunteer Waiver</Text>
      <Text style={styles.subtitle}>Please read and agree to the waiver to participate in harvests.</Text>

      <ScrollView style={styles.waiverScroll} contentContainerStyle={styles.waiverContent}>
        <Text style={styles.waiverText}>{WAIVER_TEXT}</Text>
      </ScrollView>

      <TouchableOpacity style={styles.agreeButton} onPress={handleAgree} disabled={saving}>
        <Text style={styles.agreeButtonText}>{saving ? 'Saving...' : 'I Agree'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6', padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#66785F', marginBottom: 16 },
  waiverScroll: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E8F3EC', marginBottom: 16 },
  waiverContent: { padding: 16 },
  waiverText: { fontSize: 13, color: '#2C4C3B', lineHeight: 20 },
  agreeButton: { backgroundColor: '#3C6E47', padding: 14, borderRadius: 8, alignItems: 'center' },
  agreeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  signedCard: { backgroundColor: '#fff', borderRadius: 14, padding: 28, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#3C6E47', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2, width: '100%' },
  signedIcon: { fontSize: 48, color: '#3C6E47', marginBottom: 12 },
  signedTitle: { fontSize: 22, fontWeight: '700', color: '#2C4C3B', marginBottom: 6 },
  signedDate: { fontSize: 14, color: '#3C6E47', fontWeight: '600', marginBottom: 12 },
  signedSubtext: { fontSize: 13, color: '#66785F', textAlign: 'center', lineHeight: 20 },
});
