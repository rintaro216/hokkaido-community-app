import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';

// 簡単なダミーユーザー
const DUMMY_USER = {
  name: '山田太郎',
  bio: '北海道をバイクで旅するのが大好きです！',
  experience_level: 'intermediate',
};

export default function MyPageScreen() {
  console.log('[MyPageScreen] Enhanced component loaded');

  const [userProfile, setUserProfile] = useState(DUMMY_USER);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(DUMMY_USER);

  const handleEditProfile = () => {
    setEditingProfile(userProfile);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    setUserProfile(editingProfile);
    setIsEditModalVisible(false);
    Alert.alert('保存完了', 'プロフィールが更新されました！');
  };

  const handleCancelEdit = () => {
    setEditingProfile(userProfile);
    setIsEditModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>🏠 マイページ</Text>
      </View>

      {/* プロフィール基本情報 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👤 プロフィール</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>✏️ 編集</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.experienceLevel}>中級者</Text>
          <Text style={styles.bio}>{userProfile.bio}</Text>
        </View>
      </View>

      {/* 旅行統計 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 旅行統計</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>総ルート数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>845km</Text>
            <Text style={styles.statLabel}>総走行距離</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>25</Text>
            <Text style={styles.statLabel}>訪問スポット</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>投稿数</Text>
          </View>
        </View>
      </View>

      {/* バッジ・実績 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 バッジ・実績</Text>
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🥇</Text>
            <Text style={styles.badgeText}>初回ツーリング</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🏔️</Text>
            <Text style={styles.badgeText}>山岳制覇</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🌊</Text>
            <Text style={styles.badgeText}>海岸線走破</Text>
          </View>
          <View style={[styles.badge, styles.badgeLocked]}>
            <Text style={styles.badgeIcon}>🔒</Text>
            <Text style={styles.badgeText}>1000km達成</Text>
          </View>
        </View>
      </View>

      {/* テスト確認 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ 動作確認</Text>
        <Text style={styles.testText}>基本構造が正常に動作しています</Text>
      </View>

      {/* プロフィール編集モーダル */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>プロフィール編集</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.cancelButton}>キャンセル</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>名前</Text>
              <TextInput
                style={styles.textInput}
                value={editingProfile.name}
                onChangeText={(text) => setEditingProfile({...editingProfile, name: text})}
                placeholder="名前を入力"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>自己紹介</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={editingProfile.bio}
                onChangeText={(text) => setEditingProfile({...editingProfile, bio: text})}
                placeholder="自己紹介を入力"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c5530',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  experienceLevel: {
    fontSize: 14,
    color: 'white',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  testText: {
    fontSize: 16,
    color: '#388e3c',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5530',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeLocked: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2c5530',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});