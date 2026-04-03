export const CERTIFICATE_TEMPLATES = [
  {
    id: 'ijazah-classic',
    name: 'Ijazah Classic',
    style: 'Traditional Islamic',
    description: 'A richly ornamented ijazah-style certificate with layered geometry and balanced calligraphy.',
    previewBackground: 'linear-gradient(135deg, #0b2418 0%, #17392a 45%, #5b3b13 100%)',
  },
  {
    id: 'ottoman-royal',
    name: 'Ottoman Royal',
    style: 'Ottoman Court',
    description: 'An imperial Ottoman-inspired layout with medallions, arches, and ceremonial bands.',
    previewBackground: 'linear-gradient(135deg, #23150a 0%, #6b3c1c 42%, #bb7d2b 100%)',
  },
  {
    id: 'mihrab-modern',
    name: 'Mihrab Modern',
    style: 'Modern Islamic',
    description: 'A clean modern certificate shaped by mihrab arches, elegant spacing, and crisp hierarchy.',
    previewBackground: 'linear-gradient(135deg, #f5f7ef 0%, #dbe8d1 48%, #7e9c69 100%)',
  },
  {
    id: 'manuscript-heritage',
    name: 'Manuscript Heritage',
    style: 'Madrasah Manuscript',
    description: 'A heritage manuscript composition with scholarly framing and archival detailing.',
    previewBackground: 'linear-gradient(135deg, #161616 0%, #2f2a22 45%, #826c38 100%)',
  },
  {
    id: 'andalusian-noor',
    name: 'Andalusian Noor',
    style: 'Andalusian Madrasa',
    description: 'A luminous Andalusian certificate with layered arches, geometry, and refined scholarly balance.',
    previewBackground: 'linear-gradient(135deg, #071b1a 0%, #0f4e49 45%, #b88b2f 100%)',
  },
  {
    id: 'safavid-script',
    name: 'Safavid Script',
    style: 'Persian Calligraphy',
    description: 'A courtly Safavid-inspired layout with ceremonial calligraphy framing and manuscript poise.',
    previewBackground: 'linear-gradient(135deg, #1b0b16 0%, #4b1e45 42%, #b38b38 100%)',
  },
];

export const CERTIFICATE_THEMES = [
  {
    id: 'emerald-gold',
    name: 'Emerald + Gold',
    description: 'Deep emerald, warm gold, and ivory for a premium madrasa feel.',
    swatch: 'linear-gradient(135deg, #082216 0%, #0d4d37 48%, #b67a20 100%)',
    surfaceBackground: 'linear-gradient(135deg, #08170f 0%, #0f2c1e 38%, #134735 68%, #3e2b0f 100%)',
    canvasBackground: '#08140e',
    border: '#d4a24a',
    borderInnerShadow: 'rgba(212, 162, 74, 0.12)',
    borderOuterShadow: 'rgba(212, 162, 74, 0.18)',
    ornament: '#e5b96a',
    ornamentSoft: 'rgba(229, 185, 106, 0.22)',
    academy: '#f4d08c',
    subtitle: '#d7c7a3',
    heading: '#f0c26a',
    body: '#f6f1dd',
    student: '#fff5d1',
    course: '#9ee1b5',
    line: '#c99643',
    signature: '#f7e4b5',
    panel: 'rgba(255, 247, 220, 0.05)',
    panelStrong: 'rgba(255, 247, 220, 0.085)',
    ink: '#f8f4eb',
  },
  {
    id: 'black-gold',
    name: 'Black + Gold',
    description: 'Formal black and charcoal with dignified metallic gold accents.',
    swatch: 'linear-gradient(135deg, #080808 0%, #1c1c1c 45%, #b7892d 100%)',
    surfaceBackground: 'linear-gradient(135deg, #050505 0%, #111111 42%, #1b1b1b 68%, #4d3713 100%)',
    canvasBackground: '#050505',
    border: '#d4a441',
    borderInnerShadow: 'rgba(212, 164, 65, 0.1)',
    borderOuterShadow: 'rgba(212, 164, 65, 0.2)',
    ornament: '#e4bc66',
    ornamentSoft: 'rgba(228, 188, 102, 0.2)',
    academy: '#f3d189',
    subtitle: '#d7c399',
    heading: '#ebc16a',
    body: '#f1ead7',
    student: '#fff7df',
    course: '#f0d085',
    line: '#ba8d35',
    signature: '#f7e7bd',
    panel: 'rgba(255, 255, 255, 0.035)',
    panelStrong: 'rgba(255, 255, 255, 0.065)',
    ink: '#f6efdf',
  },
  {
    id: 'white-green',
    name: 'White + Green',
    description: 'A print-friendly white canvas with refined green Islamic accents.',
    swatch: 'linear-gradient(135deg, #fbfcf7 0%, #ecf4e5 45%, #5d915f 100%)',
    surfaceBackground: 'linear-gradient(135deg, #fbfcf8 0%, #f5f8ef 48%, #eef4e8 100%)',
    canvasBackground: '#ffffff',
    border: '#2b6d4a',
    borderInnerShadow: 'rgba(43, 109, 74, 0.08)',
    borderOuterShadow: 'rgba(43, 109, 74, 0.12)',
    ornament: '#2f7f53',
    ornamentSoft: 'rgba(47, 127, 83, 0.13)',
    academy: '#22583b',
    subtitle: '#4b785f',
    heading: '#22583b',
    body: '#355845',
    student: '#163c29',
    course: '#8c6b1c',
    line: '#3d7b54',
    signature: '#244936',
    panel: 'rgba(34, 88, 59, 0.04)',
    panelStrong: 'rgba(34, 88, 59, 0.075)',
    ink: '#173b29',
  },
];

export const DEFAULT_CERTIFICATE_TEMPLATE = CERTIFICATE_TEMPLATES[0].id;
export const DEFAULT_CERTIFICATE_THEME = CERTIFICATE_THEMES[0].id;

export const isCertificateTemplate = (templateId) => (
  CERTIFICATE_TEMPLATES.some((template) => template.id === templateId)
);

export const isCertificateTheme = (themeId) => (
  CERTIFICATE_THEMES.some((theme) => theme.id === themeId)
);

export const getCertificateTemplateMeta = (templateId) => (
  CERTIFICATE_TEMPLATES.find((template) => template.id === templateId) || CERTIFICATE_TEMPLATES[0]
);

export const getCertificateThemeMeta = (themeId) => (
  CERTIFICATE_THEMES.find((theme) => theme.id === themeId) || CERTIFICATE_THEMES[0]
);

export const getCertificateTheme = (themeId) => getCertificateThemeMeta(themeId);
