import { Platform } from 'react-native';
import { StorageService } from './storage';
import { User } from '../types';

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

interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
  loginMethod: 'guest' | 'email' | 'social';
}

export class AuthService {
  private static readonly AUTH_KEY = 'auth_user';
  private static readonly SESSION_KEY = 'auth_session';

  // ゲストログイン
  static async loginAsGuest(userName: string): Promise<AuthUser> {
    try {
      const guestUser: AuthUser = {
        id: `guest_${Date.now()}`,
        email: '',
        name: userName,
        isAuthenticated: true,
        loginMethod: 'guest',
      };

      // ユーザープロフィール作成
      const userProfile: User = {
        id: guestUser.id,
        name: userName,
        bio: '',
        travel_style: ['car'],
        experience_level: 'beginner',
        interests: [],
        location_sharing_level: 2,
        created_at: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem(this.AUTH_KEY, JSON.stringify(guestUser)),
        AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify({
          sessionId: `session_${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日
        })),
        StorageService.saveUserProfile(userProfile),
      ]);

      return guestUser;
    } catch (error) {
      console.error('ゲストログインエラー:', error);
      throw error;
    }
  }

  // メールログイン（簡易版）
  static async loginWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      // 実際のアプリではサーバー認証が必要
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードを入力してください');
      }

      // ダミー認証（実際はサーバーで検証）
      const emailUser: AuthUser = {
        id: `user_${email.replace('@', '_').replace('.', '_')}`,
        email,
        name: email.split('@')[0],
        isAuthenticated: true,
        loginMethod: 'email',
      };

      const userProfile: User = {
        id: emailUser.id,
        name: emailUser.name,
        bio: '',
        travel_style: ['car'],
        experience_level: 'beginner',
        interests: [],
        location_sharing_level: 2,
        created_at: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem(this.AUTH_KEY, JSON.stringify(emailUser)),
        AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify({
          sessionId: `session_${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })),
        StorageService.saveUserProfile(userProfile),
      ]);

      return emailUser;
    } catch (error) {
      console.error('メールログインエラー:', error);
      throw error;
    }
  }

  // アカウント作成
  static async createAccount(email: string, password: string, name: string): Promise<AuthUser> {
    try {
      if (!email || !password || !name) {
        throw new Error('すべての項目を入力してください');
      }

      if (password.length < 6) {
        throw new Error('パスワードは6文字以上で入力してください');
      }

      // 実際のアプリではサーバーでアカウント作成
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        isAuthenticated: true,
        loginMethod: 'email',
      };

      const userProfile: User = {
        id: newUser.id,
        name,
        bio: '',
        travel_style: ['car'],
        experience_level: 'beginner',
        interests: [],
        location_sharing_level: 2,
        created_at: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem(this.AUTH_KEY, JSON.stringify(newUser)),
        AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify({
          sessionId: `session_${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })),
        StorageService.saveUserProfile(userProfile),
      ]);

      return newUser;
    } catch (error) {
      console.error('アカウント作成エラー:', error);
      throw error;
    }
  }

  // ログアウト
  static async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.AUTH_KEY),
        AsyncStorage.removeItem(this.SESSION_KEY),
        // ユーザーデータは保持（設定で選択可能にする）
      ]);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  // 現在のユーザー取得
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(this.AUTH_KEY);
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);

      if (!userData || !sessionData) {
        return null;
      }

      const user = JSON.parse(userData);
      const session = JSON.parse(sessionData);

      // セッション有効期限チェック
      if (new Date() > new Date(session.expiresAt)) {
        await this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error('現在ユーザー取得エラー:', error);
      return null;
    }
  }

  // 認証状態チェック
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.isAuthenticated ?? false;
  }

  // パスワード変更（簡易版）
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (newPassword.length < 6) {
        throw new Error('新しいパスワードは6文字以上で入力してください');
      }

      // 実際のアプリではサーバーでパスワード検証・更新
      console.log('パスワード変更完了（ダミー実装）');
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      throw error;
    }
  }

  // アカウント削除
  static async deleteAccount(): Promise<void> {
    try {
      await Promise.all([
        this.logout(),
        StorageService.clearAllData(),
      ]);
    } catch (error) {
      console.error('アカウント削除エラー:', error);
      throw error;
    }
  }

  // セッション更新
  static async refreshSession(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify({
          sessionId: `session_${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
      }
    } catch (error) {
      console.error('セッション更新エラー:', error);
      throw error;
    }
  }

  // 自動ログイン設定
  static async setAutoLogin(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('auto_login_enabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('自動ログイン設定エラー:', error);
      throw error;
    }
  }

  static async getAutoLoginSetting(): Promise<boolean> {
    try {
      const setting = await AsyncStorage.getItem('auto_login_enabled');
      return setting ? JSON.parse(setting) : true;
    } catch (error) {
      console.error('自動ログイン設定取得エラー:', error);
      return true;
    }
  }
}