
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { restaurantService } from '@/services/restaurants';
import { Restaurant } from '@/services/supabase_types';

export default function HomeTab() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRestaurants = async () => {
    setLoading(true);
    const { success, data, error } = await restaurantService.getActiveRestaurants();
    if (success && data) {
      setRestaurants(data);
    } else {
      Alert.alert('Error', error || 'Failed to fetch restaurants.');
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    const { success, data, error } = await restaurantService.searchRestaurants(searchQuery);
    if (success && data) {
      setRestaurants(data);
    } else {
      Alert.alert('Error', error || 'Failed to search restaurants.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={styles.restaurantCard} 
      onPress={() => router.push({
        pathname: "/restaurant/[id]",
        params: { id: item.id, name: item.name }
      })}
    >
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for restaurants..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurantItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
});
