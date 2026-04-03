export const CERTIFICATE_LAYOUT = {
  id: 'ali-nawaz-official-certificate',
  name: 'Ali Nawaz Academy Certificate',
  description: 'Official portrait certificate for Ali Nawaz Academy with Islamic calligraphy, parchment framing, and QR verification.',
  width: 820,
  height: 1160,
  aspectRatio: '210 / 297',
  canvasBackground: '#ede3cf',
  previewBackground: 'linear-gradient(180deg, #f7f0e2 0%, #f1e4ca 52%, #e6d5b2 100%)',
  parchment: '#f8f1e4',
  parchmentWarm: '#efe1c4',
  frameGold: '#c9a24e',
  frameGoldSoft: 'rgba(201, 162, 78, 0.2)',
  emerald: '#1f6a4a',
  emeraldDeep: '#114531',
  ink: '#5a4527',
  inkSoft: '#8c7447',
  line: 'rgba(163, 126, 53, 0.48)',
};

export const CERTIFICATE_TEMPLATES = [CERTIFICATE_LAYOUT];
export const CERTIFICATE_THEMES = [];
export const DEFAULT_CERTIFICATE_TEMPLATE = CERTIFICATE_LAYOUT.id;
export const DEFAULT_CERTIFICATE_THEME = CERTIFICATE_LAYOUT.id;

export const isCertificateTemplate = (templateId) => templateId === CERTIFICATE_LAYOUT.id;
export const isCertificateTheme = () => true;
export const getCertificateTemplateMeta = () => CERTIFICATE_LAYOUT;
export const getCertificateThemeMeta = () => CERTIFICATE_LAYOUT;
export const getCertificateTheme = () => CERTIFICATE_LAYOUT;
