export const THEMES = {
  'soft-gradient-editorial': {
    id: 'soft-gradient-editorial',
    background: '#f8f9fa',
    backgroundImage: [
      'radial-gradient(circle at 85% 20%, rgba(214, 217, 255, 0.78) 0%, rgba(214, 217, 255, 0) 38%)',
      'radial-gradient(circle at 15% 80%, rgba(246, 204, 217, 0.72) 0%, rgba(246, 204, 217, 0) 48%)',
      'linear-gradient(180deg, #fbfdff 0%, #eef2f7 100%)'
    ].join(', '),
    surface: '#ffffff',
    text: '#0a1220',
    mutedText: 'rgba(10,18,32,0.68)',
    accent: '#d7a2b8',
    accentSoft: 'rgba(246,204,217,0.18)',
    accent2: '#bfc7ff',
    accent2Soft: 'rgba(191,199,255,0.18)',
    gradients: ['rgba(214,217,255,0.78)', 'rgba(246,204,217,0.72)']
  },
  'dark-green-editorial': {
    id: 'dark-green-editorial',
    background: '#07111d',
    backgroundImage: [
      'radial-gradient(circle at 82% 18%, rgba(114,241,184,0.42) 0%, rgba(114,241,184,0) 34%)',
      'radial-gradient(circle at 18% 82%, rgba(154,182,255,0.3) 0%, rgba(154,182,255,0) 34%)',
      'linear-gradient(140deg, #07111d 0%, #0f2a20 45%, #05070c 100%)'
    ].join(', '),
    surface: '#101c2d',
    text: '#f8fafc',
    mutedText: 'rgba(248,250,252,0.74)',
    accent: '#72f1b8',
    accentSoft: 'rgba(114,241,184,0.18)',
    accent2: '#9ab6ff',
    accent2Soft: 'rgba(154,182,255,0.18)',
    gradients: ['rgba(114,241,184,0.46)', 'rgba(154,182,255,0.32)']
  },
  'paper-ink': {
    id: 'paper-ink',
    background: '#f6f0e4',
    backgroundImage: 'linear-gradient(180deg, #fbf7f0 0%, #f3ecdf 100%)',
    surface: '#fffaf0',
    text: '#1f2937',
    mutedText: 'rgba(31,41,55,0.72)',
    accent: '#0f766e',
    accentSoft: 'rgba(15,118,110,0.12)',
    accent2: '#f59e0b',
    accent2Soft: 'rgba(245,158,11,0.12)',
    gradients: ['rgba(15,118,110,0.18)', 'rgba(245,158,11,0.12)']
  },
  'blue-violet-editorial': {
    id: 'blue-violet-editorial',
    background: '#0c1022',
    backgroundImage: [
      'radial-gradient(circle at 82% 18%, rgba(121,138,255,0.44) 0%, rgba(121,138,255,0) 36%)',
      'radial-gradient(circle at 18% 78%, rgba(180,116,255,0.34) 0%, rgba(180,116,255,0) 38%)',
      'linear-gradient(145deg, #0b1020 0%, #191b3a 48%, #0a0d18 100%)'
    ].join(', '),
    surface: '#171d36',
    text: '#f8faff',
    mutedText: 'rgba(248,250,255,0.74)',
    accent: '#8ea0ff',
    accentSoft: 'rgba(142,160,255,0.18)',
    accent2: '#d39dff',
    accent2Soft: 'rgba(211,157,255,0.18)',
    gradients: ['rgba(121,138,255,0.44)', 'rgba(180,116,255,0.34)']
  },
  'emerald-editorial': {
    id: 'emerald-editorial',
    background: '#071814',
    backgroundImage: [
      'radial-gradient(circle at 84% 18%, rgba(80,227,194,0.42) 0%, rgba(80,227,194,0) 34%)',
      'radial-gradient(circle at 18% 82%, rgba(142,255,214,0.28) 0%, rgba(142,255,214,0) 34%)',
      'linear-gradient(150deg, #071814 0%, #0d2a23 50%, #06100d 100%)'
    ].join(', '),
    surface: '#0f241f',
    text: '#f6fff9',
    mutedText: 'rgba(246,255,249,0.74)',
    accent: '#66e3bd',
    accentSoft: 'rgba(102,227,189,0.18)',
    accent2: '#b5ffdf',
    accent2Soft: 'rgba(181,255,223,0.14)',
    gradients: ['rgba(80,227,194,0.42)', 'rgba(142,255,214,0.28)']
  },
  'rose-editorial': {
    id: 'rose-editorial',
    background: '#fff3f7',
    backgroundImage: [
      'radial-gradient(circle at 82% 18%, rgba(255,184,214,0.70) 0%, rgba(255,184,214,0) 38%)',
      'radial-gradient(circle at 16% 82%, rgba(255,225,238,0.88) 0%, rgba(255,225,238,0) 42%)',
      'linear-gradient(180deg, #fff8fb 0%, #ffeef4 100%)'
    ].join(', '),
    surface: '#fff8fb',
    text: '#341824',
    mutedText: 'rgba(52,24,36,0.68)',
    accent: '#e58fb0',
    accentSoft: 'rgba(229,143,176,0.18)',
    accent2: '#f6bdd2',
    accent2Soft: 'rgba(246,189,210,0.18)',
    gradients: ['rgba(255,184,214,0.70)', 'rgba(255,225,238,0.88)']
  },
  'amber-night-editorial': {
    id: 'amber-night-editorial',
    background: '#14110c',
    backgroundImage: [
      'radial-gradient(circle at 82% 18%, rgba(255,184,92,0.34) 0%, rgba(255,184,92,0) 34%)',
      'radial-gradient(circle at 20% 80%, rgba(255,228,170,0.18) 0%, rgba(255,228,170,0) 34%)',
      'linear-gradient(145deg, #14110c 0%, #2a1d11 48%, #0d0b08 100%)'
    ].join(', '),
    surface: '#231a12',
    text: '#fffaf0',
    mutedText: 'rgba(255,250,240,0.74)',
    accent: '#ffbf66',
    accentSoft: 'rgba(255,191,102,0.18)',
    accent2: '#ffe0a3',
    accent2Soft: 'rgba(255,224,163,0.14)',
    gradients: ['rgba(255,184,92,0.34)', 'rgba(255,228,170,0.18)']
  },
  'comic-night': {
    id: 'comic-night',
    background: '#0f172a',
    backgroundImage: [
      'radial-gradient(circle at 82% 18%, rgba(249,115,22,0.34) 0%, rgba(249,115,22,0) 32%)',
      'radial-gradient(circle at 20% 80%, rgba(34,211,238,0.28) 0%, rgba(34,211,238,0) 32%)',
      'linear-gradient(160deg, #0f172a 0%, #111827 100%)'
    ].join(', '),
    surface: '#1e293b',
    text: '#f8fafc',
    mutedText: 'rgba(248,250,252,0.82)',
    accent: '#f97316',
    accentSoft: 'rgba(249,115,22,0.2)',
    accent2: '#22d3ee',
    accent2Soft: 'rgba(34,211,238,0.18)',
    gradients: ['rgba(249,115,22,0.34)', 'rgba(34,211,238,0.28)']
  }
};

export function getTheme(themeId = 'soft-gradient-editorial') {
  return THEMES[themeId] || THEMES['soft-gradient-editorial'];
}
