export interface ColorPalette {
  name: string;
  bg: [string, string];
  primary: string;
  secondary: string;
  accent: string;
  starColor: string;
  heartColor: string;
  textColor: string;
  patternColors: string[];
}

export const PALETTES: ColorPalette[] = [
  {
    name: 'Cyberpunk Neon',
    bg: ['#1a0a2e', '#0d0017'],
    primary: '#ff2d95',
    secondary: '#a855f7',
    accent: '#00f0ff',
    starColor: '#ff2d95',
    heartColor: '#ff6ec7',
    textColor: '#ff2d95',
    patternColors: ['#ff2d95', '#a855f7', '#00f0ff', '#ff6ec7', '#c084fc'],
  },
  {
    name: 'Galactic Sapphire',
    bg: ['#0a0e27', '#050715'],
    primary: '#3b82f6',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    starColor: '#60a5fa',
    heartColor: '#818cf8',
    textColor: '#3b82f6',
    patternColors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#818cf8'],
  },
  {
    name: 'Emerald Magic',
    bg: ['#0a2018', '#05110d'],
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#6ee7b7',
    starColor: '#34d399',
    heartColor: '#a7f3d0',
    textColor: '#10b981',
    patternColors: ['#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  },
  {
    name: 'Sunset Crimson',
    bg: ['#2a0a05', '#1a0503'],
    primary: '#f97316',
    secondary: '#ef4444',
    accent: '#fbbf24',
    starColor: '#fbbf24',
    heartColor: '#f97316',
    textColor: '#f97316',
    patternColors: ['#dc2626', '#f97316', '#ef4444', '#fbbf24', '#fb923c'],
  },
  {
    name: 'Mystic Cosmic',
    bg: ['#1e0a3c', '#0d0520'],
    primary: '#8b5cf6',
    secondary: '#c084fc',
    accent: '#e879f9',
    starColor: '#c084fc',
    heartColor: '#e879f9',
    textColor: '#8b5cf6',
    patternColors: ['#7c3aed', '#8b5cf6', '#c084fc', '#e879f9', '#d946ef'],
  },
  {
    name: 'Gold Shimmer',
    bg: ['#1a1400', '#0d0a00'],
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fde68a',
    starColor: '#fbbf24',
    heartColor: '#f59e0b',
    textColor: '#f59e0b',
    patternColors: ['#92400e', '#f59e0b', '#fbbf24', '#fde68a', '#fcd34d'],
  },
];

export function getRandomPalette(exclude?: number): number {
  let idx = Math.floor(Math.random() * PALETTES.length);
  if (exclude !== undefined && PALETTES.length > 1) {
    while (idx === exclude) {
      idx = Math.floor(Math.random() * PALETTES.length);
    }
  }
  return idx;
}
