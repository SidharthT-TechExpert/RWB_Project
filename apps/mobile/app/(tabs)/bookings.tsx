import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/authStore';

const BRAND = '#FF6B35';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF9C3', text: '#854D0E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  checked_in: { bg: '#EDE9FE', text: '#5B21B6' },
  completed: { bg: '#DCFCE7', text: '#166534' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/my');
      return data;
    },
    enabled: isAuthenticated,
  });

  const bookings = (data?.data || []).filter((b: { status: string }) => activeTab === 'all' || b.status === activeTab);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.emptyTitle}>Sign in to view bookings</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.ctaBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>My Bookings</Text>

      {/* Status tabs */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_TABS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.tabList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === item && styles.tabActive]}
            onPress={() => setActiveTab(item)}
          >
            <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]} className="capitalize">
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator color={BRAND} size="large" /></View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/booking/${item._id}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                    <Text style={styles.bookingNumber}>{item.bookingNumber}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={13} color="#6B7280" />
                    <Text style={styles.metaText}>{formatDate(item.reservationDate)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={13} color="#6B7280" />
                    <Text style={styles.metaText}>{item.reservationTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Users size={13} color="#6B7280" />
                    <Text style={styles.metaText}>{item.guestCount} guests</Text>
                  </View>
                </View>

                {item.total > 0 && (
                  <View style={styles.cardFooter}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
                    <ChevronRight size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emoji}>📅</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>Reserve a table at your favourite restaurant</Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/')}>
                <Text style={styles.ctaBtnText}>Find Restaurants</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#111827', paddingHorizontal: 16, paddingVertical: 16 },
  tabList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  tabActive: { backgroundColor: BRAND, borderColor: BRAND },
  tabText: { fontSize: 13, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardHeaderLeft: { flex: 1 },
  restaurantName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  bookingNumber: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B7280' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  totalLabel: { fontSize: 13, color: '#6B7280' },
  totalValue: { fontSize: 15, fontWeight: '700', color: BRAND, marginLeft: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  ctaBtn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
