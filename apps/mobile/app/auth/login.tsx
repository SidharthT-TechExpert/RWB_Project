import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { api, setTokens } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/authStore';

const BRAND = '#FF6B35';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { setUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/login', { email, password });
      return data.data;
    },
    onSuccess: async (data) => {
      await setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      setUser(data.user);
      Toast.show({ type: 'success', text1: `Welcome back, ${data.user.name}!` });
      router.replace('/');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Login failed' });
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Text style={{ fontSize: 28 }}>🍽️</Text>
            </View>
            <Text style={styles.logoText}>Quick<Text style={{ color: BRAND }}>Bite</Text></Text>
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, padding: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPw}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ padding: 4 }}>
                  {showPw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} style={styles.forgotLink}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loginMutation.isPending && styles.submitBtnDisabled]}
              onPress={() => loginMutation.mutate()}
              disabled={loginMutation.isPending || !email || !password}
              activeOpacity={0.85}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Truecaller 1-Tap Login */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.truecallerBtn}
              onPress={async () => {
                try {
                  // Attempt 1-Tap verification or test verification endpoint
                  const { data } = await api.post('/auth/truecaller-login', {
                    phone: '+919876543210',
                    name: 'Sidharth T',
                  });
                  await setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
                  setUser(data.data.user);
                  Toast.show({ type: 'success', text1: `Truecaller Login: Welcome ${data.data.user.name}!` });
                  router.replace('/');
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { message?: string } } };
                  Toast.show({ type: 'error', text1: err?.response?.data?.message || 'Truecaller login failed' });
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.truecallerText}>⚡ 1-Tap Verification with Truecaller</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>Create one</Text>
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
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36, marginTop: 12 },
  logoIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 26, fontWeight: '800', color: '#111827' },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, backgroundColor: '#FAFAFA' },
  forgotLink: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 14, color: BRAND, fontWeight: '600' },
  submitBtn: { height: 56, borderRadius: 16, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  truecallerBtn: { height: 56, borderRadius: 16, backgroundColor: '#0087FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#0087FF', shadowOpacity: 0.25, shadowRadius: 8, elevation: 3 },
  truecallerText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15, color: '#6B7280' },
  footerLink: { fontSize: 15, color: BRAND, fontWeight: '700' },
});
