import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';

// Web版では react-native-maps をインポートしない
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Track, LocationPoint } from '../types';

const { width, height } = Dimensions.get('window');

// ダミートラックデータ
const DUMMY_TRACK: Track = {
  id: 'track1',
  user_id: 'user1',
  name: '函館山〜大沼公園ツーリング',
  description: 'バイクで函館山から大沼公園まで。景色が最高でした！',
  route_points: [
    { latitude: 41.7687, longitude: 140.7297, timestamp: Date.now() - 3600000, altitude: 50 },
    { latitude: 41.7800, longitude: 140.7500, timestamp: Date.now() - 3300000, altitude: 120 },
    { latitude: 41.8000, longitude: 140.7800, timestamp: Date.now() - 3000000, altitude: 200 },
    { latitude: 41.8200, longitude: 140.8000, timestamp: Date.now() - 2700000, altitude: 150 },
    { latitude: 42.0000, longitude: 140.9000, timestamp: Date.now() - 2400000, altitude: 100 },
    { latitude: 42.0500, longitude: 140.9500, timestamp: Date.now() - 2100000, altitude: 80 },
  ],
  travel_style: 'bike',
  region: 'dounan',
  total_distance: 45.2,
  total_time: 3600, // 1時間
  privacy_level: 2,
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2024-01-15T12:00:00Z',
};

