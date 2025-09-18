import { PostTypeInfo, PostType, SpotCategoryInfo, SpotCategory } from '../types';

export const POST_TYPES: PostTypeInfo[] = [
  {
    key: 'status',
    name: '移動状況',
    emoji: '🚗',
    description: '移動中の状況や現在地情報'
  },
  {
    key: 'spot',
    name: 'スポット情報',
    emoji: '📍',
    description: 'おすすめの場所や施設の情報'
  },
  {
    key: 'info',
    name: 'リアルタイム情報',
    emoji: '⚠️',
    description: '道路状況、天候、営業情報など'
  },
  {
    key: 'help',
    name: 'ヘルプ',
    emoji: '🆘',
    description: '困った時の相談や助けを求める'
  },
  {
    key: 'log',
    name: '旅行記',
    emoji: '📖',
    description: '詳細な体験談や旅の振り返り'
  }
];

export const SPOT_CATEGORIES: SpotCategoryInfo[] = [
  {
    key: 'accommodation',
    name: '宿泊',
    emoji: '🏨',
    color: '#4A90E2'
  },
  {
    key: 'camping',
    name: 'キャンプ',
    emoji: '🏕️',
    color: '#7ED321'
  },
  {
    key: 'fuel',
    name: '燃料',
    emoji: '⛽',
    color: '#F5A623'
  },
  {
    key: 'food',
    name: 'グルメ',
    emoji: '🍜',
    color: '#D0021B'
  },
  {
    key: 'sightseeing',
    name: '観光',
    emoji: '🎌',
    color: '#9013FE'
  },
  {
    key: 'onsen',
    name: '温泉',
    emoji: '♨️',
    color: '#FF6B35'
  },
  {
    key: 'service',
    name: 'サービス',
    emoji: '🛠️',
    color: '#50555C'
  },
  {
    key: 'shopping',
    name: '買い物',
    emoji: '🏪',
    color: '#BD10E0'
  },
  {
    key: 'communication',
    name: '通信',
    emoji: '📱',
    color: '#000000'
  }
];

export const getPostTypeInfo = (type: PostType): PostTypeInfo => {
  return POST_TYPES.find(p => p.key === type) || POST_TYPES[0];
};

export const getSpotCategoryInfo = (category: SpotCategory): SpotCategoryInfo => {
  return SPOT_CATEGORIES.find(c => c.key === category) || SPOT_CATEGORIES[0];
};