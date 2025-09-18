import React, { useEffect, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';

import { COLORS } from './src/constants/theme';
import { MainTabParamList, RootStackParamList } from './src/types';
import { setupGlobalErrorHandler } from './src/utils/errorHandler';
import { NetworkService } from './src/utils/network';

// スクリーンのインポート
import HomeScreen from './src/screens/HomeScreen';
// import MapScreen from './src/screens/MapScreen';
import RecordScreen from './src/screens/RecordScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import AuthScreen from './src/screens/AuthScreen';

// 遅延読み込み
const TrackDetailScreen = React.lazy(() => import('./src/screens/TrackDetailScreen'));

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// タブアイコンコンポーネント（シンプルなテキストアイコン）
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ 
    fontSize: 16, 
    color: focused ? COLORS.primary : COLORS.grayLight 
  }}>
    {label}
  </Text>
);

// メインタブナビゲーター
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grayLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textInverse,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: '🗾 北海道旅人',
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>🗺️ マップ機能</Text>
            <Text style={{ marginTop: 10, textAlign: 'center' }}>
              Web版では利用できません{'\n'}スマートフォンアプリでお試しください
            </Text>
          </View>
        )}
        options={{
          title: 'マップ',
          tabBarLabel: 'マップ',
          tabBarIcon: ({ focused }) => <TabIcon label="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Record" 
        component={RecordScreen}
        options={{
          title: 'GPS記録',
          tabBarLabel: '記録',
          tabBarIcon: ({ focused }) => <TabIcon label="📍" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{
          title: '旅仲間',
          tabBarLabel: '仲間',
          tabBarIcon: ({ focused }) => <TabIcon label="👥" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageScreen}
        options={{
          title: 'マイページ',
          tabBarLabel: 'マイ',
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // 初期化処理
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // グローバルエラーハンドラー設定
        setupGlobalErrorHandler();

        // ネットワークサービス初期化
        await NetworkService.initialize();

        console.log('[App] Initialization completed');
      } catch (error) {
        console.error('[App] Initialization failed:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePostScreen}
          options={{
            title: '投稿作成',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetailScreen}
          options={{
            title: '投稿詳細',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'プロフィール',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            title: 'ユーザー検索',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="TrackDetail"
          component={(props) => (
            <Suspense fallback={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10 }}>読み込み中...</Text>
              </View>
            }>
              <TrackDetailScreen {...props} />
            </Suspense>
          )}
          options={{
            title: 'ルート詳細',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.textInverse,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
