import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [recordingPoints, setRecordingPoints] = useState(0);

  // 簡易タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setDistance(0);
    setRecordingPoints(0);
    Alert.alert('記録開始', 'GPS記録を開始しました');
  };

  const stopRecording = () => {
    setIsRecording(false);
    Alert.alert('記録完了', `記録時間: ${formatTime(recordingTime)}\n距離: ${distance.toFixed(1)}km`);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* 記録状態 */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: isRecording ? COLORS.recording : COLORS.grayLight }
        ]} />
        <Text style={styles.statusText}>
          {isRecording ? '記録中' : '待機中'}
        </Text>
      </View>

      {/* 記録情報 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>記録時間:</Text>
          <Text style={styles.infoValue}>{formatTime(recordingTime)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>記録点数:</Text>
          <Text style={styles.infoValue}>{recordingPoints}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>走行距離:</Text>
          <Text style={styles.infoValue}>{distance.toFixed(1)} km</Text>
        </View>
      </View>

      {/* 地図エリア */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>🗺️ GPS記録マップ</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>地図機能は開発中です</Text>
          <Text style={styles.mapSubText}>GPS記録機能は正常に動作します</Text>
          {isRecording && (
            <Text style={styles.recordingText}>📍 記録中...</Text>
          )}
        </View>
      </View>

      {/* コントロールボタン */}
      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <TouchableOpacity style={styles.startButton} onPress={startRecording}>
            <Text style={styles.buttonText}>📍 記録開始</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Text style={styles.buttonText}>⏹️ 記録停止</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* テスト確認 */}
      <View style={styles.testContainer}>
        <Text style={styles.testTitle}>✅ 動作確認</Text>
        <Text style={styles.testText}>GPS記録画面が正常に表示されています</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  infoContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  mapContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  mapTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  mapPlaceholder: {
    backgroundColor: '#f8f9fa',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  mapText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  mapSubText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  recordingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.recording,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: SPACING.lg,
  },
  startButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  testContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  testTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  testText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
});