import { useRef } from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCertificateTemplateMeta, getCertificateTheme } from '../utils/certificateTemplates';

const OrnamentTop = ({ color, className = '' }) => (
  <svg viewBox="0 0 400 60" fill="none" className={className}>
    <path d="M200 8 L220 30 L200 52 L180 30 Z" stroke={color} strokeWidth="1.2" fill="none" />
    <path d="M200 2 L232 30 L200 58 L168 30 Z" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7" />
    <path d="M120 30 H168" stroke={color} strokeWidth="0.8" opacity="0.55" />
    <path d="M232 30 H280" stroke={color} strokeWidth="0.8" opacity="0.55" />
    <path d="M76 30 H112" stroke={color} strokeWidth="0.55" opacity="0.35" />
    <path d="M288 30 H324" stroke={color} strokeWidth="0.55" opacity="0.35" />
    <circle cx="200" cy="30" r="4" fill={color} opacity="0.7" />
    <circle cx="152" cy="30" r="2.4" fill={color} opacity="0.35" />
    <circle cx="248" cy="30" r="2.4" fill={color} opacity="0.35" />
    <circle cx="112" cy="30" r="1.8" fill={color} opacity="0.25" />
    <circle cx="288" cy="30" r="1.8" fill={color} opacity="0.25" />
  </svg>
);

const CornerMotif = ({ color, className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className}>
    <path d="M10 78 C10 30 30 10 78 10" stroke={color} strokeWidth="1.25" opacity="0.85" />
    <path d="M22 78 C22 38 38 22 78 22" stroke={color} strokeWidth="0.85" opacity="0.6" />
    <path d="M10 92 H48" stroke={color} strokeWidth="0.7" opacity="0.45" />
    <path d="M92 10 V48" stroke={color} strokeWidth="0.7" opacity="0.45" />
    <path d="M56 22 L68 34 L56 46 L44 34 Z" stroke={color} strokeWidth="0.9" opacity="0.7" />
    <path d="M34 44 L46 56 L34 68 L22 56 Z" stroke={color} strokeWidth="0.8" opacity="0.55" />
    <path d="M56 46 C72 46 82 36 82 22" stroke={color} strokeWidth="0.8" opacity="0.55" />
    <path d="M46 56 C46 72 36 82 20 82" stroke={color} strokeWidth="0.8" opacity="0.55" />
    <circle cx="56" cy="34" r="2.6" fill={color} opacity="0.55" />
    <circle cx="34" cy="56" r="2.2" fill={color} opacity="0.35" />
  </svg>
);

const AcademySeal = ({ color, accent, className = '', opacity = 1 }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className} style={{ opacity }}>
    <circle cx="60" cy="60" r="54" stroke={color} strokeWidth="1.8" />
    <circle cx="60" cy="60" r="46" stroke={color} strokeWidth="0.95" opacity="0.75" />
    <circle cx="60" cy="60" r="34" fill={accent} opacity="0.1" stroke={color} strokeWidth="0.85" />
    <path
      d="M60 24 L68 44 L90 44 L73 57 L80 79 L60 66 L40 79 L47 57 L30 44 L52 44 Z"
      fill={accent}
      opacity="0.16"
      stroke={color}
      strokeWidth="0.6"
    />
    <circle cx="60" cy="60" r="12" stroke={color} strokeWidth="0.75" opacity="0.8" />
    <text x="60" y="36" textAnchor="middle" fill={color} fontSize="7" fontFamily="Cinzel, serif" letterSpacing="1.6">
      ALI NAWAZ
    </text>
    <text x="60" y="45" textAnchor="middle" fill={color} fontSize="6.4" fontFamily="Cinzel, serif" letterSpacing="1.8">
      ACADEMY
    </text>
    <text x="60" y="66" textAnchor="middle" fill={color} fontSize="12" fontFamily="Cinzel, serif" fontWeight="700" letterSpacing="1.6">
      ANA
    </text>
    <text x="60" y="82" textAnchor="middle" fill={color} fontSize="6.5" fontFamily="Amiri, serif">
      أكاديمية علي نواز
    </text>
    <text x="60" y="95" textAnchor="middle" fill={color} fontSize="5.6" fontFamily="Cinzel, serif" letterSpacing="1.1">
      OFFICIAL SEAL
    </text>
  </svg>
);

