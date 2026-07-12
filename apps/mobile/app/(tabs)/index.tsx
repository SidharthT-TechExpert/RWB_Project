import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  FlatList, Image, RefreshControl, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, Clock } from 'lucide-react-native';
import { api } from '../../src/lib/api';

const { width } = Dimensions.get('window');
const BRAND = '#FF6B35';

const CUISINES = [
  { name: 'All', emoji: '🍽️' }, { name: 'Indian', emoji: '🍛' },
  { name: 'Chinese', emoji: '🥡' }, { name: 'Italian', emoji: '🍕' },
  { name: 'Japanese', emoji: '🍣' }, { name: 'Mexican', emoji: '🌮' },
];

interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  cuisineTypes: string[];
  averageRating: number;
  totalReviews: number;
  preparationTime: number;
  address: { city: string };
  coverImage?: string;
  priceRange: number;
}

function RestaurantCard({ item }: { item: Restaurant }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/restaurant/${item.slug}`)}
    >
      <View style={styles.cardImage}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 40 }}>🍽️</Text>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.cuisineTypes.join(' · ')}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.metaText}>{item.averageRating.toFixed(1)}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Clock size={12} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.preparationTime}–{item.preparationTime + 10} min</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <MapPin size={12} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.address.city}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { data: featured, refetch } = useQuery({
    queryKey: ['restaurants', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/restaurants/featured');
      return data.data as Restaurant[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: nearby } = useQuery({
    queryKey: ['restaurants', 'nearby', selectedCuisine],
    queryFn: async () => {
      const { data } = await api.get('/restaurants', {
        params: { cuisineTypes: selectedCuisine !== 'All' ? selectedCuisine : undefined, limit: 20 },
      });
      return data.data as Restaurant[];
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.tagline}>What are you craving?</Text>
          </View>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search')} activeOpacity={0.8}>
          <Search size={18} color="#9CA3AF" />
          <Text style={styles.searchPlaceholder}>Search restaurants, dishes...</Text>
        </TouchableOpacity>

        {/* Cuisine filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineList}>
          {CUISINES.map((c) => (
            <TouchableOpacity
              key={c.name}
              style={[styles.cuisineChip, selectedCuisine === c.name && styles.cuisineChipActive]}
              onPress={() => setSelectedCuisine(c.name)}
              activeOpacity={0.7}
            >
              <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
              <Text style={[styles.cuisineLabel, selectedCuisine === c.name && { color: '#fff' }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        {featured && featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Featured</Text>
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {featured.map((r) => (
                <View key={r._id} style={{ width: width * 0.72 }}>
                  <RestaurantCard item={r} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Nearby */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Near You</Text>
          </View>
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {(nearby || []).map((r) => <RestaurantCard key={r._id} item={r} />)}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  greeting: { fontSize: 13, color: '#9CA3AF' },
  tagline: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  searchPlaceholder: { flex: 1, fontSize: 14, color: '#9CA3AF' },
  cuisineList: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  cuisineChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  cuisineChipActive: { backgroundColor: BRAND, borderColor: BRAND },
  cuisineEmoji: { fontSize: 16 },
  cuisineLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  seeAll: { fontSize: 14, color: BRAND, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 2 },
  cardImage: { height: 160, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#6B7280' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },
});
