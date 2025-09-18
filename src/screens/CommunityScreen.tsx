import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { User, Follow } from '../types';

// ダミーユーザーデータ
const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    name: '田中花子',
    bio: '車で北海道を巡るドライブ旅行が大好きです🚗',
    travel_style: ['car'],
    experience_level: 'expert',
    interests: ['gourmet', 'onsen'],
    location_sharing_level: 2,
    created_at: '2024-01-01',
  },
  {
    id: 'user2',
    name: '佐藤次郎',
    bio: 'バイクで道東の絶景を求めて旅しています🏍️',
    travel_style: ['bike'],
    experience_level: 'intermediate',
    interests: ['scenery', 'photography'],
    location_sharing_level: 3,
    created_at: '2024-01-01',
  },
  {
    id: 'user3',
    name: '鈴木三郎',
    bio: '北海道在住です。地元の隠れた名所を教えます',
    travel_style: ['car', 'walking'],
    experience_level: 'local',
    interests: ['culture', 'gourmet'],
    location_sharing_level: 1,
    created_at: '2024-01-01',
  },
];

// 現在旅行中のユーザー
const TRAVELING_USERS: (User & { currentLocation: string; isLive: boolean })[] = [
  {
    ...DUMMY_USERS[0],
    currentLocation: '函館市',
    isLive: true,
  },
  {
    ...DUMMY_USERS[1],
    currentLocation: '知床半島',
    isLive: true,
  },
];

// 地域からのお知らせ
const REGION_NOTICES = [
  {
    id: '1',
    title: '道央エリア：峠道積雪情報',
    content: '日勝峠・三国峠で路面凍結注意。スタッドレス必須です。',
    type: 'warning',
    region: '道央',
    timestamp: '2時間前',
  },
  {
    id: '2',
    title: 'さっぽろ雪まつり開催中',
    content: '2/4〜2/11まで大通公園で開催。夜間はライトアップも！',
    type: 'event',
    region: '道央',
    timestamp: '6時間前',
  },
  {
    id: '3',
    title: '道東エリア：流氷到来',
    content: '網走・知床で流氷観測開始。クルーズツアーがおすすめです。',
    type: 'info',
    region: '道東',
    timestamp: '1日前',
  },
];

// おすすめユーザー
const RECOMMENDED_USERS = [
  {
    ...DUMMY_USERS[2],
    reason: '同じ興味分野（グルメ）',
  },
  {
    id: 'user4',
    name: '高橋美咲',
    bio: '温泉ソムリエです♨️北海道の秘湯をご案内します',
    travel_style: ['car'],
    experience_level: 'expert',
    interests: ['onsen'],
    location_sharing_level: 2,
    created_at: '2024-01-01',
    reason: '同じ興味分野（温泉）',
  },
];

export default function CommunityScreen({ navigation }: any) {
  const [followingUsers, setFollowingUsers] = useState<string[]>(['user1']);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // リフレッシュ処理
  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: APIから最新情報を取得
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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

  // 通知タイプのアイコン
  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'event': return '🎉';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  // 通知タイプの色
  const getNoticeColor = (type: string) => {
    switch (type) {
      case 'warning': return COLORS.warning;
      case 'event': return COLORS.success;
      case 'info': return COLORS.info;
      default: return COLORS.primary;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ユーザーを検索..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* 今旅行中の仲間 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🟢 今旅行中の仲間</Text>
        {TRAVELING_USERS.map((user) => (
          <TouchableOpacity 
            key={user.id} 
            style={styles.travelingUserCard}
            onPress={() => showUserProfile(user.id)}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.travelInfo}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.currentLocation}>📍 {user.currentLocation}</Text>
                </View>
                <Text style={styles.userBio} numberOfLines={1}>{user.bio}</Text>
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
        ))}
      </View>

      {/* 地域からのお知らせ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📢 地域からのお知らせ</Text>
        {REGION_NOTICES.map((notice) => (
          <TouchableOpacity key={notice.id} style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <View style={styles.noticeInfo}>
                <Text style={styles.noticeIcon}>{getNoticeIcon(notice.type)}</Text>
                <View style={styles.noticeTitleContainer}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeRegion}>{notice.region} • {notice.timestamp}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.noticeContent}>{notice.content}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* おすすめユーザー */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 おすすめの旅仲間</Text>
        {RECOMMENDED_USERS.map((user) => (
          <TouchableOpacity 
            key={user.id} 
            style={styles.recommendedUserCard}
            onPress={() => showUserProfile(user.id)}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.recommendReason}>{user.reason}</Text>
                <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>
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
        ))}
      </View>

      {/* 質問・相談投稿 */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.helpPostButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.helpPostText}>
            🆘 質問・相談を投稿する
          </Text>
          <Text style={styles.helpPostSubtext}>
            旅の困りごとを旅仲間に相談しよう
          </Text>
        </TouchableOpacity>
      </View>

      {/* フォロー管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 フォロー管理</Text>
        <View style={styles.followStats}>
          <TouchableOpacity style={styles.statButton}>
            <Text style={styles.statNumber}>{followingUsers.length}</Text>
            <Text style={styles.statLabel}>フォロー中</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statButton}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>フォロワー</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statButton}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>旅仲間</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    margin: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
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
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  travelingUserCard: {
    backgroundColor: COLORS.secondaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  recommendedUserCard: {
    backgroundColor: COLORS.secondaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  travelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },
  currentLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  recommendReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  userBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
  noticeCard: {
    backgroundColor: COLORS.secondaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  noticeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  noticeTitleContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  noticeRegion: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  noticeContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  helpPostButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  helpPostText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  helpPostSubtext: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
  },
  followStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statButton: {
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});