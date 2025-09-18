import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { AuthService } from '../services/auth';

type AuthMode = 'login' | 'signup';

export default function AuthScreen({ navigation }: any) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // 自動ログインチェック
  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const isAutoLoginEnabled = await AuthService.getAutoLoginSetting();
      const currentUser = await AuthService.getCurrentUser();

      if (isAutoLoginEnabled && currentUser?.isAuthenticated) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('自動ログインチェックエラー:', error);
    }
  };

  // フォームデータ更新
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // バリデーション
  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください。');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return false;
    }
    
    if (!formData.password.trim()) {
      Alert.alert('エラー', 'パスワードを入力してください。');
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください。');
      return false;
    }
    
    if (authMode === 'signup') {
      if (!formData.name.trim()) {
        Alert.alert('エラー', '名前を入力してください。');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('エラー', 'パスワードが一致しません。');
        return false;
      }
    }
    
    return true;
  };

  // ログイン処理
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await AuthService.loginWithEmail(formData.email, formData.password);
      Alert.alert('ログイン成功', `ようこそ、${user.name}さん！`, [
        {
          text: 'OK',
          onPress: () => navigation.replace('Main'),
        },
      ]);
    } catch (error) {
      Alert.alert('ログイン失敗', error instanceof Error ? error.message : 'ログインに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // サインアップ処理
  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await AuthService.createAccount(formData.email, formData.password, formData.name);
      Alert.alert(
        'アカウント作成完了',
        `${user.name}さん、アカウントが作成されました！自動的にログインします。`,
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Main'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('アカウント作成失敗', error instanceof Error ? error.message : 'アカウント作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ゲストログイン
  const handleGuestLogin = async () => {
    Alert.alert(
      'ゲストログイン',
      'ゲストとしてアプリを利用しますか？\n一部機能が制限されます。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ゲストで続行',
          onPress: async () => {
            try {
              setIsLoading(true);
              const userName = `ゲスト${Date.now().toString().slice(-4)}`;
              await AuthService.loginAsGuest(userName);
              navigation.replace('Main');
            } catch (error) {
              Alert.alert('エラー', 'ゲストログインに失敗しました。');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.logo}>🗾</Text>
          <Text style={styles.title}>北海道旅人</Text>
          <Text style={styles.subtitle}>
            {authMode === 'login' ? 'アカウントにログイン' : '新しいアカウントを作成'}
          </Text>
        </View>

        {/* フォーム */}
        <View style={styles.form}>
          {authMode === 'signup' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>名前</Text>
              <TextInput
                style={styles.textInput}
                placeholder="山田太郎"
                placeholderTextColor={COLORS.textLight}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>メールアドレス</Text>
            <TextInput
              style={styles.textInput}
              placeholder="your-email@example.com"
              placeholderTextColor={COLORS.textLight}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>パスワード</Text>
            <TextInput
              style={styles.textInput}
              placeholder="6文字以上"
              placeholderTextColor={COLORS.textLight}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {authMode === 'signup' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>パスワード確認</Text>
              <TextInput
                style={styles.textInput}
                placeholder="パスワードを再入力"
                placeholderTextColor={COLORS.textLight}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          )}

          {/* メインボタン */}
          <TouchableOpacity
            style={[styles.mainButton, isLoading && styles.buttonDisabled]}
            onPress={authMode === 'login' ? handleLogin : handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.mainButtonText}>
              {isLoading ? '処理中...' : authMode === 'login' ? 'ログイン' : 'アカウント作成'}
            </Text>
          </TouchableOpacity>

          {/* モード切り替え */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {authMode === 'login' ? 'アカウントをお持ちでない方は' : '既にアカウントをお持ちの方は'}
            </Text>
            <TouchableOpacity
              onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            >
              <Text style={styles.switchLink}>
                {authMode === 'login' ? '新規登録' : 'ログイン'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ゲストログイン */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Text style={styles.guestButtonText}>ゲストとして利用</Text>
          </TouchableOpacity>
        </View>

        {/* フッター情報 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
          </Text>
          
          {authMode === 'login' && (
            <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>🎯 デモアカウント</Text>
              <Text style={styles.demoText}>メール: demo@hokkaido.com</Text>
              <Text style={styles.demoText}>パスワード: demo123</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.secondaryLight,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  mainButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  switchLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  guestButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  guestButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  demoInfo: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textInverse,
    marginBottom: SPACING.xs,
  },
  demoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textInverse,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});