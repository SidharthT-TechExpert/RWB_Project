import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/authStore';
import Toast from 'react-native-toast-message';

const BRAND = '#FF6B35';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/users/profile', { name, phone: phone || undefined });
      return data.data;
    },
    onSuccess: (data) => {
      setUser({ ...user!, name: data.name, phone: data.phone });
      qc.invalidateQueries({ queryKey: ['user', 'profile'] });
      Toast.show({ type: 'success', text1: 'Profile updated' });
      router.back();
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update profile' }),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => updateMutation.mutate()} disabled={updateMutation.isPending} style={styles.saveBtn}>
          {updateMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Save size={18} color="#fff" />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar placeholder */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.changePhoto}>Change Photo</Text>
          </View>

          {/* Fields */}
          <View style={styles.form}>
            {[
              { label: 'Full Name', value: name, onChange: setName, placeholder: 'Your full name', keyboard: 'default' as const },
              { label: 'Phone Number', value: phone, onChange: setPhone, placeholder: '+91 9876543210', keyboard: 'phone-pad' as const },
            ].map(({ label, value, onChange, placeholder, keyboard }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder={placeholder}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={keyboard}
                />
              </View>
            ))}

            {/* Email (read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email || ''} editable={false} />
              <Text style={styles.hint}>Contact support to change your email</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  saveBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 24 },
  avatarSection: { alignItems: 'center', gap: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  changePhoto: { fontSize: 14, color: BRAND, fontWeight: '600' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  inputDisabled: { backgroundColor: '#F9FAFB', color: '#9CA3AF' },
  hint: { fontSize: 12, color: '#9CA3AF' },
});
