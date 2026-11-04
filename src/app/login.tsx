import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) return null;
  if (session) return <Redirect href="/" />;

  async function login() {
    if (!email.trim() || !password || busy) return;

    setBusy(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(
        error.message === 'Invalid login credentials'
          ? 'Pogrešan email ili lozinka.'
          : error.message
      );
    }

    setBusy(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Prijava</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={busy ? 'Prijava...' : 'Prijavi se'}
        onPress={login}
        disabled={busy}
      />

      {!!message && <Text style={styles.error}>{message}</Text>}

      <Link href="/register" style={styles.link}>
        Nemaš račun? Registriraj se
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 50,
    gap: 16,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  heading: { fontSize: 28, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111',
  },
  error: { color: '#b91c1c' },
  link: { color: '#208AEF', textAlign: 'center', marginTop: 8 },
});