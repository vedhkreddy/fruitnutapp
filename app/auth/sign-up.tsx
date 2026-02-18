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
} from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignUp() {
    if (!email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.replace('/auth/role-setup');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>FruitNut</Text>
        <Text style={styles.heading}>Create Account</Text>

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
          placeholder="Min. 6 characters"
          placeholderTextColor="#B0BDB7"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter password"
          placeholderTextColor="#B0BDB7"
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/sign-in')} style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF9F6', paddingHorizontal: 32, paddingTop: 80, paddingBottom: 40 },
  appName: { fontSize: 28, fontWeight: '800', color: '#2C4C3B', marginBottom: 8 },
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