const QuranIcon = ({ color, accent, className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className}>
    <circle cx="60" cy="60" r="54" stroke={color} strokeWidth="1.8" opacity="0.85" />
    <circle cx="60" cy="60" r="46" stroke={color} strokeWidth="0.9" opacity="0.55" />
    <circle cx="60" cy="31" r="10" fill={accent} opacity="0.14" />
    <circle cx="60" cy="31" r="6.8" stroke={color} strokeWidth="0.95" opacity="0.45" />
    <path d="M60 12 V20" stroke={accent} strokeWidth="1.55" strokeLinecap="round" opacity="0.9" />
    <path d="M60 42 V50" stroke={accent} strokeWidth="1.55" strokeLinecap="round" opacity="0.9" />
    <path d="M41 31 H49" stroke={accent} strokeWidth="1.55" strokeLinecap="round" opacity="0.9" />
    <path d="M71 31 H79" stroke={accent} strokeWidth="1.55" strokeLinecap="round" opacity="0.9" />
    <path d="M46 18 L51 23" stroke={accent} strokeWidth="1.25" strokeLinecap="round" opacity="0.78" />
    <path d="M69 39 L74 44" stroke={accent} strokeWidth="1.25" strokeLinecap="round" opacity="0.78" />
    <path d="M46 44 L51 39" stroke={accent} strokeWidth="1.25" strokeLinecap="round" opacity="0.78" />
    <path d="M69 23 L74 18" stroke={accent} strokeWidth="1.25" strokeLinecap="round" opacity="0.78" />

    <path
      d="M37 70 V45 L58 40 V70"
      fill={accent}
      opacity="0.1"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M83 70 V45 L62 40 V70"
      fill={accent}
      opacity="0.1"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M60 40 V70" stroke={color} strokeWidth="1.15" opacity="0.55" />
    <path d="M42 49 C48 47.5 52 47.5 58 49" stroke={accent} strokeWidth="1.15" strokeLinecap="round" opacity="0.68" />
    <path d="M62 49 C68 47.5 72 47.5 78 49" stroke={accent} strokeWidth="1.15" strokeLinecap="round" opacity="0.68" />
    <path d="M42 56 C48 54.5 52 54.5 58 56" stroke={accent} strokeWidth="1.05" strokeLinecap="round" opacity="0.58" />
    <path d="M62 56 C68 54.5 72 54.5 78 56" stroke={accent} strokeWidth="1.05" strokeLinecap="round" opacity="0.58" />
    <path d="M42 63 C48 61.5 52 61.5 58 63" stroke={accent} strokeWidth="1" strokeLinecap="round" opacity="0.48" />
    <path d="M62 63 C68 61.5 72 61.5 78 63" stroke={accent} strokeWidth="1" strokeLinecap="round" opacity="0.48" />

    <path d="M42 79 H78" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    <path d="M44 80 L60 93 L50 107" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
    <path d="M76 80 L60 93 L70 107" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
    <path d="M48 84 L70 100" stroke={accent} strokeWidth="1.05" strokeLinecap="round" opacity="0.45" />
    <path d="M72 84 L50 100" stroke={accent} strokeWidth="1.05" strokeLinecap="round" opacity="0.45" />
    <path d="M54 92 H66" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
  </svg>
);

const MosqueCrescentIcon = ({ color, accent, className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className}>
    <circle cx="60" cy="60" r="54" stroke={color} strokeWidth="1.8" opacity="0.85" />
    <circle cx="60" cy="60" r="46" stroke={color} strokeWidth="0.9" opacity="0.55" />
    <path d="M30 82 H90" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M38 82 V58 H82 V82" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M44 58 C44 47 51 40 60 40 C69 40 76 47 76 58" stroke={color} strokeWidth="1.8" />
    <path d="M52 82 V66 H68 V82" stroke={accent} strokeWidth="1.6" opacity="0.75" />
    <path d="M86 82 V34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M82 34 H90" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M60 34 L64 40 H56 Z" fill={accent} opacity="0.75" />
    <path d="M90 26 A11 11 0 1 1 77 39 A8 8 0 1 0 90 26 Z" fill={accent} opacity="0.18" stroke={color} strokeWidth="0.55" />
    <circle cx="98" cy="29" r="2.1" fill={color} opacity="0.85" />
    <circle cx="102" cy="24" r="1.2" fill={color} opacity="0.45" />
    <path d="M44 52 H76" stroke={accent} strokeWidth="1" opacity="0.35" />
  </svg>
);

