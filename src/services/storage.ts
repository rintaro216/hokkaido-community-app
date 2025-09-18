import { Platform } from 'react-native';
import { User, Post, LocationPoint, Spot } from '../types';

// Web版では localStorage を使用
let AsyncStorage: any;
if (Platform.OS === 'web') {
  AsyncStorage = {
    setItem: async (key: string, value: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn('localStorage.setItem failed:', e);
      }
    },
    getItem: async (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        console.warn('localStorage.getItem failed:', e);
      }
      return null;
    },
    removeItem: async (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('localStorage.removeItem failed:', e);
      }
    },
  };
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export class StorageService {
  private static readonly KEYS = {
    USER_PROFILE: 'user_profile',
    SAVED_TRACKS: 'saved_tracks',
    SAVED_POSTS: 'saved_posts',
    FOLLOWING_USERS: 'following_users',
    USER_SETTINGS: 'user_settings',
    OFFLINE_POSTS: 'offline_posts',
    FAVORITE_SPOTS: 'favorite_spots',
  };

  // ユーザープロフィール
  static async saveUserProfile(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(user));
    } catch (error) {
      console.error('ユーザープロフィール保存エラー:', error);
      throw error;
    }
  }

  static async getUserProfile(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('ユーザープロフィール取得エラー:', error);
      return null;
    }
  }

  // GPS記録データ
  static async saveTrack(trackId: string, trackData: {
    points: LocationPoint[];
    metadata: {
      name: string;
      startTime: string;
      endTime: string;
      distance: number;
      travelStyle: string;
      region: string;
    };
  }): Promise<void> {
    try {
      const existingTracks = await this.getSavedTracks();
      const newTracks = {
        ...existingTracks,
        [trackId]: {
          ...trackData,
          savedAt: new Date().toISOString(),
        },
      };
      await AsyncStorage.setItem(this.KEYS.SAVED_TRACKS, JSON.stringify(newTracks));
    } catch (error) {
      console.error('GPS記録保存エラー:', error);
      throw error;
    }
  }

  static async getSavedTracks(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SAVED_TRACKS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('GPS記録取得エラー:', error);
      return {};
    }
  }

  static async deleteTrack(trackId: string): Promise<void> {
    try {
      const existingTracks = await this.getSavedTracks();
      delete existingTracks[trackId];
      await AsyncStorage.setItem(this.KEYS.SAVED_TRACKS, JSON.stringify(existingTracks));
    } catch (error) {
      console.error('GPS記録削除エラー:', error);
      throw error;
    }
  }

  // 投稿データ（オフライン対応）
  static async savePost(post: Post): Promise<void> {
    try {
      const existingPosts = await this.getSavedPosts();
      const newPosts = [...existingPosts, { ...post, savedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(this.KEYS.SAVED_POSTS, JSON.stringify(newPosts));
    } catch (error) {
      console.error('投稿保存エラー:', error);
      throw error;
    }
  }

  static async getSavedPosts(): Promise<Post[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SAVED_POSTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('投稿取得エラー:', error);
      return [];
    }
  }

  // オフライン投稿（ネット接続時に同期予定）
  static async saveOfflinePost(post: Omit<Post, 'id'>): Promise<void> {
    try {
      const existingPosts = await this.getOfflinePosts();
      const newPost = {
        ...post,
        id: `offline_${Date.now()}`,
        created_at: new Date().toISOString(),
        needsSync: true,
      };
      const newPosts = [...existingPosts, newPost];
      await AsyncStorage.setItem(this.KEYS.OFFLINE_POSTS, JSON.stringify(newPosts));
    } catch (error) {
      console.error('オフライン投稿保存エラー:', error);
      throw error;
    }
  }

  static async getOfflinePosts(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.OFFLINE_POSTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('オフライン投稿取得エラー:', error);
      return [];
    }
  }

  static async clearOfflinePosts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.KEYS.OFFLINE_POSTS);
    } catch (error) {
      console.error('オフライン投稿クリアエラー:', error);
      throw error;
    }
  }

  // フォロー管理
  static async saveFollowingUsers(userIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.FOLLOWING_USERS, JSON.stringify(userIds));
    } catch (error) {
      console.error('フォローリスト保存エラー:', error);
      throw error;
    }
  }

  static async getFollowingUsers(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.FOLLOWING_USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('フォローリスト取得エラー:', error);
      return [];
    }
  }

  // お気に入りスポット
  static async saveFavoriteSpot(spot: Spot): Promise<void> {
    try {
      const existingSpots = await this.getFavoriteSpots();
      const spotExists = existingSpots.some(s => s.id === spot.id);
      if (!spotExists) {
        const newSpots = [...existingSpots, { ...spot, savedAt: new Date().toISOString() }];
        await AsyncStorage.setItem(this.KEYS.FAVORITE_SPOTS, JSON.stringify(newSpots));
      }
    } catch (error) {
      console.error('お気に入りスポット保存エラー:', error);
      throw error;
    }
  }

  static async getFavoriteSpots(): Promise<Spot[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.FAVORITE_SPOTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('お気に入りスポット取得エラー:', error);
      return [];
    }
  }

  static async removeFavoriteSpot(spotId: string): Promise<void> {
    try {
      const existingSpots = await this.getFavoriteSpots();
      const filteredSpots = existingSpots.filter(spot => spot.id !== spotId);
      await AsyncStorage.setItem(this.KEYS.FAVORITE_SPOTS, JSON.stringify(filteredSpots));
    } catch (error) {
      console.error('お気に入りスポット削除エラー:', error);
      throw error;
    }
  }

  // 設定データ
  static async saveUserSettings(settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    locationSharing: number;
    autoBackup: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('設定保存エラー:', error);
      throw error;
    }
  }

  static async getUserSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : {
        theme: 'light',
        notifications: true,
        locationSharing: 2,
        autoBackup: true,
      };
    } catch (error) {
      console.error('設定取得エラー:', error);
      return {
        theme: 'light',
        notifications: true,
        locationSharing: 2,
        autoBackup: true,
      };
    }
  }

  // データ一括削除（ログアウト時など）
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.USER_PROFILE,
        this.KEYS.SAVED_TRACKS,
        this.KEYS.SAVED_POSTS,
        this.KEYS.FOLLOWING_USERS,
        this.KEYS.OFFLINE_POSTS,
        this.KEYS.FAVORITE_SPOTS,
      ]);
    } catch (error) {
      console.error('データクリアエラー:', error);
      throw error;
    }
  }

  // データエクスポート（バックアップ用）
  static async exportAllData(): Promise<string> {
    try {
      const allData = {
        userProfile: await this.getUserProfile(),
        savedTracks: await this.getSavedTracks(),
        savedPosts: await this.getSavedPosts(),
        followingUsers: await this.getFollowingUsers(),
        favoriteSpots: await this.getFavoriteSpots(),
        userSettings: await this.getUserSettings(),
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('データエクスポートエラー:', error);
      throw error;
    }
  }

  // データインポート（バックアップ復元用）
  static async importAllData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.userProfile) {
        await this.saveUserProfile(data.userProfile);
      }
      if (data.savedTracks) {
        await AsyncStorage.setItem(this.KEYS.SAVED_TRACKS, JSON.stringify(data.savedTracks));
      }
      if (data.savedPosts) {
        await AsyncStorage.setItem(this.KEYS.SAVED_POSTS, JSON.stringify(data.savedPosts));
      }
      if (data.followingUsers) {
        await this.saveFollowingUsers(data.followingUsers);
      }
      if (data.favoriteSpots) {
        await AsyncStorage.setItem(this.KEYS.FAVORITE_SPOTS, JSON.stringify(data.favoriteSpots));
      }
      if (data.userSettings) {
        await this.saveUserSettings(data.userSettings);
      }
    } catch (error) {
      console.error('データインポートエラー:', error);
      throw error;
    }
  }
}