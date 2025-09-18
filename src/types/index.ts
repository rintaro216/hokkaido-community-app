// 基本的な型定義
export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  travel_style: TravelStyle[];
  experience_level: ExperienceLevel;
  interests: Interest[];
  location_sharing_level: number;
  created_at: string;
}

export type TravelStyle = 'bike' | 'car' | 'train' | 'walking' | 'bicycle';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert' | 'local';
export type Interest = 'onsen' | 'gourmet' | 'scenery' | 'culture' | 'camping' | 'photography' | 'outdoor';

// 地域定義
export type HokkaidoRegion = 'all' | 'dohoku' | 'doou' | 'dounan' | 'doutou';

export interface RegionInfo {
  key: HokkaidoRegion;
  name: string;
  emoji: string;
}

// 投稿関連
export interface Post {
  id: string;
  user_id: string;
  user?: User;
  content: string;
  images?: string[];
  post_type: PostType;
  location_name?: string;
  lat?: number;
  lng?: number;
  region: HokkaidoRegion;
  tags: string[];
  metadata?: Record<string, any>;
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export type PostType = 'status' | 'spot' | 'info' | 'help' | 'log';

export interface PostTypeInfo {
  key: PostType;
  name: string;
  emoji: string;
  description: string;
}

// いいね・リアクション
export interface Like {
  id: string;
  user_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  reaction_type: 'like' | 'helpful' | 'thanks';
  created_at: string;
}

// コメント
export interface Comment {
  id: string;
  user_id: string;
  user?: User;
  post_id: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

// GPS・位置情報
export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

export interface Track {
  id: string;
  user_id: string;
  user?: User;
  title: string;
  description?: string;
  points: LocationPoint[];
  distance_km: number;
  duration_minutes: number;
  elevation_gain?: number;
  start_location?: string;
  end_location?: string;
  start_time: string;
  end_time: string;
  route_type: TravelStyle;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
}

// スポット情報
export interface Spot {
  id: string;
  name: string;
  description?: string;
  category: SpotCategory;
  subcategory?: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  website?: string;
  business_hours?: Record<string, any>;
  price_range?: string;
  images?: string[];
  verified_at?: string;
  created_by: string;
  created_at: string;
}

export type SpotCategory = 
  | 'accommodation'  // 宿泊
  | 'camping'        // キャンプ
  | 'fuel'          // 燃料
  | 'food'          // グルメ
  | 'sightseeing'   // 観光
  | 'onsen'         // 温泉
  | 'service'       // サービス
  | 'shopping'      // 買い物
  | 'communication'; // 通信

export interface SpotCategoryInfo {
  key: SpotCategory;
  name: string;
  emoji: string;
  color: string;
}

// フォロー関係
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// ナビゲーション関連
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PostDetail: { postId: string };
  Profile: { userId: string };
  CreatePost: undefined;
  TrackDetail: { trackId: string };
  Search: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Record: undefined;
  Community: undefined;
  MyPage: undefined;
};