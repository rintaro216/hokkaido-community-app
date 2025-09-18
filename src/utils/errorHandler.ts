import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  private static errorLog: AppError[] = [];

  // エラー分類
  static readonly ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    LOCATION: 'LOCATION_ERROR',
    STORAGE: 'STORAGE_ERROR',
    AUTH: 'AUTH_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
  } as const;

  // エラー処理
  static handle(error: any, context?: string): AppError {
    console.error(`[ErrorHandler] ${context || 'Unknown context'}:`, error);

    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
    };

    // エラーログに追加
    this.errorLog.push(appError);

    // ログが100件を超えたら古いものを削除
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    return appError;
  }

  // エラーコード判定
  private static getErrorCode(error: any): string {
    if (error?.message?.includes('Network')) {
      return this.ERROR_TYPES.NETWORK;
    }
    if (error?.message?.includes('location') || error?.message?.includes('Location')) {
      return this.ERROR_TYPES.LOCATION;
    }
    if (error?.message?.includes('storage') || error?.message?.includes('Storage')) {
      return this.ERROR_TYPES.STORAGE;
    }
    if (error?.message?.includes('auth') || error?.message?.includes('Auth')) {
      return this.ERROR_TYPES.AUTH;
    }
    if (error?.name === 'ValidationError') {
      return this.ERROR_TYPES.VALIDATION;
    }
    return this.ERROR_TYPES.UNKNOWN;
  }

  // ユーザー向けエラーメッセージ
  private static getErrorMessage(error: any): string {
    const errorCode = this.getErrorCode(error);

    switch (errorCode) {
      case this.ERROR_TYPES.NETWORK:
        return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
      case this.ERROR_TYPES.LOCATION:
        return '位置情報の取得に失敗しました。設定で位置情報の使用を許可してください。';
      case this.ERROR_TYPES.STORAGE:
        return 'データの保存に失敗しました。ストレージの空き容量を確認してください。';
      case this.ERROR_TYPES.AUTH:
        return '認証に失敗しました。もう一度ログインしてください。';
      case this.ERROR_TYPES.VALIDATION:
        return '入力内容に問題があります。内容を確認してください。';
      default:
        return '予期しないエラーが発生しました。時間を置いて再度お試しください。';
    }
  }

  // ユーザーにエラーを表示
  static showError(error: any, context?: string, showDialog: boolean = true): AppError {
    const appError = this.handle(error, context);

    if (showDialog) {
      Alert.alert(
        'エラーが発生しました',
        appError.message,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }

    return appError;
  }

  // リトライ付きエラーハンドリング
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`[${context}] Attempt ${attempt}/${maxRetries} failed:`, error);

        // 最後の試行でない場合は待機
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw this.handle(lastError, context);
  }

  // ネットワークエラー専用ハンドリング
  static handleNetworkError(error: any, context?: string): AppError {
    const networkError = this.handle(error, context);

    Alert.alert(
      'ネットワークエラー',
      'インターネット接続を確認して、もう一度お試しください。',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );

    return networkError;
  }

  // 位置情報エラー専用ハンドリング
  static handleLocationError(error: any, context?: string): AppError {
    const locationError = this.handle(error, context);

    Alert.alert(
      '位置情報エラー',
      '位置情報の使用を許可してください。設定アプリから「北海道旅人」の位置情報アクセスを有効にしてください。',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );

    return locationError;
  }

  // エラーログ取得
  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // エラーログクリア
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  // エラー統計
  static getErrorStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};

    this.errorLog.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1;
    });

    return stats;
  }

  // デバッグ用エラー情報
  static getDebugInfo(): any {
    return {
      totalErrors: this.errorLog.length,
      stats: this.getErrorStats(),
      recentErrors: this.errorLog.slice(-10),
    };
  }

  // 致命的エラーハンドリング
  static handleFatalError(error: any, context?: string): void {
    const fatalError = this.handle(error, context);

    Alert.alert(
      '致命的エラー',
      'アプリで重大な問題が発生しました。アプリを再起動してください。',
      [
        {
          text: '詳細',
          onPress: () => {
            Alert.alert(
              'エラー詳細',
              `コード: ${fatalError.code}\n時刻: ${fatalError.timestamp.toLocaleString()}\n\n開発者に報告する場合は、この情報をお伝えください。`,
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  }
}

// グローバルエラーハンドラー設定
export const setupGlobalErrorHandler = () => {
  const originalConsoleError = console.error;

  console.error = (...args) => {
    // 元のconsole.errorを呼び出し
    originalConsoleError(...args);

    // エラーハンドラーでログ記録
    if (args.length > 0) {
      ErrorHandler.handle(args[0], 'Console Error');
    }
  };

  // React Native のエラーハンドリング
  if (__DEV__) {
    // 開発モードでは詳細なエラー情報を表示
    console.log('[ErrorHandler] Development mode: detailed error logging enabled');
  } else {
    // 本番モードではユーザーフレンドリーなエラー表示
    console.log('[ErrorHandler] Production mode: user-friendly error handling enabled');
  }
};