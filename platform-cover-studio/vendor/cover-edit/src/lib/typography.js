import { fontStack } from './font-profile.js';

export const TYPOGRAPHY_PROFILES = {
  'gradient-cover-cn-en': {
    id: 'gradient-cover-cn-en',
    titleDisplay: { family: fontStack('uiSans'), weight: 700, lineHeight: 0.92, letterSpacing: '-0.04em' },
    titleTight: { family: fontStack('uiSans'), weight: 700, lineHeight: 0.95, letterSpacing: '-0.03em' },
    subtitle: { family: fontStack('editorialSerifCn'), weight: 500, lineHeight: 1.16, letterSpacing: '-0.01em', fontStyle: 'italic' },
    body: { family: fontStack('uiSans'), weight: 400, lineHeight: 1.52, letterSpacing: '0' },
    eyebrow: { family: fontStack('uiSans'), weight: 600, lineHeight: 1.1, letterSpacing: '0.08em' },
    badge: { family: fontStack('uiSans'), weight: 600, lineHeight: 1.1, letterSpacing: '0.08em' }
  },
  'title-serif-cn-en': {
    id: 'title-serif-cn-en',
    titleDisplay: { family: fontStack('editorialSerifCn'), weight: 700, lineHeight: 0.94, letterSpacing: '-0.03em' },
    titleTight: { family: fontStack('editorialSerifCn'), weight: 700, lineHeight: 0.97, letterSpacing: '-0.02em' },
    subtitle: { family: fontStack('editorialSerifCn'), weight: 500, lineHeight: 1.16, letterSpacing: '-0.01em', fontStyle: 'italic' },
    body: { family: fontStack('uiSans'), weight: 400, lineHeight: 1.52, letterSpacing: '0' },
    eyebrow: { family: fontStack('uiSans'), weight: 600, lineHeight: 1.1, letterSpacing: '0.08em' },
    badge: { family: fontStack('uiSans'), weight: 600, lineHeight: 1.1, letterSpacing: '0.08em' }
  },
  'title-heavy-sans-cn-en': {
    id: 'title-heavy-sans-cn-en',
    titleDisplay: { family: fontStack('editorialSansCn'), weight: 800, lineHeight: 0.91, letterSpacing: '-0.04em' },
    titleTight: { family: fontStack('editorialSansCn'), weight: 800, lineHeight: 0.94, letterSpacing: '-0.03em' },
    subtitle: { family: fontStack('editorialSerifCn'), weight: 500, lineHeight: 1.16, letterSpacing: '-0.01em', fontStyle: 'italic' },
    body: { family: fontStack('uiSans'), weight: 400, lineHeight: 1.52, letterSpacing: '0' },
    eyebrow: { family: fontStack('uiSans'), weight: 600, lineHeight: 1.1, letterSpacing: '0.08em' },
    badge: { family: fontStack('uiSans'), weight: 600, lineHeight: 1.1, letterSpacing: '0.08em' }
  },
  'editorial-cn-en': {
    id: 'editorial-cn-en',
    titleDisplay: { family: fontStack('editorialSerifCn'), weight: 700, lineHeight: 0.94, letterSpacing: '-0.03em' },
    titleTight: { family: fontStack('editorialSerifCn'), weight: 700, lineHeight: 0.98, letterSpacing: '-0.02em' },
    subtitle: { family: fontStack('editorialSansCn'), weight: 500, lineHeight: 1.24, letterSpacing: '0' },
    body: { family: fontStack('editorialSansCn'), weight: 400, lineHeight: 1.65, letterSpacing: '0' },
    eyebrow: { family: fontStack('uiSans'), weight: 700, lineHeight: 1.1, letterSpacing: '0.18em' },
    badge: { family: fontStack('uiSans'), weight: 700, lineHeight: 1.1, letterSpacing: '0.12em' }
  },
  'comic-cn-en': {
    id: 'comic-cn-en',
    titleDisplay: { family: fontStack('editorialSansCn'), weight: 800, lineHeight: 0.92, letterSpacing: '-0.03em' },
    titleTight: { family: fontStack('editorialSansCn'), weight: 800, lineHeight: 0.95, letterSpacing: '-0.02em' },
    subtitle: { family: fontStack('editorialSansCn'), weight: 700, lineHeight: 1.18, letterSpacing: '0' },
    body: { family: fontStack('editorialSansCn'), weight: 500, lineHeight: 1.5, letterSpacing: '0' },
    eyebrow: { family: fontStack('uiSans'), weight: 700, lineHeight: 1.1, letterSpacing: '0.16em' },
    badge: { family: fontStack('uiSans'), weight: 800, lineHeight: 1.05, letterSpacing: '0.1em' }
  }
};

export function getTypographyProfile(profileId = 'gradient-cover-cn-en') {
  return TYPOGRAPHY_PROFILES[profileId] || TYPOGRAPHY_PROFILES['gradient-cover-cn-en'];
}