export default function TrackDetailScreen({ route, navigation }: any) {
  const { trackId } = route.params;
  const [track] = useState<Track>(DUMMY_TRACK);
  const [selectedWaypoint, setSelectedWaypoint] = useState<LocationPoint | null>(null);

  // マップの初期表示領域を計算
  const getMapRegion = () => {
    if (track.route_points.length === 0) return null;
    
    const lats = track.route_points.map(p => p.latitude);
    const lngs = track.route_points.map(p => p.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.2;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.2;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  // 時間フォーマット
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else {
      return `${minutes}分`;
    }
  };

  // GPXファイル生成
  const generateGPX = (routePoints: LocationPoint[]): string => {
    const trackPoints = routePoints.map(point => 
      `<trkpt lat="${point.latitude}" lon="${point.longitude}">
        <time>${new Date(point.timestamp).toISOString()}</time>
        ${point.altitude ? `<ele>${point.altitude}</ele>` : ''}
      </trkpt>`
    ).join('\n        ');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="北海道旅人アプリ">
  <trk>
    <name>${track.name}</name>
    <desc>${track.description}</desc>
    <trkseg>
        ${trackPoints}
    </trkseg>
  </trk>
</gpx>`;
  };

  // GPXファイル出力
  const exportGPX = async () => {
    try {
      const gpxContent = generateGPX(track.route_points);
      const fileName = `${track.name.replace(/[^a-zA-Z0-9]/g, '_')}.gpx`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, gpxContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/gpx+xml',
          dialogTitle: 'GPXファイルをシェア',
        });
      } else {
        Alert.alert('エクスポート完了', `GPXファイルが保存されました: ${fileName}`);
      }
    } catch (error) {
      console.error('GPXエクスポートエラー:', error);
      Alert.alert('エラー', 'GPXファイルのエクスポートに失敗しました。');
    }
  };

  // スピード計算
  const calculateSpeed = (): number => {
    if (track.total_time === 0) return 0;
    return (track.total_distance / (track.total_time / 3600)); // km/h
  };

  // 獲得標高計算
  const calculateElevationGain = (): number => {
    let totalGain = 0;
    for (let i = 1; i < track.route_points.length; i++) {
      const prevPoint = track.route_points[i - 1];
      const currentPoint = track.route_points[i];
      
      if (prevPoint.altitude && currentPoint.altitude) {
        const gain = currentPoint.altitude - prevPoint.altitude;
        if (gain > 0) {
          totalGain += gain;
        }
      }
    }
    return totalGain;
  };

  // 旅行スタイル表示
  const getTravelStyleEmoji = (style: string): string => {
    switch (style) {
      case 'bike': return '🏍️';
      case 'car': return '🚗';
      case 'bicycle': return '🚴';
      case 'walking': return '🚶';
      case 'train': return '🚄';
      default: return '🗺️';
    }
  };

  const mapRegion = getMapRegion();

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー情報 */}
      <View style={styles.header}>
        <Text style={styles.title}>{track.name}</Text>
        <Text style={styles.description}>{track.description}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>移動手段</Text>
            <Text style={styles.metaValue}>
              {getTravelStyleEmoji(track.travel_style)} {track.travel_style}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>地域</Text>
            <Text style={styles.metaValue}>📍 {track.region}</Text>
          </View>
        </View>
      </View>

      {/* 統計情報 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{track.total_distance.toFixed(1)}</Text>
          <Text style={styles.statLabel}>距離 (km)</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(track.total_time)}</Text>
          <Text style={styles.statLabel}>時間</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{calculateSpeed().toFixed(1)}</Text>
          <Text style={styles.statLabel}>平均速度 (km/h)</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{calculateElevationGain().toFixed(0)}</Text>
          <Text style={styles.statLabel}>獲得標高 (m)</Text>
        </View>
      </View>

      {/* マップ */}
      <View style={styles.mapContainer}>
        <Text style={styles.sectionTitle}>📍 ルートマップ</Text>
        {Platform.OS !== 'web' && mapRegion && (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={mapRegion}
            showsUserLocation={false}
          >
            {/* ルートライン */}
            <Polyline
              coordinates={track.route_points.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }))}
              strokeColor={COLORS.primary}
              strokeWidth={4}
            />

            {/* スタートマーカー */}
            {track.route_points.length > 0 && (
              <Marker
                coordinate={{
                  latitude: track.route_points[0].latitude,
                  longitude: track.route_points[0].longitude,
                }}
                title="スタート"
                pinColor={COLORS.success}
              >
                <View style={[styles.marker, { backgroundColor: COLORS.success }]}>
                  <Text style={styles.markerText}>🏁</Text>
                </View>
              </Marker>
            )}

            {/* ゴールマーカー */}
            {track.route_points.length > 1 && (
              <Marker
                coordinate={{
                  latitude: track.route_points[track.route_points.length - 1].latitude,
                  longitude: track.route_points[track.route_points.length - 1].longitude,
                }}
                title="ゴール"
                pinColor={COLORS.accent}
              >
                <View style={[styles.marker, { backgroundColor: COLORS.accent }]}>
                  <Text style={styles.markerText}>🏆</Text>
                </View>
              </Marker>
            )}
          </MapView>
        )}
        {Platform.OS === 'web' && (
          <View style={[styles.map, styles.webMapPlaceholder]}>
            <Text style={styles.webMapText}>🗺️ マップ機能</Text>
            <Text style={styles.webMapSubText}>Web版では利用できません</Text>
            <Text style={styles.webMapSubText}>スマートフォンアプリでお試しください</Text>
          </View>
        )}
      </View>

      {/* ウェイポイント詳細 */}
      {selectedWaypoint && (
        <View style={styles.waypointDetail}>
          <Text style={styles.waypointTitle}>選択地点の詳細</Text>
          <Text>緯度: {selectedWaypoint.latitude.toFixed(6)}</Text>
          <Text>経度: {selectedWaypoint.longitude.toFixed(6)}</Text>
          {selectedWaypoint.altitude && (
            <Text>標高: {selectedWaypoint.altitude.toFixed(0)}m</Text>
          )}
          <Text>時刻: {new Date(selectedWaypoint.timestamp).toLocaleString()}</Text>
        </View>
      )}

      {/* アクションボタン */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={exportGPX}>
          <Text style={styles.actionButtonText}>📥 GPXエクスポート</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => Alert.alert('シェア機能', 'コミュニティへの共有機能は準備中です。')}
        >
          <Text style={styles.actionButtonText}>📤 シェア</Text>
        </TouchableOpacity>
      </View>

      {/* ルート詳細データ */}
      <View style={styles.routeDataContainer}>
        <Text style={styles.sectionTitle}>📊 ルートデータ</Text>
        <Text style={styles.dataInfo}>
          記録点数: {track.route_points.length}個
        </Text>
        <Text style={styles.dataInfo}>
          記録日時: {new Date(track.created_at).toLocaleString()}
        </Text>
        <Text style={styles.dataInfo}>
          プライバシーレベル: {track.privacy_level === 3 ? '公開' : track.privacy_level === 2 ? 'フォロワーのみ' : 'プライベート'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  metaValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mapContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  map: {
    width: '100%',
    height: 300,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  markerText: {
    fontSize: 16,
  },
  waypointDetail: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  waypointTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  routeDataContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  dataInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  webMapPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  webMapSubText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});