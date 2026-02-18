import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }
    // Check if this user has any profiles; if not, send to role setup
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', data.user.id);
    setLoading(false);
    if (!profiles || profiles.length === 0) {
      router.replace('/auth/role-setup');
    } else {
      router.replace('/home');
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <Text style={styles.appName}>FruitNut</Text>
          <Text style={styles.tagline}>Community Fruit Rescue</Text>
        </View>

        <Text style={styles.heading}>Sign In</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#B0BDB7"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#B0BDB7"
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/sign-up')} style={styles.linkRow}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9F6', paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 48 },
  appName: { fontSize: 36, fontWeight: '800', color: '#2C4C3B' },
  tagline: { fontSize: 14, color: '#66785F', marginTop: 4 },
  heading: { fontSize: 24, fontWeight: '700', color: '#2C4C3B', marginBottom: 24 },
  errorText: { color: '#C0392B', marginBottom: 12, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '500', color: '#2C4C3B', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E8F3EC', borderRadius: 8, padding: 12, backgroundColor: '#fff', color: '#2C4C3B', fontSize: 16, marginBottom: 16 },
  primaryButton: { backgroundColor: '#3C6E47', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkRow: { alignItems: 'center', marginTop: 24 },
  linkText: { color: '#66785F', fontSize: 14 },
  linkBold: { color: '#3C6E47', fontWeight: '600' },
});
