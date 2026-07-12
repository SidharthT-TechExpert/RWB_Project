import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Clock, TrendingUp } from 'lucide-react-native';
import { api } from '../../src/lib/api';

const BRAND = '#FF6B35';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const { data } = await api.get('/search', { params: { q: debouncedQuery } });
      return data.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const { data: popular } = useQuery({
    queryKey: ['search', 'popular'],
    queryFn: async () => {
      const { data } = await api.get('/search/popular');
      return data.data as string[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const restaurants = results?.restaurants || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search input */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.input}
            placeholder="Search restaurants, food..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {!debouncedQuery ? (
        <View style={styles.emptyState}>
          {popular && popular.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color="#6B7280" />
                <Text style={styles.sectionTitle}>Popular Searches</Text>
              </View>
              <View style={styles.chipRow}>
                {popular.map((q) => (
                  <TouchableOpacity key={q} style={styles.chip} onPress={() => setQuery(q)}>
                    <Text style={styles.chipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : isLoading ? (
        <View style={styles.centered}><ActivityIndicator color={BRAND} size="large" /></View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              activeOpacity={0.7}
              onPress={() => router.push(`/restaurant/${item.slug}`)}
            >
              <View style={styles.resultIcon}>
                <Text style={{ fontSize: 24 }}>🍽️</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>{item.cuisineTypes?.join(' · ')} · {item.address?.city}</Text>
              </View>
              <Text style={styles.resultRating}>⭐ {item.averageRating?.toFixed(1)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No results for "{debouncedQuery}"</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: BRAND },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  emptyState: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  list: { padding: 16, gap: 4 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 8 },
  resultIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF3EE', alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  resultMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  resultRating: { fontSize: 13, fontWeight: '600', color: '#374151' },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
});
