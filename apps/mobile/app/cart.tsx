import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '../src/store/cartStore';
import { api } from '../src/lib/api';
import { useAuthStore } from '../src/store/authStore';
import Toast from 'react-native-toast-message';

const BRAND = '#FF6B35';

export default function CartScreen() {
  const { items, restaurantId, restaurantName, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/bookings', {
        restaurantId,
        type: 'food',
        guestCount: 1,
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: '12:00',
        preOrderItems: items.map((item) => ({
          foodItemId: item.foodItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          addOns: item.addOns,
        })),
      });
      return data.data;
    },
    onSuccess: (booking) => {
      clearCart();
      Toast.show({ type: 'success', text1: 'Order placed!', text2: `Booking #${booking.bookingNumber}` });
      router.push('/bookings');
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to place order' }),
  });

  const subtotal = getTotal();
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + tax + serviceCharge;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <ShoppingCart size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items from a restaurant to get started</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/')}>
            <Text style={styles.exploreBtnText}>Find Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.foodItemId}-${item.variantId}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.restaurantLabel}>From: <Text style={styles.restaurantName}>{restaurantName}</Text></Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            {item.image && <Image source={{ uri: item.image }} style={styles.itemImage} />}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              {item.addOns.length > 0 && <Text style={styles.itemAddons} numberOfLines={1}>{item.addOns.map((a) => a.name).join(', ')}</Text>}
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => removeItem(item.foodItemId, item.variantId)}>
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.foodItemId, item.quantity - 1, item.variantId)}>
                  <Minus size={14} color={BRAND} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.foodItemId, item.quantity + 1, item.variantId)}>
                  <Plus size={14} color={BRAND} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Bill Summary</Text>
            {[
              { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN')}` },
              { label: 'Tax (5%)', value: `₹${tax.toFixed(0)}` },
              { label: 'Service charge (10%)', value: `₹${serviceCharge.toFixed(0)}` },
            ].map(({ label, value }) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
              </View>
            ))}
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
            </View>
          </View>
        }
      />

      <View style={styles.footer}>
        {!isAuthenticated ? (
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.85}>
            <Text style={styles.checkoutBtnText}>Sign in to Order</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.checkoutBtn, bookingMutation.isPending && { opacity: 0.7 }]}
            onPress={() => bookingMutation.mutate()}
            disabled={bookingMutation.isPending}
            activeOpacity={0.85}
          >
            {bookingMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutBtnText}>Place Order · ₹{total.toFixed(0)}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  clearText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  exploreBtn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  restaurantLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  restaurantName: { color: '#111827', fontWeight: '700' },
  cartItem: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
  itemImage: { width: 56, height: 56, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemAddons: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: BRAND, marginTop: 4 },
  itemActions: { alignItems: 'flex-end', gap: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF3EE', borderRadius: 10, borderWidth: 1, borderColor: '#FFCCB3', padding: 4 },
  qtyBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '700', color: BRAND, minWidth: 14, textAlign: 'center' },
  summary: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#374151' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '700', color: BRAND },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  checkoutBtn: { backgroundColor: BRAND, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  checkoutBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
