export type Gender = 'male' | 'female';

export type FaceTone = 'dark' | 'wheatish' | 'fair';

export type FaceStructure = 'oval' | 'round' | 'square';

export type HairStyle = 'bald' | 'curly' | 'straight';

export type BeardStyle = 'clean' | 'stubble' | 'short' | 'full';

export type GlassesStyle = 'none' | 'glasses';

export interface MagicEyeConfig {
  name: string;
  gender: Gender;
  faceTone: FaceTone;
  faceStructure: FaceStructure;
  hairStyle: HairStyle;
  beardStyle: BeardStyle;
  glasses: GlassesStyle;
}

export const FACE_TONES: {
  id: FaceTone;
  label: string;
  color: string;
}[] = [
  {
    id: 'dark',
    label: 'Rich Mocha',
    color: '#6b4226',
  },
  {
    id: 'wheatish',
    label: 'Warm Honey',
    color: '#c68642',
  },
  {
    id: 'fair',
    label: 'Porcelain Glow',
    color: '#f1c27d',
  },
];

export const FACE_STRUCTURES: {
  id: FaceStructure;
  label: string;
}[] = [
  {
    id: 'oval',
    label: 'Oval Face',
  },
  {
    id: 'round',
    label: 'Round Face',
  },
  {
    id: 'square',
    label: 'Square Face',
  },
];

export const HAIR_STYLES: {
  id: HairStyle;
  label: string;
}[] = [
  {
    id: 'bald',
    label: 'Bald',
  },
  {
    id: 'curly',
    label: 'Curly Hair',
  },
  {
    id: 'straight',
    label: 'Straight Hair',
  },
];

export const BEARD_STYLES: {
  id: BeardStyle;
  label: string;
}[] = [
  {
    id: 'clean',
    label: 'Clean Shaven',
  },
  {
    id: 'stubble',
    label: 'Stubble',
  },
  {
    id: 'short',
    label: 'Short Beard',
  },
  {
    id: 'full',
    label: 'Full Beard',
  },
];

export const GLASSES_STYLES: {
  id: GlassesStyle;
  label: string;
}[] = [
  {
    id: 'none',
    label: 'No Glasses',
  },
  {
    id: 'glasses',
    label: 'Glasses',
  },
];

export const DEFAULT_CONFIG: MagicEyeConfig = {
  name: '',
  gender: 'female',
  faceTone: 'wheatish',
  faceStructure: 'oval',
  hairStyle: 'straight',
  beardStyle: 'clean',
  glasses: 'none',
};
