import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { POST_TYPES, getPostTypeInfo } from '../constants/posts';
import { HOKKAIDO_REGIONS, getRegionInfo } from '../constants/regions';
import { PostType, HokkaidoRegion, Post } from '../types';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';

export default function CreatePostScreen({ navigation }: any) {
  const [postType, setPostType] = useState<PostType>('status');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [region, setRegion] = useState<HokkaidoRegion>('doou');
  const [locationName, setLocationName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [isPosting, setIsPosting] = useState(false);

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
          
          // 逆ジオコーディングで地名取得
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (addressResponse.length > 0) {
            const address = addressResponse[0];
            const locationStr = `${address.city || address.subregion || ''}${address.district ? ' ' + address.district : ''}`;
            setLocationName(locationStr);
          }
        } catch (error) {
          console.error('位置情報取得エラー:', error);
        }
      }
    })();
  }, []);

  // 画像選択
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('権限が必要です', '写真を選択するためにフォトライブラリへのアクセス権限が必要です。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  // カメラで撮影
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('権限が必要です', 'カメラへのアクセス権限が必要です。');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  // 画像削除
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // タグ追加
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // タグ削除
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  // 投稿送信
  const submitPost = async () => {
    if (!content.trim()) {
      Alert.alert('エラー', '投稿内容を入力してください。');
      return;
    }

    setIsPosting(true);

    try {
      // 現在のユーザー取得
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        Alert.alert('エラー', 'ログインが必要です。');
        return;
      }

      // ユーザープロフィール取得
      const userProfile = await StorageService.getUserProfile();
      if (!userProfile) {
        Alert.alert('エラー', 'ユーザープロフィールが見つかりません。');
        return;
      }

      // 投稿データ作成
      const postData: Post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: currentUser.id,
        user: userProfile,
        content: content.trim(),
        images: images,
        post_type: postType,
        location_name: locationName.trim() || undefined,
        region: region,
        tags: tags,
        visibility: 'public',
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 位置情報があれば追加
      if (currentLocation) {
        (postData as any).lat = currentLocation.coords.latitude;
        (postData as any).lng = currentLocation.coords.longitude;
      }

      // ローカルストレージに保存
      await StorageService.savePost(postData);

      // オフライン投稿として保存（後でサーバーと同期用）
      await StorageService.saveOfflinePost({
        user_id: postData.user_id,
        user: postData.user,
        content: postData.content,
        images: postData.images,
        post_type: postData.post_type,
        location_name: postData.location_name,
        region: postData.region,
        tags: postData.tags,
        visibility: postData.visibility,
        likes_count: 0,
        comments_count: 0,
        updated_at: postData.updated_at,
      });

      Alert.alert('投稿完了', '投稿が正常に保存されました！', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

    } catch (error) {
      console.error('投稿エラー:', error);
      Alert.alert('エラー', '投稿の保存に失敗しました。');
    } finally {
      setIsPosting(false);
    }
  };

  const postTypeInfo = getPostTypeInfo(postType);
  const regionInfo = getRegionInfo(region);

  return (
    <ScrollView style={styles.container}>
      {/* 投稿タイプ選択 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 投稿タイプ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {POST_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeButton,
                postType === type.key && styles.typeButtonActive
              ]}
              onPress={() => setPostType(type.key)}
            >
              <Text style={[
                styles.typeButtonText,
                postType === type.key && styles.typeButtonTextActive
              ]}>
                {type.emoji} {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.typeDescription}>{postTypeInfo.description}</Text>
      </View>

      {/* 投稿内容 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✍️ 投稿内容</Text>
        <TextInput
          style={styles.contentInput}
          multiline
          numberOfLines={6}
          placeholder={`${postTypeInfo.emoji} ${postTypeInfo.name}について書いてください...`}
          placeholderTextColor={COLORS.textLight}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
      </View>

      {/* 写真 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 写真（任意）</Text>
        
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Text style={styles.imageButtonText}>📷 撮影</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>🖼️ 選択</Text>
          </TouchableOpacity>
        </View>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 地域選択 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ 地域</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {HOKKAIDO_REGIONS.filter(r => r.key !== 'all').map((regionOption) => (
            <TouchableOpacity
              key={regionOption.key}
              style={[
                styles.regionButton,
                region === regionOption.key && styles.regionButtonActive
              ]}
              onPress={() => setRegion(regionOption.key)}
            >
              <Text style={[
                styles.regionButtonText,
                region === regionOption.key && styles.regionButtonTextActive
              ]}>
                {regionOption.emoji} {regionOption.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 位置情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 場所（任意）</Text>
        <TextInput
          style={styles.locationInput}
          placeholder="具体的な場所名を入力..."
          placeholderTextColor={COLORS.textLight}
          value={locationName}
          onChangeText={setLocationName}
        />
        {currentLocation && (
          <Text style={styles.locationInfo}>
            現在地: {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* タグ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>#️⃣ タグ（任意）</Text>
        
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder="タグを入力..."
            placeholderTextColor={COLORS.textLight}
            value={currentTag}
            onChangeText={setCurrentTag}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Text style={styles.addTagButtonText}>追加</Text>
          </TouchableOpacity>
        </View>

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeTag(tag)}
              >
                <Text style={styles.tagText}>#{tag} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 投稿ボタン */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isPosting && styles.submitButtonDisabled]}
          onPress={submitPost}
          disabled={isPosting}
        >
          <Text style={styles.submitButtonText}>
            {isPosting ? '投稿中...' : '🚀 投稿する'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  typeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: BORDER_RADIUS.md,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  typeDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: 120,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  imageButton: {
    flex: 1,
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  previewImage: {
    width: 120,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  regionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: BORDER_RADIUS.md,
  },
  regionButtonActive: {
    backgroundColor: COLORS.primary,
  },
  regionButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  regionButtonTextActive: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  locationInfo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  addTagButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
  },
  submitContainer: {
    padding: SPACING.lg,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  submitButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});