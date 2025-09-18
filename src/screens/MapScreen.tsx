import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { SPOT_CATEGORIES, getSpotCategoryInfo } from '../constants/posts';
import { SpotCategory, Spot } from '../types';

const { width, height } = Dimensions.get('window');

// 北海道の中心座標
const HOKKAIDO_CENTER = {
  latitude: 43.2203,
  longitude: 142.8635,
  latitudeDelta: 8.0,
  longitudeDelta: 8.0,
};

// ダミースポットデータ
const DUMMY_SPOTS: Spot[] = [
  {
    id: '1',
    name: '登別温泉',
    description: '北海道を代表する温泉地',
    category: 'onsen',
    lat: 42.4889,
    lng: 141.1525,
    address: '北海道登別市登別温泉町',
    created_by: 'system',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: '函館朝市',
    description: '新鮮な海鮮が楽しめる朝市',
    category: 'food',
    lat: 41.7687,
    lng: 140.7297,
    address: '北海道函館市若松町',
    created_by: 'system',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    name: '新千歳空港',
    description: '北海道の玄関口',
    category: 'service',
    lat: 42.7747,
    lng: 141.6929,
    address: '北海道千歳市美々',
    created_by: 'system',
    created_at: '2024-01-01',
  },
  {
    id: '4',
    name: 'サッポロビール園',
    description: 'ジンギスカンとビールの名店',
    category: 'food',
    lat: 43.0767,
    lng: 141.3569,
    address: '北海道札幌市東区北7条東9丁目',
    created_by: 'system',
    created_at: '2024-01-01',
  },
  {
    id: '5',
    name: '知床国立公園',
    description: '世界自然遺産の絶景',
    category: 'sightseeing',
    lat: 44.0722,
    lng: 145.1361,
    address: '北海道斜里郡斜里町',
    created_by: 'system',
    created_at: '2024-01-01',
  },
];

export default function MapScreen() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<SpotCategory[]>([]);
  const [spots] = useState<Spot[]>(DUMMY_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const mapRef = useRef<MapView>(null);

  // 位置情報取得
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentLocation(location);
        } catch (error) {
          console.error('位置情報取得エラー:', error);
        }
      }
    })();
  }, []);

  // 現在地に移動
  const goToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      const region: Region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    } else {
      Alert.alert('位置情報を取得できません', '位置情報の使用を許可してください。');
    }
  };

  // カテゴリフィルタ切り替え
  const toggleCategory = (category: SpotCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // フィルタされたスポット
  const filteredSpots = selectedCategories.length === 0 
    ? spots 
    : spots.filter(spot => selectedCategories.includes(spot.category));

  // スポットマーカーの色を取得
  const getMarkerColor = (category: SpotCategory): string => {
    const categoryInfo = getSpotCategoryInfo(category);
    return categoryInfo.color;
  };

  return (
    <View style={styles.container}>
      {/* カテゴリフィルタ */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>カテゴリ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SPOT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategories.includes(category.key) && {
                  backgroundColor: category.color,
                }
              ]}
              onPress={() => toggleCategory(category.key)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategories.includes(category.key) && styles.categoryButtonTextActive
              ]}>
                {category.emoji} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 地図 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={HOKKAIDO_CENTER}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* スポットマーカー */}
          {filteredSpots.map((spot) => {
            const categoryInfo = getSpotCategoryInfo(spot.category);
            return (
              <Marker
                key={spot.id}
                coordinate={{
                  latitude: spot.lat,
                  longitude: spot.lng,
                }}
                title={spot.name}
                description={spot.description}
                pinColor={categoryInfo.color}
                onPress={() => setSelectedSpot(spot)}
              >
                <View style={[styles.customMarker, { backgroundColor: categoryInfo.color }]}>
                  <Text style={styles.markerEmoji}>{categoryInfo.emoji}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* 現在地ボタン */}
        <TouchableOpacity style={styles.locationButton} onPress={goToCurrentLocation}>
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>

        {/* スポット情報カード */}
        {selectedSpot && (
          <View style={styles.spotInfoCard}>
            <View style={styles.spotInfoHeader}>
              <Text style={styles.spotInfoTitle}>{selectedSpot.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedSpot(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.spotInfoDescription}>{selectedSpot.description}</Text>
            <Text style={styles.spotInfoAddress}>{selectedSpot.address}</Text>
            <View style={styles.spotInfoCategory}>
              <Text style={styles.spotInfoCategoryText}>
                {getSpotCategoryInfo(selectedSpot.category).emoji} {getSpotCategoryInfo(selectedSpot.category).name}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 統計情報 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          表示中: {filteredSpots.length}件 / 全{spots.length}件
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryButtonTextActive: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  markerEmoji: {
    fontSize: 16,
  },
  locationButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  locationButtonText: {
    fontSize: 20,
  },
  spotInfoCard: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  spotInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  spotInfoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  spotInfoDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  spotInfoAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  spotInfoCategory: {
    alignSelf: 'flex-start',
  },
  spotInfoCategoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});