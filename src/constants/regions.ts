import { RegionInfo, HokkaidoRegion } from '../types';

export const HOKKAIDO_REGIONS: RegionInfo[] = [
  {
    key: 'all',
    name: '全体',
    emoji: '🌍'
  },
  {
    key: 'dounan',
    name: '道南',
    emoji: '🌸'
  },
  {
    key: 'doou',
    name: '道央',
    emoji: '🏔️'
  },
  {
    key: 'dohoku',
    name: '道北',
    emoji: '❄️'
  },
  {
    key: 'doutou',
    name: '道東',
    emoji: '🦌'
  }
];

export const getRegionInfo = (region: HokkaidoRegion): RegionInfo => {
  return HOKKAIDO_REGIONS.find(r => r.key === region) || HOKKAIDO_REGIONS[0];
};