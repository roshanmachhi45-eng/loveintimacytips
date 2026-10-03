export type Gender = 'male' | 'female';
export type FaceTone = 'dark' | 'wheatish' | 'fair';
export type HairStyle = 'bald' | 'curly' | 'straight';
export type BeardStyle = 'clean' | 'stubble' | 'short' | 'full';

export interface MagicEyeConfig {
  name: string;
  gender: Gender;
  faceTone: FaceTone;
  hairStyle: HairStyle;
  beardStyle: BeardStyle;
}

export const FACE_TONES: { id: FaceTone; label: string; color: string }[] = [
  { id: 'dark', label: 'Dark / West Indies', color: '#6b4226' },
  { id: 'wheatish', label: 'Wheatish / Indian', color: '#c68642' },
  { id: 'fair', label: 'Fair / USA Type', color: '#f1c27d' },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'bald', label: 'Bald / Shaved' },
  { id: 'curly', label: 'Curly Hair' },
  { id: 'straight', label: 'Straight Hair' },
];

export const BEARD_STYLES: { id: BeardStyle; label: string }[] = [
  { id: 'clean', label: 'Clean Shaven' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'short', label: 'Short Beard' },
  { id: 'full', label: 'Full Beard' },
];

export const DEFAULT_CONFIG: MagicEyeConfig = {
  name: '',
  gender: 'female',
  faceTone: 'wheatish',
  hairStyle: 'straight',
  beardStyle: 'clean',
};