const DetailBlock = ({ label, value, color, line, align = 'left' }) => (
  <div className={align === 'right' ? 'text-left sm:text-right' : 'text-left'}>
    <div
      className={align === 'right' ? 'flex flex-col items-start sm:items-end' : 'flex flex-col items-start'}
      style={{ minWidth: 150 }}
    >
      <div style={{ borderTop: `1px solid ${line}`, paddingTop: '0.6rem', width: '100%' }}>
        <p className="font-cinzel text-[0.62rem] sm:text-[0.72rem]" style={{ color, letterSpacing: '0.12em' }}>
          {label}
        </p>
        <p className="font-crimson text-[0.84rem] sm:text-[0.95rem]" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default function CertificateGenerator({ cert, template, signatureImage, onDownload, showDownload = true }) {
  const certRef = useRef(null);
  const { platformSettings } = useApp();
  const templateMeta = getCertificateTemplateMeta(template || cert.template);
  const theme = getCertificateTheme(templateMeta.id);
  const activeSignature = signatureImage ?? cert.signatureImage ?? platformSettings.certificateSignature;

  const handleDownload = async () => {
    if (!certRef.current) return;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: theme.canvasBackground,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${cert.studentName.replace(/\s+/g, '_')}_Certificate_${cert.id}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again.');
    }
  };

  const date = new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const runDownload = onDownload || handleDownload;

  return (
    <div className="animate-fade-in">
      <div
        ref={certRef}
        className="relative mx-auto w-full certificate-border rounded-[28px] overflow-hidden px-4 py-5 sm:px-8 sm:py-9 md:px-12 md:py-12"
        style={{
          maxWidth: 900,
          background: theme.surfaceBackground,
          fontFamily: "'Cinzel', serif",
          minHeight: 500,
          '--certificate-border-color': theme.border,
          '--certificate-border-inner': theme.borderInnerShadow,
          '--certificate-border-outer': theme.borderOuterShadow,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 18% 16%, ${theme.ornamentGlow} 0%, transparent 22%),
              radial-gradient(circle at 82% 18%, ${theme.ornamentGlow} 0%, transparent 24%),
              radial-gradient(circle at 20% 82%, ${theme.ornamentGlow} 0%, transparent 22%),
              radial-gradient(circle at 80% 84%, ${theme.ornamentGlow} 0%, transparent 24%)
            `,
            opacity: 0.7,
          }}
        />

        <div
          className="absolute inset-[14px] rounded-[22px]"
          style={{ border: `1px solid ${theme.line}`, boxShadow: `inset 0 0 0 1px ${theme.borderInnerShadow}` }}
        />
        <div
          className="absolute inset-[28px] rounded-[16px]"
          style={{ border: `1px solid ${theme.line}`, opacity: 0.4 }}
        />

        <div className="absolute top-[18px] left-[72px] right-[72px] opacity-50">
          <OrnamentTop color={theme.ornament} className="w-full" />
        </div>
        <div className="absolute bottom-[18px] left-[72px] right-[72px] opacity-50 rotate-180">
          <OrnamentTop color={theme.ornament} className="w-full" />
        </div>

        <CornerMotif color={theme.ornament} className="absolute top-4 left-4 w-20 h-20 opacity-80" />
        <CornerMotif color={theme.ornament} className="absolute top-4 right-4 w-20 h-20 opacity-80 rotate-90" />
        <CornerMotif color={theme.ornament} className="absolute bottom-4 right-4 w-20 h-20 opacity-80 rotate-180" />
        <CornerMotif color={theme.ornament} className="absolute bottom-4 left-4 w-20 h-20 opacity-80 -rotate-90" />

        <AcademySeal
          color={theme.heading}
          accent={theme.ornament}
          className="hidden sm:block absolute left-1/2 top-1/2 w-56 h-56 -translate-x-1/2 -translate-y-1/2"
          opacity={0.09}
        />

        <div className="relative z-10 text-center flex flex-col items-center gap-3 sm:gap-4">
          <p className="font-amiri text-[1.12rem] sm:text-[1.75rem]" style={{ color: theme.academy, lineHeight: 1.3 }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          <div className="w-full flex items-center justify-center gap-3 sm:gap-6">
            <QuranIcon color={theme.heading} accent={theme.ornament} className="hidden sm:block w-20 h-20 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-amiri text-[1.1rem] sm:text-[1.5rem]" style={{ color: theme.academy, lineHeight: 1.1 }}>
                أكاديمية علي نواز
              </p>
              <p
                className="font-cinzel font-black text-[0.9rem] sm:text-[1.45rem] break-words"
                style={{ color: theme.academy, letterSpacing: '0.18em' }}
              >
                ALI NAWAZ ACADEMY
              </p>
              <p className="font-crimson italic text-[0.72rem] sm:text-[0.9rem]" style={{ color: theme.subtitle, opacity: 0.85 }}>
                Institute of Sacred Learning
              </p>
            </div>
            <MosqueCrescentIcon color={theme.heading} accent={theme.ornament} className="hidden sm:block w-20 h-20 flex-shrink-0" />
          </div>

          <div className="w-full max-w-2xl opacity-80">
            <OrnamentTop color={theme.ornament} className="w-full" />
          </div>

          <div
            className="w-full max-w-2xl rounded-[24px] px-4 py-4 sm:px-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.line}` }}
          >
            <p className="font-amiri text-[1.05rem] sm:text-[1.35rem]" style={{ color: theme.academy }}>
              شهادة الإتمام
            </p>
            <p
              className="font-cinzel text-[0.74rem] sm:text-[0.96rem]"
              style={{ color: theme.heading, letterSpacing: '0.28em', textTransform: 'uppercase' }}
            >
              Certificate of Completion
            </p>
            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${theme.line}, transparent)`, margin: '0.7rem 0 0.55rem' }} />
            <p className="font-crimson text-[0.8rem] sm:text-[0.92rem]" style={{ color: theme.body, opacity: 0.75 }}>
              Bestowed in recognition of dedicated study and successful completion
            </p>
          </div>

          <p className="font-crimson text-[0.9rem] sm:text-[1rem]" style={{ color: theme.body, opacity: 0.72 }}>
            This is to certify that
          </p>

          <div
            className="w-full max-w-3xl rounded-[28px] px-5 py-4 sm:px-8 sm:py-5"
            style={{ background: 'rgba(255,255,255,0.035)', border: `1px solid ${theme.line}` }}
          >
            <h1
              className="font-cinzel font-black text-[1.45rem] sm:text-[2.7rem] break-words"
              style={{ color: theme.student, letterSpacing: '0.06em', textShadow: `0 0 20px ${theme.borderOuterShadow}` }}
            >
              {cert.studentName}
            </h1>
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${theme.line}, transparent)`, marginTop: '0.35rem' }} />
          </div>

          <p className="font-crimson text-[0.9rem] sm:text-[1rem]" style={{ color: theme.body, opacity: 0.72 }}>
            has successfully completed the course
          </p>

          <h2
            className="font-cinzel font-bold text-[1.08rem] sm:text-[1.75rem] break-words max-w-3xl"
            style={{ color: theme.course, letterSpacing: '0.04em' }}
          >
            {cert.courseName}
          </h2>

          <div className="w-full max-w-xl opacity-80">
            <OrnamentTop color={theme.ornament} className="w-full" />
          </div>

          <div className="w-full flex flex-col gap-5 sm:grid sm:grid-cols-[1fr,auto,1fr] sm:items-end mt-1">
            <DetailBlock
              label="DATE OF COMPLETION"
              value={date}
              color={theme.signature}
              line={theme.line}
            />

            <div className="flex flex-col items-center justify-end gap-2">
              <AcademySeal color={theme.heading} accent={theme.ornament} className="w-20 h-20 sm:w-24 sm:h-24" />
              <p
                className="font-cinzel text-[0.58rem] sm:text-[0.62rem] break-all"
                style={{ color: theme.heading, letterSpacing: '0.12em' }}
              >
                {templateMeta.name.toUpperCase()} | CERTIFICATE ID: {cert.id}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="flex flex-col items-start sm:items-end" style={{ minWidth: 150 }}>
                {activeSignature && (
                  <img
                    src={activeSignature}
                    alt="Authorized signature"
                    className="h-12 sm:h-14 object-contain mb-1.5"
                    style={{ maxWidth: 190, filter: `drop-shadow(0 4px 8px ${theme.borderOuterShadow})` }}
                  />
                )}
                <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: '0.6rem', minWidth: 150, width: '100%' }}>
                  <p className="font-cinzel text-[0.62rem] sm:text-[0.72rem]" style={{ color: theme.heading, letterSpacing: '0.12em' }}>
                    AUTHORIZED BY
                  </p>
                  <p className="font-crimson italic text-[0.84rem] sm:text-[0.95rem]" style={{ color: theme.signature }}>
                    Ali Nawaz Academy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDownload && (
        <div className="flex justify-center mt-6">
          <button onClick={runDownload} className="btn-gold flex items-center justify-center gap-2 text-sm px-6 py-3 w-full sm:w-auto">
            <Download size={16} />
            Download Certificate (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
