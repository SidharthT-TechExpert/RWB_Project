import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Users, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import Toast from 'react-native-toast-message';

const BRAND = '#FF6B35';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending:    { bg: '#FEF9C3', text: '#854D0E', label: 'Pending' },
  confirmed:  { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmed' },
  checked_in: { bg: '#EDE9FE', text: '#5B21B6', label: 'Checked In' },
  completed:  { bg: '#DCFCE7', text: '#166534', label: 'Completed' },
  cancelled:  { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatCurrency(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => { const { data } = await api.get(`/bookings/${id}`); return data.data; },
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => { await api.patch(`/bookings/${id}/cancel`); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['booking', id] });
      Toast.show({ type: 'success', text1: 'Booking cancelled' });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Toast.show({ type: 'error', text1: e?.response?.data?.message || 'Failed to cancel' });
    },
  });

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
    ]);
  };

  if (isLoading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.centered}><ActivityIndicator color={BRAND} size="large" /></View>
    </SafeAreaView>
  );

  if (!booking) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.centered}><Text style={{ color: '#6B7280' }}>Booking not found</Text></View>
    </SafeAreaView>
  );

  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: statusStyle.bg }]}>
          {booking.status === 'completed' ? <CheckCircle size={32} color="#16A34A" /> :
           booking.status === 'cancelled' ? <XCircle size={32} color="#991B1B" /> :
           <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />}
          <Text style={[styles.statusLabel, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          <Text style={styles.bookingNum}>{booking.bookingNumber}</Text>
        </View>

        {/* Restaurant */}
        <View style={styles.section}>
          <Text style={styles.restaurantName}>{booking.restaurantName}</Text>
          <Text style={styles.bookingType}>{booking.type} booking</Text>
        </View>

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          {[
            { icon: Calendar, label: 'Date', value: formatDate(booking.reservationDate) },
            { icon: Clock, label: 'Time', value: booking.reservationTime },
            { icon: Users, label: 'Guests', value: `${booking.guestCount} guests` },
            booking.tableNumber && { icon: MapPin, label: 'Table', value: `Table ${booking.tableNumber}` },
          ].filter(Boolean).map((item) => item && (
            <View key={item.label} style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <item.icon size={18} color={BRAND} />
              </View>
              <View>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pre-ordered items */}
        {booking.preOrderItems?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pre-ordered Food</Text>
            {booking.preOrderItems.map((item: { foodItemId: string; name: string; quantity: number; price: number }) => (
              <View key={item.foodItemId} style={styles.orderItem}>
                <Text style={styles.orderItemName}>{item.name} ×{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bill */}
        {booking.total > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bill Summary</Text>
            {[
              { label: 'Subtotal', value: formatCurrency(booking.subtotal || 0) },
              { label: 'Tax', value: formatCurrency(booking.tax || 0) },
              { label: 'Service Charge', value: formatCurrency(booking.serviceCharge || 0) },
            ].map(({ label, value }) => (
              <View key={label} style={styles.billRow}>
                <Text style={styles.billLabel}>{label}</Text>
                <Text style={styles.billValue}>{value}</Text>
              </View>
            ))}
            <View style={[styles.billRow, styles.billTotal]}>
              <Text style={styles.billTotalLabel}>Total</Text>
              <Text style={styles.billTotalValue}>{formatCurrency(booking.total)}</Text>
            </View>
          </View>
        )}

        {/* Special requests */}
        {booking.specialRequests && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Special Requests</Text>
            <Text style={styles.specialReqs}>{booking.specialRequests}</Text>
          </View>
        )}

        {/* Actions */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelBtn, cancelMutation.isPending && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
            activeOpacity={0.85}
          >
            {cancelMutation.isPending
              ? <ActivityIndicator color="#EF4444" />
              : <Text style={styles.cancelBtnText}>Cancel Booking</Text>}
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16 },
  statusCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  statusDot: { width: 32, height: 32, borderRadius: 16 },
  statusLabel: { fontSize: 20, fontWeight: '800' },
  bookingNum: { fontSize: 13, fontFamily: 'monospace', color: '#6B7280' },
  section: { alignItems: 'center' },
  restaurantName: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center' },
  bookingType: { fontSize: 14, color: '#6B7280', textTransform: 'capitalize', marginTop: 4 },
  detailsGrid: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3F4F6', gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF3EE', alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  orderItemName: { fontSize: 14, color: '#374151' },
  orderItemPrice: { fontSize: 14, fontWeight: '600', color: '#374151' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: '#6B7280' },
  billValue: { fontSize: 14, color: '#374151' },
  billTotal: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  billTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  billTotalValue: { fontSize: 16, fontWeight: '800', color: BRAND },
  specialReqs: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  cancelBtn: { borderWidth: 2, borderColor: '#EF4444', borderRadius: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FEF2F2' },
  cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
});
