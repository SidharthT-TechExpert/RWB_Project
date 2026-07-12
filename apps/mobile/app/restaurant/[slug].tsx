import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Clock, MapPin, Heart, Plus, Minus } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { useCartStore } from '../../src/store/cartStore';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const BRAND = '#FF6B35';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  coverImage?: string;
  isVegetarian: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  categoryId: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function RestaurantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'menu' | 'info'>('menu');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { addItem, items: cartItems, getItemCount, restaurantId: cartRestaurantId } = useCartStore();

  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data } = await api.get(`/restaurants/slug/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });

  const { data: menu, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', restaurant?._id],
    queryFn: async () => {
      const { data } = await api.get(`/food/${restaurant._id}/menu`);
      return data.data;
    },
    enabled: !!restaurant?._id,
  });

  const categories: Category[] = menu?.categories || [];
  const allItems: FoodItem[] = menu?.items || [];
  const displayItems = activeCategory ? allItems.filter((i) => i.categoryId === activeCategory) : allItems;

  const getQty = (id: string) => cartItems.find((i) => i.foodItemId === id)?.quantity || 0;

  const handleAdd = (item: FoodItem) => {
    if (cartRestaurantId && cartRestaurantId !== restaurant._id) {
      Toast.show({ type: 'info', text1: 'Cart cleared', text2: 'Starting a new order from this restaurant' });
    }
    addItem({ foodItemId: item._id, name: item.name, price: item.basePrice, quantity: 1, image: item.coverImage, addOns: [] }, restaurant._id, restaurant.name);
    Toast.show({ type: 'success', text1: `${item.name} added` });
  };

  const handleRemove = (item: FoodItem) => {
    const qty = getQty(item._id);
    if (qty > 0) useCartStore.getState().updateQuantity(item._id, qty - 1);
  };

  if (restaurantLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={BRAND} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ color: '#6B7280' }}>Restaurant not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={{ color: BRAND, marginTop: 12 }}>Go back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cartCount = getItemCount();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Cover image */}
        <View style={styles.coverContainer}>
          {restaurant.coverImage ? (
            <Image source={{ uri: restaurant.coverImage }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Text style={{ fontSize: 64 }}>🍽️</Text>
            </View>
          )}
          <View style={styles.coverOverlay} />
          <SafeAreaView style={styles.coverHeader} edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn}>
              <Heart size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Restaurant info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisines}>{restaurant.cuisineTypes?.join(' · ')}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}><Star size={14} color="#FBBF24" fill="#FBBF24" /><Text style={styles.metaText}>{restaurant.averageRating?.toFixed(1)} ({restaurant.totalReviews})</Text></View>
            <View style={styles.metaItem}><Clock size={14} color="#6B7280" /><Text style={styles.metaText}>{restaurant.preparationTime}–{restaurant.preparationTime + 10} min</Text></View>
            <View style={styles.metaItem}><MapPin size={14} color="#6B7280" /><Text style={styles.metaText}>{restaurant.address?.city}</Text></View>
          </View>
        </View>

        {/* Tab bar (sticky) */}
        <View style={styles.tabBar}>
          {(['menu', 'info'] as const).map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'menu' && (
          <View style={styles.menuSection}>
            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
              <TouchableOpacity style={[styles.catChip, !activeCategory && styles.catChipActive]} onPress={() => setActiveCategory(null)}>
                <Text style={[styles.catText, !activeCategory && { color: '#fff' }]}>All</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity key={cat._id} style={[styles.catChip, activeCategory === cat._id && styles.catChipActive]} onPress={() => setActiveCategory(activeCategory === cat._id ? null : cat._id)}>
                  <Text style={[styles.catText, activeCategory === cat._id && { color: '#fff' }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {menuLoading ? (
              <View style={styles.centered}><ActivityIndicator color={BRAND} /></View>
            ) : (
              displayItems.map((item) => {
                const qty = getQty(item._id);
                return (
                  <View key={item._id} style={styles.foodItem}>
                    <View style={styles.foodInfo}>
                      <View style={styles.vegRow}>
                        <View style={[styles.vegDot, { borderColor: item.isVegetarian ? '#16A34A' : '#DC2626' }]}>
                          <View style={[styles.vegDotInner, { backgroundColor: item.isVegetarian ? '#16A34A' : '#DC2626' }]} />
                        </View>
                        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                        {item.isPopular && <View style={styles.popularBadge}><Text style={styles.popularText}>Popular</Text></View>}
                      </View>
                      <Text style={styles.foodDesc} numberOfLines={2}>{item.description}</Text>
                      <Text style={styles.foodPrice}>₹{item.basePrice}</Text>
                    </View>
                    {item.coverImage && (
                      <Image source={{ uri: item.coverImage }} style={styles.foodImage} />
                    )}
                    <View style={styles.addBtn}>
                      {qty === 0 ? (
                        <TouchableOpacity style={styles.addBtnPrimary} onPress={() => handleAdd(item)} activeOpacity={0.85}>
                          <Plus size={16} color="#fff" />
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.qtyRow}>
                          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleRemove(item)}><Minus size={14} color={BRAND} /></TouchableOpacity>
                          <Text style={styles.qtyText}>{qty}</Text>
                          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAdd(item)}><Plus size={14} color={BRAND} /></TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'info' && (
          <View style={styles.infoTab}>
            <Text style={styles.infoTabTitle}>About</Text>
            <Text style={styles.infoTabText}>{restaurant.description}</Text>
            <Text style={[styles.infoTabTitle, { marginTop: 16 }]}>Address</Text>
            <Text style={styles.infoTabText}>{[restaurant.address?.street, restaurant.address?.city, restaurant.address?.state].filter(Boolean).join(', ')}</Text>
            <Text style={[styles.infoTabTitle, { marginTop: 16 }]}>Contact</Text>
            <Text style={styles.infoTabText}>{restaurant.phone}</Text>
          </View>
        )}

        <View style={{ height: cartCount > 0 ? 100 : 24 }} />
      </ScrollView>

      {/* Cart fab */}
      {cartCount > 0 && (
        <View style={styles.cartFab}>
          <TouchableOpacity style={styles.cartFabBtn} onPress={() => router.push('/cart')} activeOpacity={0.9}>
            <View style={styles.cartFabBadge}><Text style={styles.cartFabBadgeText}>{cartCount}</Text></View>
            <Text style={styles.cartFabText}>View Cart</Text>
            <Text style={styles.cartFabPrice}>₹{useCartStore.getState().getTotal()}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  coverContainer: { height: 260, position: 'relative' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  coverHeader: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  infoSection: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  name: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cuisines: { fontSize: 14, color: '#6B7280', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6B7280' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: BRAND },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: BRAND },
  menuSection: { padding: 16 },
  catList: { paddingBottom: 16, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  catChipActive: { backgroundColor: BRAND, borderColor: BRAND },
  catText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  foodItem: { flexDirection: 'row', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'flex-start' },
  foodInfo: { flex: 1 },
  vegRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  vegDot: { width: 14, height: 14, borderRadius: 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  vegDotInner: { width: 6, height: 6, borderRadius: 3 },
  foodName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  popularBadge: { backgroundColor: '#FFF3EE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  popularText: { fontSize: 10, fontWeight: '700', color: BRAND },
  foodDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 6 },
  foodPrice: { fontSize: 15, fontWeight: '700', color: '#111827' },
  foodImage: { width: 80, height: 80, borderRadius: 12 },
  addBtn: { position: 'absolute', bottom: 16, right: 0 },
  addBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: BRAND, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, shadowColor: BRAND, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF3EE', borderRadius: 12, borderWidth: 1.5, borderColor: '#FFCCB3', paddingHorizontal: 4 },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', color: BRAND, minWidth: 16, textAlign: 'center' },
  infoTab: { padding: 20 },
  infoTabTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  infoTabText: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  cartFab: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: 'transparent' },
  cartFabBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 16, shadowColor: BRAND, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  cartFabBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartFabBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cartFabText: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  cartFabPrice: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
