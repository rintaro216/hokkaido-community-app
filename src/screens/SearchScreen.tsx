import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { HOKKAIDO_REGIONS, getRegionInfo } from '../constants/regions';
import { User, HokkaidoRegion } from '../types';

// ダミーユーザーデータ（実際にはAPIから取得）
const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    name: '山田太郎',
    bio: 'バイクで北海道一周中🏍️ キャンプ場情報交換しましょう！',
    travel_style: ['bike'],
    experience_level: 'intermediate',
    interests: ['scenery', 'camping'],
    location_sharing_level: 2,
    created_at: '2024-01-01',
  },
  {
    id: 'user2',
    name: '田中花子',
    bio: '車で道東エリアを探索中🚗 グルメ情報を発信しています',
    travel_style: ['car'],
    experience_level: 'beginner',
    interests: ['gourmet', 'onsen'],
    location_sharing_level: 1,
    created_at: '2024-01-01',
  },
  {
    id: 'user3',
    name: '佐藤次郎',
    bio: '写真家です📸 北海道の絶景スポットを撮影しています',
    travel_style: ['car', 'walking'],
    experience_level: 'expert',
    interests: ['photography', 'scenery'],
    location_sharing_level: 3,
    created_at: '2024-01-01',
  },
  {
    id: 'user4',
    name: '高橋美咲',
    bio: '温泉ソムリエです♨️ 北海道の秘湯をご案内します',
    travel_style: ['car'],
    experience_level: 'expert',
    interests: ['onsen'],
    location_sharing_level: 2,
    created_at: '2024-01-01',
  },
  {
    id: 'user5',
    name: '伊藤健太',
    bio: 'ソロキャンプ愛好家⛺ 穴場キャンプ場の情報交換しませんか？',
    travel_style: ['car', 'bike'],
    experience_level: 'intermediate',
    interests: ['camping', 'outdoor'],
    location_sharing_level: 2,
    created_at: '2024-01-01',
  },
  {
    id: 'user6',
    name: '鈴木さくら',
    bio: '札幌在住のローカルガイド🌸 穴場スポット教えます！',
    travel_style: ['walking', 'train'],
    experience_level: 'local',
    interests: ['culture', 'gourmet'],
    location_sharing_level: 1,
    created_at: '2024-01-01',
  },
];

const EXPERIENCE_LEVELS = [
  { key: 'all', name: 'すべて', emoji: '🌐' },
  { key: 'beginner', name: '初心者', emoji: '🔰' },
  { key: 'intermediate', name: '中級者', emoji: '⭐' },
  { key: 'expert', name: '上級者', emoji: '🏆' },
  { key: 'local', name: '地元民', emoji: '🏠' },
];

const TRAVEL_STYLES = [
  { key: 'all', name: 'すべて', emoji: '🌐' },
  { key: 'car', name: '車', emoji: '🚗' },
  { key: 'bike', name: 'バイク', emoji: '🏍️' },
  { key: 'train', name: '電車', emoji: '🚄' },
  { key: 'walking', name: '徒歩', emoji: '🚶' },
];

const INTERESTS = [
  { key: 'all', name: 'すべて', emoji: '🌐' },
  { key: 'gourmet', name: 'グルメ', emoji: '🍽️' },
  { key: 'onsen', name: '温泉', emoji: '♨️' },
  { key: 'scenery', name: '景色', emoji: '🏔️' },
  { key: 'photography', name: '写真', emoji: '📸' },
  { key: 'camping', name: 'キャンプ', emoji: '⛺' },
  { key: 'outdoor', name: 'アウトドア', emoji: '🏕️' },
  { key: 'culture', name: '文化', emoji: '🏛️' },
];

