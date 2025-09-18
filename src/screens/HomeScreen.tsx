import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';

import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { HOKKAIDO_REGIONS, getRegionInfo } from '../constants/regions';
import { POST_TYPES, getPostTypeInfo } from '../constants/posts';
import { HokkaidoRegion, Post } from '../types';

// ダミーデータ（後でAPIから取得）
const DUMMY_POSTS: Post[] = [
  {
    id: '1',
    user_id: 'user1',
    user: {
      id: 'user1',
      name: '山田太郎',
      avatar_url: '',
      travel_style: ['bike'],
      experience_level: 'intermediate',
      interests: ['onsen', 'gourmet'],
      location_sharing_level: 2,
      created_at: '2024-01-01',
    },
    content: '登別地獄谷到着🔥\n硫黄の匂いがすごい！\n観光客多めです',
    images: [],
    post_type: 'status',
    location_name: '登別地獄谷',
    region: 'doou',
    tags: ['温泉', '観光'],
    visibility: 'public',
    likes_count: 15,
    comments_count: 4,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    user_id: 'user2',
    user: {
      id: 'user2',
      name: '田中花子',
      avatar_url: '',
      travel_style: ['car'],
      experience_level: 'beginner',
      interests: ['gourmet', 'scenery'],
      location_sharing_level: 1,
      created_at: '2024-01-01',
    },
    content: '函館朝市で海鮮丼🐟\n500円でこのボリューム！\n観光客少なめで狙い目✨',
    images: [],
    post_type: 'spot',
    location_name: '函館朝市',
    region: 'dounan',
    tags: ['グルメ', '海鮮'],
    visibility: 'public',
    likes_count: 8,
    comments_count: 2,
    created_at: '2024-01-15T08:15:00Z',
    updated_at: '2024-01-15T08:15:00Z',
  },
  {
    id: '3',
    user_id: 'user3',
    user: {
      id: 'user3',
      name: '佐藤次郎',
      avatar_url: '',
      travel_style: ['car'],
      experience_level: 'expert',
      interests: ['scenery'],
      location_sharing_level: 3,
      created_at: '2024-01-01',
    },
    content: '⚠️ 峠道積雪注意\n国道274号線、日勝峠付近で路面凍結\nスタッドレス必須です！',
    images: [],
    post_type: 'info',
    location_name: '日勝峠',
    region: 'doutou',
    tags: ['道路情報', '積雪'],
    visibility: 'public',
    likes_count: 32,
    comments_count: 8,
    created_at: '2024-01-15T06:45:00Z',
    updated_at: '2024-01-15T06:45:00Z',
  },
];

export default function HomeScreen({ navigation }: any) {
  const [selectedRegion, setSelectedRegion] = useState<HokkaidoRegion>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);

  // ダミーフォローリスト（後でStorageServiceから取得）
  const followingUsers = ['user1', 'user3'];

  // リフレッシュ処理
  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: APIから最新の投稿を取得
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // フィルタリング
  const filteredPosts = posts.filter(post => {
    // 地域フィルター
    const regionMatch = selectedRegion === 'all' || post.region === selectedRegion;

    // フォローフィルター
    const followMatch = selectedFilter === 'all' || followingUsers.includes(post.user_id);

    return regionMatch && followMatch;
  });

  // 投稿カードコンポーネント
  const PostCard = ({ post }: { post: Post }) => {
    const postTypeInfo = getPostTypeInfo(post.post_type);
    const regionInfo = getRegionInfo(post.region);
    
    // 時間表示の計算
    const getTimeAgo = (dateString: string) => {
      const now = new Date();
      const postTime = new Date(dateString);
      const diffMs = now.getTime() - postTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffHours > 0) {
        return `${diffHours}時間前`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分前`;
      } else {
        return '今';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.postCard}
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        activeOpacity={0.7}
      >
        {/* ヘッダー */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {post.user?.name.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{post.user?.name}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.postType}>
                  {postTypeInfo.emoji} {postTypeInfo.name}
                </Text>
                <Text style={styles.timeAgo}>{getTimeAgo(post.created_at)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>
              📍 {post.location_name || regionInfo.name}
            </Text>
          </View>
        </View>

        {/* コンテンツ */}
        <View style={styles.postContent}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>

        {/* タグ */}
        {post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* アクション */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>❤️ {post.likes_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>💬 {post.comments_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>📤 シェア</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 地域タブ */}
      <View style={styles.regionTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {HOKKAIDO_REGIONS.map((region) => (
            <TouchableOpacity
              key={region.key}
              style={[
                styles.regionTab,
                selectedRegion === region.key && styles.regionTabActive
              ]}
              onPress={() => setSelectedRegion(region.key)}
            >
              <Text style={[
                styles.regionTabText,
                selectedRegion === region.key && styles.regionTabTextActive
              ]}>
                {region.emoji} {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* フィルタータブ */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'all' && styles.filterTabActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[
            styles.filterTabText,
            selectedFilter === 'all' && styles.filterTabTextActive
          ]}>
            🌐 すべて
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'following' && styles.filterTabActive
          ]}
          onPress={() => setSelectedFilter('following')}
        >
          <Text style={[
            styles.filterTabText,
            selectedFilter === 'following' && styles.filterTabTextActive
          ]}>
            👥 フォロー中
          </Text>
        </TouchableOpacity>
      </View>

      {/* クイック投稿 */}
      <TouchableOpacity 
        style={styles.quickPost}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.quickPostText}>
          📝 今の気持ちを投稿...
        </Text>
      </TouchableOpacity>

      {/* タイムライン */}
      <ScrollView
        style={styles.timeline}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  regionTabs: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  regionTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
  },
  regionTabActive: {
    backgroundColor: COLORS.primary,
  },
  regionTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  regionTabTextActive: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  quickPost: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPostText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  timeline: {
    flex: 1,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  timeAgo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  locationBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  locationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textInverse,
  },
  postContent: {
    marginBottom: SPACING.sm,
  },
  contentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
});