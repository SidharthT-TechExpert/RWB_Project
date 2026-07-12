import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  User, MapPin, Bell, Heart, CreditCard, HelpCircle,
  ChevronRight, LogOut, Shield, Settings,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import { clearTokens } from '../../src/lib/api';

const BRAND = '#FF6B35';

const MENU_ITEMS = [
  { icon: MapPin, label: 'My Addresses', href: '/profile/addresses' },
  { icon: Heart, label: 'Favourites', href: '/profile/favourites' },
  { icon: CreditCard, label: 'Wallet & Payments', href: '/profile/wallet' },
  { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
  { icon: Shield, label: 'Privacy & Security', href: '/profile/security' },
  { icon: Settings, label: 'App Settings', href: '/profile/settings' },
  { icon: HelpCircle, label: 'Help Centre', href: '/profile/help' },
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileScreen() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const qc = useQueryClient();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          clearUser();
          qc.clear();
          router.replace('/');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <View style={styles.avatar}>
            <User size={36} color="#9CA3AF" />
          </View>
          <Text style={styles.signInTitle}>Sign in to QuickBite</Text>
          <Text style={styles.signInSubtitle}>Access bookings, orders and more</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{getInitials(user?.name || 'U')}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/profile/edit')}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Bookings', value: '—', onPress: () => router.push('/bookings') },
            { label: 'Orders', value: '—', onPress: () => router.push('/orders') },
            { label: 'Reviews', value: '—', onPress: () => {} },
          ].map(({ label, value, onPress }) => (
            <TouchableOpacity key={label} style={styles.statItem} onPress={onPress} activeOpacity={0.7}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map(({ icon: Icon, label, href }) => (
            <TouchableOpacity
              key={label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push(href as never)}
            >
              <View style={styles.menuIcon}>
                <Icon size={18} color="#374151" />
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  signInTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  signInSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  signInBtn: { backgroundColor: BRAND, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 100, marginBottom: 12, width: '100%', alignItems: 'center' },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerText: { fontSize: 14, color: BRAND, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  userEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  roleBadge: { backgroundColor: '#FFF3EE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { fontSize: 11, color: BRAND, fontWeight: '600', textTransform: 'capitalize' },
  editBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderWidth: 1.5, borderColor: BRAND },
  editBtnText: { fontSize: 13, color: BRAND, fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: 1, borderRightColor: '#F3F4F6' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  menuSection: { backgroundColor: '#fff', marginTop: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },
  logoutSection: { backgroundColor: '#fff', marginTop: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});
