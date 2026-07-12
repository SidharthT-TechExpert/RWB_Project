import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { api, setTokens } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/authStore';

const BRAND = '#FF6B35';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<'customer' | 'restaurant_owner'>('customer');
  const { setUser } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/register', { name, email, phone: phone || undefined, password, role });
      return data.data;
    },
    onSuccess: async (data) => {
      await setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      Toast.show({ type: 'success', text1: 'Welcome to QuickBite!' });
      router.replace('/');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Registration failed' });
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoIcon}><Text style={{ fontSize: 24 }}>🍽️</Text></View>
            <Text style={styles.logoText}>Quick<Text style={{ color: BRAND }}>Bite</Text></Text>
          </View>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join and start dining smarter</Text>

          {/* Role selector */}
          <View style={styles.roleRow}>
            {([['customer', '🍽️ Diner'], ['restaurant_owner', '🏪 Restaurant']] as const).map(([v, l]) => (
              <TouchableOpacity key={v} style={[styles.roleBtn, role === v && styles.roleBtnActive]} onPress={() => setRole(v)}>
                <Text style={[styles.roleBtnText, role === v && { color: '#fff' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {[
              { label: 'Full Name', value: name, onChange: setName, placeholder: 'John Doe', keyboardType: 'default' as const },
              { label: 'Email', value: email, onChange: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' as const },
              { label: 'Phone (optional)', value: phone, onChange: setPhone, placeholder: '+91 9876543210', keyboardType: 'phone-pad' as const },
            ].map(({ label, value, onChange, placeholder, keyboardType }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#9CA3AF" keyboardType={keyboardType} autoCapitalize="none" />
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]} value={password} onChangeText={setPassword} placeholder="8+ chars, uppercase, number" placeholderTextColor="#9CA3AF" secureTextEntry={!showPw} />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 4 }}>
                  {showPw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, registerMutation.isPending && { opacity: 0.6 }]}
              onPress={() => registerMutation.mutate()}
              disabled={registerMutation.isPending || !name || !email || !password}
              activeOpacity={0.85}
            >
              {registerMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flexGrow: 1, padding: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#111827' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  roleBtnActive: { backgroundColor: BRAND, borderColor: BRAND },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  form: { gap: 18 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, backgroundColor: '#FAFAFA' },
  submitBtn: { height: 56, borderRadius: 16, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 15, color: '#6B7280' },
  footerLink: { fontSize: 15, color: BRAND, fontWeight: '700' },
});