export default function SearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<HokkaidoRegion>('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedTravelStyle, setSelectedTravelStyle] = useState('all');
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<string[]>(['user1']);

  // 検索実行
  const performSearch = () => {
    setIsSearching(true);
    
    // フィルタリング処理
    let results = DUMMY_USERS.filter(user => {
      // テキスト検索
      const matchesText = searchQuery === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 経験レベルフィルタ
      const matchesExperience = selectedExperience === 'all' || 
        user.experience_level === selectedExperience;
      
      // 旅行スタイルフィルタ
      const matchesTravelStyle = selectedTravelStyle === 'all' || 
        user.travel_style.includes(selectedTravelStyle);
      
      // 興味フィルタ
      const matchesInterest = selectedInterest === 'all' || 
        user.interests.includes(selectedInterest);
      
      return matchesText && matchesExperience && matchesTravelStyle && matchesInterest;
    });
    
    // 実際のAPIでは遅延があるためsetTimeout
    setTimeout(() => {
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  // 検索条件が変更されたら自動で検索実行
  useEffect(() => {
    performSearch();
  }, [searchQuery, selectedRegion, selectedExperience, selectedTravelStyle, selectedInterest]);

  // フォロー切り替え
  const toggleFollow = (userId: string) => {
    setFollowingUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // ユーザープロフィール表示
  const showUserProfile = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  // ユーザーカード
  const UserCard = ({ user }: { user: User }) => {
    const experienceInfo = EXPERIENCE_LEVELS.find(level => level.key === user.experience_level);
    const travelStylesText = user.travel_style.map(style => {
      const styleInfo = TRAVEL_STYLES.find(s => s.key === style);
      return styleInfo ? `${styleInfo.emoji}${styleInfo.name}` : style;
    }).join(' ');

    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => showUserProfile(user.id)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userMeta}>
              {experienceInfo?.emoji} {experienceInfo?.name} • {travelStylesText}
            </Text>
            <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>
            <View style={styles.interestTags}>
              {user.interests.slice(0, 3).map((interest, index) => {
                const interestInfo = INTERESTS.find(i => i.key === interest);
                return (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>
                      {interestInfo?.emoji} {interestInfo?.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={[
            styles.followButton,
            followingUsers.includes(user.id) && styles.followingButton
          ]}
          onPress={() => toggleFollow(user.id)}
        >
          <Text style={[
            styles.followButtonText,
            followingUsers.includes(user.id) && styles.followingButtonText
          ]}>
            {followingUsers.includes(user.id) ? 'フォロー中' : 'フォロー'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ユーザー名やプロフィールで検索..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} onPress={performSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* フィルター */}
      <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
        {/* 経験レベルフィルタ */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>経験レベル</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EXPERIENCE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.filterButton,
                  selectedExperience === level.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedExperience(level.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedExperience === level.key && styles.filterButtonTextActive
                ]}>
                  {level.emoji} {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 旅行スタイルフィルタ */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>旅行スタイル</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TRAVEL_STYLES.map((style) => (
              <TouchableOpacity
                key={style.key}
                style={[
                  styles.filterButton,
                  selectedTravelStyle === style.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedTravelStyle(style.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedTravelStyle === style.key && styles.filterButtonTextActive
                ]}>
                  {style.emoji} {style.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 興味フィルタ */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>興味・関心</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest.key}
                style={[
                  styles.filterButton,
                  selectedInterest === interest.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedInterest(interest.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedInterest === interest.key && styles.filterButtonTextActive
                ]}>
                  {interest.emoji} {interest.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 検索結果 */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            検索結果 ({searchResults.length}人)
          </Text>
          {isSearching && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
        
        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
          {searchResults.length > 0 ? (
            searchResults.map((user) => <UserCard key={user.id} user={user} />)
          ) : (
            !isSearching && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  😕 検索条件に一致するユーザーが見つかりませんでした
                </Text>
                <Text style={styles.noResultsSubtext}>
                  フィルター条件を変更してみてください
                </Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  filtersContainer: {
    backgroundColor: COLORS.surface,
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  resultsList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: COLORS.secondaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  interestTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textInverse,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  followingButton: {
    backgroundColor: COLORS.grayLight,
  },
  followButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: COLORS.textSecondary,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  noResultsSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});