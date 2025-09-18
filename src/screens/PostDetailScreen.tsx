import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { getPostTypeInfo } from '../constants/posts';
import { getRegionInfo } from '../constants/regions';
import { Post, Comment, Like } from '../types';

// ダミーデータ
const DUMMY_POST: Post = {
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
  content: '登別地獄谷到着🔥\n硫黄の匂いがすごい！\n観光客多めですが、やっぱり圧巻の景色です。温泉街も賑わっていて、おすすめの宿があれば教えてください！',
  images: [],
  post_type: 'status',
  location_name: '登別地獄谷',
  region: 'doou',
  tags: ['温泉', '観光', '登別'],
  visibility: 'public',
  likes_count: 15,
  comments_count: 4,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

const DUMMY_COMMENTS: Comment[] = [
  {
    id: '1',
    user_id: 'user2',
    user: {
      id: 'user2',
      name: '田中花子',
      avatar_url: '',
      travel_style: ['car'],
      experience_level: 'expert',
      interests: ['onsen'],
      location_sharing_level: 1,
      created_at: '2024-01-01',
    },
    post_id: '1',
    content: '登別温泉なら「第一滝本館」がおすすめです！源泉かけ流しで最高でした✨',
    likes_count: 3,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
  },
  {
    id: '2',
    user_id: 'user3',
    user: {
      id: 'user3',
      name: '佐藤次郎',
      avatar_url: '',
      travel_style: ['bike'],
      experience_level: 'beginner',
      interests: ['scenery'],
      location_sharing_level: 2,
      created_at: '2024-01-01',
    },
    post_id: '1',
    content: '地獄谷、本当に迫力ありますよね！写真撮るなら展望台からがベストアングルです📸',
    likes_count: 1,
    created_at: '2024-01-15T11:15:00Z',
    updated_at: '2024-01-15T11:15:00Z',
  },
];

export default function PostDetailScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const [post] = useState<Post>(DUMMY_POST); // 実際はAPIから取得
  const [comments, setComments] = useState<Comment[]>(DUMMY_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [isCommenting, setIsCommenting] = useState(false);

  // いいね機能
  const toggleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      
      // TODO: APIにいいね状態を送信
      // await likePost(postId, !isLiked);
      
    } catch (error) {
      // エラー時は状態を戻す
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      Alert.alert('エラー', 'いいねの送信に失敗しました。');
    }
  };

  // コメント送信
  const submitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('エラー', 'コメントを入力してください。');
      return;
    }

    setIsCommenting(true);
    
    try {
      // TODO: 実際のAPIへのコメント送信
      const tempComment: Comment = {
        id: Date.now().toString(),
        user_id: 'current_user',
        user: {
          id: 'current_user',
          name: 'あなた',
          avatar_url: '',
          travel_style: ['car'],
          experience_level: 'intermediate',
          interests: ['gourmet'],
          location_sharing_level: 2,
          created_at: '2024-01-01',
        },
        post_id: postId,
        content: newComment.trim(),
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setComments(prev => [...prev, tempComment]);
      setNewComment('');
      
    } catch (error) {
      Alert.alert('エラー', 'コメントの送信に失敗しました。');
    } finally {
      setIsCommenting(false);
    }
  };

  // コメントにいいね
  const toggleCommentLike = async (commentId: string) => {
    try {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes_count: comment.likes_count + 1 }
          : comment
      ));
      
      // TODO: APIにコメントいいねを送信
      
    } catch (error) {
      Alert.alert('エラー', 'いいねの送信に失敗しました。');
    }
  };

  // 時間表示の計算
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postTime = new Date(dateString);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分前`;
    } else {
      return '今';
    }
  };

  const postTypeInfo = getPostTypeInfo(post.post_type);
  const regionInfo = getRegionInfo(post.region);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        {/* 投稿内容 */}
        <View style={styles.postContainer}>
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
            <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                {isLiked ? '❤️' : '🤍'} {likeCount}
              </Text>
            </TouchableOpacity>
            <Text style={styles.actionText}>💬 {comments.length}</Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>📤 シェア</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* コメント一覧 */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>💬 コメント ({comments.length})</Text>
          
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentUserInfo}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.user?.name.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.commentUserName}>{comment.user?.name}</Text>
                    <Text style={styles.commentTime}>{getTimeAgo(comment.created_at)}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.commentLikeButton}
                  onPress={() => toggleCommentLike(comment.id)}
                >
                  <Text style={styles.commentLikeText}>
                    🤍 {comment.likes_count}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* コメント入力 */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          multiline
          placeholder="コメントを入力..."
          placeholderTextColor={COLORS.textLight}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
          onPress={submitComment}
          disabled={!newComment.trim() || isCommenting}
        >
          <Text style={styles.submitButtonText}>
            {isCommenting ? '送信中...' : '送信'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  postType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  timeAgo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  locationBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textInverse,
  },
  postContent: {
    marginBottom: SPACING.md,
  },
  contentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
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
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  actionTextActive: {
    color: COLORS.error,
  },
  commentsContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginTop: 0,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  commentsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  commentItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  commentAvatarText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  commentUserName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  commentTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  commentLikeButton: {
    padding: SPACING.xs,
  },
  commentLikeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  commentContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  submitButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});