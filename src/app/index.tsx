import { useEffect, useState } from 'react';

import { Redirect } from 'expo-router';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type Note = {
  id: string;
  content: string;
};

export default function Index() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id ?? '';

  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Učitaj bilješke prijavljenog korisnika.
  useEffect(() => {
    if (!userId) return;

    let active = true;
    setLoading(true);

    async function loadNotes() {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('id, content')
          .eq('user_id', userId);

        if (error) throw error;

        if (active) setNotes(data ?? []);
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Učitavanje bilješki nije uspjelo.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotes();

    return () => {
      active = false;
    };
  }, [userId]);

  if (authLoading) return null;
  if (!session) return <Redirect href="/login" />;

  async function saveNote() {
    const text = content.trim();

    if (!text || !userId || saving) return;

    setSaving(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: text,
          user_id: userId,
        })
        .select('id, content')
        .single();

      if (error) throw error;

      setNotes((previous) => [data, ...previous]);
      setContent('');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Spremanje bilješke nije uspjelo.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setNotes([]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.heading}>Moje bilješke</Text>
        <Button title="Odjava" onPress={logout} />
      </View>

      <Text style={styles.email}>Prijavljen: {session.user.email}</Text>

      {loading ? (
        <Text>Učitavanje bilješki...</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Napiši bilješku..."
            placeholderTextColor="#777"
            value={content}
            onChangeText={setContent}
            multiline
            editable={!saving}
          />

          <Button
            title={saving ? 'Spremanje...' : 'Spremi bilješku'}
            onPress={saveNote}
            disabled={!content.trim() || saving}
          />

          <Text style={styles.subheading}>Spremljene bilješke</Text>

          {notes.length === 0 && (
            <Text>Nema bilješki. Napiši prvu bilješku iznad.</Text>
          )}

          {notes.map((note) => (
            <View key={note.id} style={styles.note}>
              <Text style={styles.noteText}>{note.content}</Text>
            </View>
          ))}
        </>
      )}

      {!!message && <Text style={styles.error}>{message}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 50,
    gap: 16,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  email: {
    color: '#555',
  },

  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },

  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#111',
  },

  note: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },

  noteText: {
    fontSize: 16,
    color: '#111',
  },

  error: {
    color: '#b91c1c',
  },
});