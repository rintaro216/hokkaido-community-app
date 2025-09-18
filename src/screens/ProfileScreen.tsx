import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { User, Post, Track } from '../types';

// ダミーデータ
const DUMMY_USER: User = {
  id: 'user1',
  name: '田中花子',
  bio: '車で北海道を巡るドライブ旅行が大好きです🚗\n特に道東の絶景と温泉を求めて旅しています。',
  travel_style: ['car'],
  experience_level: 'expert',
  interests: ['gourmet', 'onsen', 'scenery'],
  location_sharing_level: 2,
  created_at: '2022-03-15',
};

const USER_POSTS: Post[] = [
  {
    id: '1',
    user_id: 'user1',
    user: DUMMY_USER,
    content: '函館朝市で海鮮丼🐟 500円でこのボリューム！',
    post_type: 'spot',
    location_name: '函館朝市',
    region: 'dounan',
    tags: ['グルメ', '海鮮'],
    visibility: 'public',
    likes_count: 24,
    comments_count: 6,
    created_at: '2024-01-15T08:15:00Z',
    updated_at: '2024-01-15T08:15:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    user: DUMMY_USER,
    content: '知床五湖の紅葉が見頃です🍁 今年は例年より少し早めかも',
    post_type: 'info',
    location_name: '知床五湖',
    region: 'doutou',
    tags: ['紅葉', '絶景'],
    visibility: 'public',
    likes_count: 18,
    comments_count: 3,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z',
  },
];

const USER_TRACKS: Track[] = [
  {
    id: '1',
    user_id: 'user1',
    user: DUMMY_USER,
    title: '道東絶景ドライブ 3日間',
    description: '知床から釧路湿原まで、道東の名所を巡るドライブコース',
    points: [], // 実際のGPSポイント
    distance_km: 456.7,
    duration_minutes: 4320, // 3日間
    start_location: '女満別空港',
    end_location: '釧路空港',
    start_time: '2024-01-08T09:00:00Z',
    end_time: '2024-01-11T18:00:00Z',
    route_type: 'car',
    visibility: 'public',
    created_at: '2024-01-11T18:30:00Z',
  },
];

const TRAVEL_STYLE_LABELS = {
  bike: '🏍️ バイク',
  car: '🚗 車',
  train: '🚄 電車・バス',
  walking: '🚶 徒歩',
  bicycle: '🚲 自転車',
};

const EXPERIENCE_LEVEL_LABELS = {
  beginner: '初心者',
  intermediate: '中級者',
  expert: '上級者',
  local: '地元民',
};

const INTEREST_LABELS = {
  onsen: '♨️ 温泉',
  gourmet: '🍜 グルメ',
  scenery: '🏔️ 絶景',
  culture: '🏛️ 文化・歴史',
  camping: '🏕️ キャンプ',
  photography: '📸 写真',
};

export default function ProfileScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const [user] = useState<User>(DUMMY_USER); // 実際はAPIから取得
  const [posts] = useState<Post[]>(USER_POSTS);
  const [tracks] = useState<Track[]>(USER_TRACKS);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'tracks'>('posts');

  // フォロー切り替え
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'フォロー解除' : 'フォロー',
      isFollowing 
        ? `${user.name}さんのフォローを解除しました。`
        : `${user.name}さんをフォローしました。`
    );
  };

  // メッセージ送信
  const sendMessage = () => {
    Alert.alert('メッセージ機能', 'メッセージ機能は準備中です。');
  };

  // 時間表示の計算
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const time = new Date(dateString);
    const diffMs = now.getTime() - time.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 30) return `${diffDays}日前`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}ヶ月前`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears}年前`;
  };

  // アカウント作成からの期間
  const getAccountAge = () => {
    const now = new Date();
    const created = new Date(user.created_at);
    const diffMs = now.getTime() - created.getTime();
    const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) return `${diffYears}年前から利用`;
    if (diffMonths > 0) return `${diffMonths}ヶ月前から利用`;
    return '最近参加';
  };

  return (
    <ScrollView style={styles.container}>
      {/* プロフィールヘッダー */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.experienceLevel}>
              {EXPERIENCE_LEVEL_LABELS[user.experience_level]}
            </Text>
            <Text style={styles.accountAge}>{getAccountAge()}</Text>
          </View>
        </View>

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.followButton, isFollowing && styles.followingButton]}
            onPress={toggleFollow}
          >
            <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'フォロー中' : 'フォロー'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={sendMessage}>
            <Text style={styles.actionButtonText}>メッセージ</Text>
          </TouchableOpacity>
        </View>

        {/* 自己紹介 */}
        {user.bio && (
          <Text style={styles.bio}>{user.bio}</Text>
        )}
      </View>

      {/* 旅スタイル・興味分野 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛣️ 旅スタイル</Text>
        <View style={styles.tagsContainer}>
          {user.travel_style.map(style => (
            <View key={style} style={styles.tag}>
              <Text style={styles.tagText}>{TRAVEL_STYLE_LABELS[style]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❤️ 興味分野</Text>
        <View style={styles.tagsContainer}>
          {user.interests.map(interest => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{INTEREST_LABELS[interest]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 統計情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 アクティビティ</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>投稿</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tracks.length}</Text>
            <Text style={styles.statLabel}>ルート</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>フォロワー</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>フォロー中</Text>
          </View>
        </View>
      </View>

      {/* タブ切り替え */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            📝 投稿 ({posts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
            🗺️ ルート ({tracks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 投稿一覧 */}
      {activeTab === 'posts' && (
        <View style={styles.contentContainer}>
          {posts.map(post => (
            <TouchableOpacity 
              key={post.id} 
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
            >
              <View style={styles.postHeader}>
                <Text style={styles.postType}>
                  {post.post_type === 'spot' ? '📍' : 
                   post.post_type === 'info' ? 'ℹ️' : 
                   post.post_type === 'help' ? '🆘' : 
                   post.post_type === 'log' ? '📖' : '💭'} {post.location_name}
                </Text>
                <Text style={styles.postTime}>{getTimeAgo(post.created_at)}</Text>
              </View>
              <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
              <View style={styles.postActions}>
                <Text style={styles.postAction}>❤️ {post.likes_count}</Text>
                <Text style={styles.postAction}>💬 {post.comments_count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ルート一覧 */}
      {activeTab === 'tracks' && (
        <View style={styles.contentContainer}>
          {tracks.map(track => (
            <TouchableOpacity key={track.id} style={styles.trackCard}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackDescription} numberOfLines={2}>
                {track.description}
              </Text>
              <View style={styles.trackStats}>
                <Text style={styles.trackStat}>📏 {track.distance_km}km</Text>
                <Text style={styles.trackStat}>⏱️ {Math.floor(track.duration_minutes / 60)}時間</Text>
                <Text style={styles.trackStat}>🚗 {track.route_type}</Text>
              </View>
              <Text style={styles.trackRoute}>
                {track.start_location} → {track.end_location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  experienceLevel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textInverse,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  accountAge: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: COLORS.primary,
  },
  followingButton: {
    backgroundColor: COLORS.grayLight,
  },
  messageButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: COLORS.textSecondary,
  },
  bio: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  contentContainer: {
    margin: SPACING.md,
    marginTop: 0,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  postContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  postActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  postAction: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  trackCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  trackTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  trackDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  trackStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  trackStat: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  trackRoute: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});