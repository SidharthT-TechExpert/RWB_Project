import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/authStore';

const BRAND = '#FF6B35';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF9C3', text: '#854D0E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  preparing: { bg: '#FFEDD5', text: '#9A3412' },
  ready: { bg: '#DCFCE7', text: '#166534' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function OrdersScreen() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => { const { data } = await api.get('/orders/my'); return data; },
    enabled: isAuthenticated,
    refetchInterval: 30 * 1000,
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📦</Text>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.ctaBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.pageTitle}>My Orders</Text>
      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator color={BRAND} size="large" /></View>
      ) : (
        <FlatList
          data={data?.data || []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const s = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
            return (
              <TouchableOpacity style={styles.card} activeOpacity={0.85}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.restaurantName}>{item.restaurantName}</Text>
                    <Text style={styles.orderNum}>#{item.orderNumber}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.items} numberOfLines={1}>
                  {item.items?.map((i: { name: string; quantity: number }) => `${i.name} ×${i.quantity}`).join(', ')}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.total}>₹{item.total?.toLocaleString('en-IN')}</Text>
                  {item.status === 'delivered' && (
                    <TouchableOpacity style={styles.reorderBtn}>
                      <Text style={styles.reorderText}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>Pre-order food from your next booking</Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/')}>
                <Text style={styles.ctaBtnText}>Explore Restaurants</Text>
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
  list: { padding: 16, gap: 12, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  restaurantName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  orderNum: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  items: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  total: { fontSize: 16, fontWeight: '700', color: BRAND },
  reorderBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, borderWidth: 1.5, borderColor: BRAND },
  reorderText: { fontSize: 13, fontWeight: '600', color: BRAND },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  ctaBtn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
