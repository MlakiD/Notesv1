import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (loading) return null;
  if (session) return <Redirect href="/" />;

  async function register() {
    if (busy) return;
    setMessage('');
    setSuccess(false);

    if (!email.trim()) return setMessage('Upiši email.');
    if (password.length < 6) return setMessage('Lozinka mora imati barem 6 znakova.');
    if (password !== password2) return setMessage('Lozinke se ne podudaraju.');

    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
    } else if (!data.session) {
      // Supabase traži potvrdu emaila prije prijave.
      setSuccess(true);
      setMessage('Račun je izrađen! Provjeri email, potvrdi račun i zatim se prijavi.');
    }
    // Ako postoji sesija, korisnik je odmah prijavljen i preusmjeren.

    setBusy(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Registracija</Text>

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
        placeholder="Lozinka (barem 6 znakova)"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Ponovi lozinku"
        placeholderTextColor="#777"
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
      />

      <Button
        title={busy ? 'Registracija...' : 'Registriraj se'}
        onPress={register}
        disabled={busy}
      />

      {!!message && (
        <Text style={success ? styles.success : styles.error}>{message}</Text>
      )}

      <Link href="/login" style={styles.link}>
        Već imaš račun? Prijavi se
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
  success: { color: '#15803d' },
  link: { color: '#208AEF', textAlign: 'center', marginTop: 8 },
});