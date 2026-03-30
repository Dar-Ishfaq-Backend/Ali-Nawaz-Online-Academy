export const CERTIFICATE_TEMPLATES = [
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Traditional gold accents with deep emerald contrast.',
    swatch: 'linear-gradient(135deg, #1a0a00 0%, #0a1a08 40%, #1a0d00 100%)',
  },
  {
    id: 'emerald-sage',
    name: 'Emerald Sage',
    description: 'A rich green certificate with soft sage detailing.',
    swatch: 'linear-gradient(135deg, #052e16 0%, #0f3d2e 45%, #1f2937 100%)',
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    description: 'A formal navy layout with bright blue and gold highlights.',
    swatch: 'linear-gradient(135deg, #0f172a 0%, #172554 42%, #1e3a8a 100%)',
  },
];

export const DEFAULT_CERTIFICATE_TEMPLATE = CERTIFICATE_TEMPLATES[0].id;

const CERTIFICATE_THEME_MAP = {
  'classic-gold': {
    surfaceBackground: 'linear-gradient(135deg, #1a0a00 0%, #0a1a08 40%, #1a0d00 100%)',
    canvasBackground: '#140b04',
    border: '#d97706',
    borderInnerShadow: 'rgba(217, 119, 6, 0.08)',
    borderOuterShadow: 'rgba(217, 119, 6, 0.2)',
    ornament: '#d97706',
    ornamentGlow: 'rgba(217, 119, 6, 0.35)',
    academy: '#d97706',
    subtitle: '#a16207',
    heading: '#a16207',
    body: '#fef3c7',
    student: '#fbbf24',
    course: '#10b981',
    line: '#d97706',
    signature: '#fbbf24',
  },
  'emerald-sage': {
    surfaceBackground: 'linear-gradient(135deg, #052e16 0%, #0f3d2e 45%, #1f2937 100%)',
    canvasBackground: '#072214',
    border: '#34d399',
    borderInnerShadow: 'rgba(52, 211, 153, 0.08)',
    borderOuterShadow: 'rgba(52, 211, 153, 0.22)',
    ornament: '#34d399',
    ornamentGlow: 'rgba(52, 211, 153, 0.35)',
    academy: '#6ee7b7',
    subtitle: '#a7f3d0',
    heading: '#6ee7b7',
    body: '#ecfdf5',
    student: '#bbf7d0',
    course: '#fbbf24',
    line: '#34d399',
    signature: '#d1fae5',
  },
  'royal-blue': {
    surfaceBackground: 'linear-gradient(135deg, #0f172a 0%, #172554 42%, #1e3a8a 100%)',
    canvasBackground: '#111827',
    border: '#60a5fa',
    borderInnerShadow: 'rgba(96, 165, 250, 0.08)',
    borderOuterShadow: 'rgba(96, 165, 250, 0.22)',
    ornament: '#60a5fa',
    ornamentGlow: 'rgba(96, 165, 250, 0.35)',
    academy: '#bfdbfe',
    subtitle: '#93c5fd',
    heading: '#bfdbfe',
    body: '#e0f2fe',
    student: '#f8fafc',
    course: '#facc15',
    line: '#60a5fa',
    signature: '#dbeafe',
  },
};

export const isCertificateTemplate = (templateId) => (
  CERTIFICATE_TEMPLATES.some((template) => template.id === templateId)
);

export const getCertificateTemplateMeta = (templateId) => (
  CERTIFICATE_TEMPLATES.find((template) => template.id === templateId) || CERTIFICATE_TEMPLATES[0]
);

export const getCertificateTheme = (templateId) => (
  CERTIFICATE_THEME_MAP[getCertificateTemplateMeta(templateId).id]
);
