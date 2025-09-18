import { Alert } from 'react-native';
import { ErrorHandler } from './errorHandler';

export interface NetworkState {
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  isInternetReachable: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  timestamp: Date;
}

export class NetworkService {
  private static networkState: NetworkState = {
    isConnected: false,
    connectionType: 'unknown',
    isInternetReachable: false,
  };

  private static listeners: ((state: NetworkState) => void)[] = [];

  // ネットワーク状態の初期化
  static async initialize(): Promise<void> {
    try {
      // 実際のアプリでは @react-native-community/netinfo を使用
      // 今回はダミー実装
      this.networkState = {
        isConnected: true,
        connectionType: 'wifi',
        isInternetReachable: true,
      };

      console.log('[NetworkService] Initialized with state:', this.networkState);
    } catch (error) {
      ErrorHandler.handle(error, 'NetworkService.initialize');
    }
  }

  // ネットワーク状態取得
  static getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  // ネットワーク状態監視
  static addNetworkListener(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);

    // リスナー解除関数を返す
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // ネットワーク状態更新
  private static updateNetworkState(newState: Partial<NetworkState>): void {
    this.networkState = { ...this.networkState, ...newState };
    this.listeners.forEach(listener => listener(this.networkState));
  }

  // 接続チェック
  static async checkConnection(): Promise<boolean> {
    try {
      // 実際のアプリでは実際の接続テストを行う
      const isConnected = Math.random() > 0.1; // 90%の確率で接続成功

      this.updateNetworkState({
        isConnected,
        isInternetReachable: isConnected,
      });

      return isConnected;
    } catch (error) {
      ErrorHandler.handle(error, 'NetworkService.checkConnection');
      return false;
    }
  }

  // API呼び出し（汎用）
  static async apiCall<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    options?: {
      timeout?: number;
      retries?: number;
      requireConnection?: boolean;
    }
  ): Promise<ApiResponse<T>> {
    const config = {
      timeout: 10000,
      retries: 3,
      requireConnection: true,
      ...options,
    };

    // 接続チェック
    if (config.requireConnection && !this.networkState.isConnected) {
      const error = new Error('ネットワーク接続がありません');
      return {
        success: false,
        error: ErrorHandler.handle(error, 'NetworkService.apiCall').message,
        timestamp: new Date(),
      };
    }

    try {
      // リトライ付きでAPI呼び出し
      const result = await ErrorHandler.withRetry(async () => {
        // 実際のAPIコール（ダミー実装）
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ランダムで成功/失敗を決める（デモ用）
        if (Math.random() > 0.8) {
          throw new Error('API call failed');
        }

        return {
          data: { message: `API call to ${endpoint} successful` } as T,
          success: true,
        };
      }, config.retries, `API call to ${endpoint}`);

      return {
        ...result,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorHandler.handle(error, `API call to ${endpoint}`).message,
        timestamp: new Date(),
      };
    }
  }

  // 同期処理（オフライン投稿など）
  static async syncOfflineData(): Promise<void> {
    if (!this.networkState.isConnected) {
      console.log('[NetworkService] Not connected, skipping sync');
      return;
    }

    try {
      console.log('[NetworkService] Starting offline data sync...');

      // ダミー同期処理
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('[NetworkService] Offline data sync completed');
    } catch (error) {
      ErrorHandler.handle(error, 'NetworkService.syncOfflineData');
    }
  }

  // 画像アップロード
  static async uploadImage(imageUri: string): Promise<ApiResponse<{ url: string }>> {
    if (!this.networkState.isConnected) {
      return {
        success: false,
        error: 'ネットワーク接続がありません',
        timestamp: new Date(),
      };
    }

    try {
      console.log('[NetworkService] Uploading image...');

      // ダミーアップロード処理
      await new Promise(resolve => setTimeout(resolve, 3000));

      // ランダムで成功/失敗
      if (Math.random() > 0.9) {
        throw new Error('Image upload failed');
      }

      return {
        data: { url: `https://example.com/images/${Date.now()}.jpg` },
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorHandler.handle(error, 'NetworkService.uploadImage').message,
        timestamp: new Date(),
      };
    }
  }

  // バッチ処理
  static async batchRequest<T = any>(
    requests: Array<{
      endpoint: string;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
    }>
  ): Promise<ApiResponse<T[]>> {
    if (!this.networkState.isConnected) {
      return {
        success: false,
        error: 'ネットワーク接続がありません',
        timestamp: new Date(),
      };
    }

    try {
      console.log(`[NetworkService] Processing batch of ${requests.length} requests...`);

      const results = await Promise.allSettled(
        requests.map(req =>
          this.apiCall<T>(req.endpoint, req.method, req.data, { requireConnection: false })
        )
      );

      const successfulResults = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<ApiResponse<T>>).value.data!);

      const failedCount = results.length - successfulResults.length;

      if (failedCount > 0) {
        console.warn(`[NetworkService] ${failedCount} out of ${requests.length} requests failed`);
      }

      return {
        data: successfulResults,
        success: successfulResults.length > 0,
        error: failedCount > 0 ? `${failedCount}件のリクエストが失敗しました` : undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorHandler.handle(error, 'NetworkService.batchRequest').message,
        timestamp: new Date(),
      };
    }
  }

  // オフライン対応の警告表示
  static showOfflineWarning(): void {
    Alert.alert(
      'オフラインモード',
      'インターネット接続がありません。一部機能が制限されますが、データはローカルに保存され、接続回復時に同期されます。',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  }

  // 接続復旧時の処理
  static onConnectionRestored(): void {
    Alert.alert(
      '接続復旧',
      'インターネット接続が復旧しました。オフラインで保存されたデータを同期しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '同期する',
          onPress: () => this.syncOfflineData(),
        },
      ]
    );
  }

  // 接続状態に応じたメッセージ
  static getConnectionMessage(): string {
    const state = this.getNetworkState();

    if (!state.isConnected) {
      return 'オフライン';
    }

    if (!state.isInternetReachable) {
      return 'インターネットに接続されていません';
    }

    switch (state.connectionType) {
      case 'wifi':
        return 'Wi-Fi接続';
      case 'cellular':
        return 'モバイル回線';
      default:
        return 'オンライン';
    }
  }

  // 帯域幅に応じた設定調整
  static getOptimalSettings(): {
    imageQuality: number;
    videoQuality: 'low' | 'medium' | 'high';
    autoSync: boolean;
  } {
    const state = this.getNetworkState();

    if (state.connectionType === 'wifi') {
      return {
        imageQuality: 0.9,
        videoQuality: 'high',
        autoSync: true,
      };
    }

    if (state.connectionType === 'cellular') {
      return {
        imageQuality: 0.7,
        videoQuality: 'medium',
        autoSync: false,
      };
    }

    return {
      imageQuality: 0.5,
      videoQuality: 'low',
      autoSync: false,
    };
  }
}