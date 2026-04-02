import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import sealImage from '../../assets/seal.png';
import signatureAsset from '../../assets/signature.png';
import { getCertificateTemplateMeta, getCertificateThemeMeta } from '../../utils/certificateTemplates';

const formatCertificateDate = (value) => new Date(value).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const PatternBand = ({ color, soft, className = '' }) => (
  <svg viewBox="0 0 640 72" fill="none" className={className}>
    <path d="M40 36 H246" stroke={color} strokeWidth="1" opacity="0.45" />
    <path d="M394 36 H600" stroke={color} strokeWidth="1" opacity="0.45" />
    <path d="M320 12 L344 36 L320 60 L296 36 Z" stroke={color} strokeWidth="1.1" />
    <path d="M320 3 L353 36 L320 69 L287 36 Z" stroke={soft} strokeWidth="0.9" opacity="0.75" />
    <path d="M276 36 H296" stroke={soft} strokeWidth="0.8" opacity="0.55" />
    <path d="M344 36 H364" stroke={soft} strokeWidth="0.8" opacity="0.55" />
    <circle cx="320" cy="36" r="4" fill={color} opacity="0.75" />
    <circle cx="254" cy="36" r="2" fill={soft} opacity="0.55" />
    <circle cx="386" cy="36" r="2" fill={soft} opacity="0.55" />
  </svg>
);

const CornerKnot = ({ color, className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className}>
    <path d="M12 84 C12 32 32 12 84 12" stroke={color} strokeWidth="1.2" opacity="0.85" />
    <path d="M24 84 C24 40 40 24 84 24" stroke={color} strokeWidth="0.8" opacity="0.55" />
    <path d="M42 24 L58 40 L42 56 L26 40 Z" stroke={color} strokeWidth="0.85" opacity="0.7" />
    <path d="M24 60 L40 76 L24 92 L8 76 Z" stroke={color} strokeWidth="0.85" opacity="0.55" />
    <path d="M12 98 H58" stroke={color} strokeWidth="0.7" opacity="0.35" />
    <path d="M98 12 V58" stroke={color} strokeWidth="0.7" opacity="0.35" />
    <circle cx="42" cy="40" r="2.6" fill={color} opacity="0.55" />
    <circle cx="24" cy="76" r="2.2" fill={color} opacity="0.4" />
  </svg>
);

const Rosette = ({ color, accent, className = '', opacity = 1 }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className} style={{ opacity }}>
    <circle cx="60" cy="60" r="42" stroke={color} strokeWidth="1.1" />
    <circle cx="60" cy="60" r="30" stroke={accent} strokeWidth="0.9" opacity="0.75" />
    <path d="M60 18 V34" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M60 86 V102" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M18 60 H34" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M86 60 H102" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M31 31 L42 42" stroke={accent} strokeWidth="0.9" strokeLinecap="round" />
    <path d="M78 78 L89 89" stroke={accent} strokeWidth="0.9" strokeLinecap="round" />
    <path d="M31 89 L42 78" stroke={accent} strokeWidth="0.9" strokeLinecap="round" />
    <path d="M78 42 L89 31" stroke={accent} strokeWidth="0.9" strokeLinecap="round" />
    <path d="M60 30 L68 52 L92 52 L72 66 L80 90 L60 74 L40 90 L48 66 L28 52 L52 52 Z" fill={accent} opacity="0.12" />
    <circle cx="60" cy="60" r="10" stroke={color} strokeWidth="0.9" />
  </svg>
);

const Mihrab = ({ color, accent, className = '' }) => (
  <svg viewBox="0 0 420 420" fill="none" className={className}>
    <path d="M88 356 V206 C88 132 142 72 210 42 C278 72 332 132 332 206 V356" stroke={color} strokeWidth="3.2" />
    <path d="M120 356 V214 C120 150 162 98 210 70 C258 98 300 150 300 214 V356" stroke={accent} strokeWidth="2.2" opacity="0.75" />
    <path d="M150 356 V228 C150 176 181 131 210 108 C239 131 270 176 270 228 V356" stroke={color} strokeWidth="1.8" opacity="0.75" />
    <path d="M88 356 H332" stroke={color} strokeWidth="2.2" />
    <path d="M110 318 H310" stroke={accent} strokeWidth="1.1" opacity="0.6" />
    <circle cx="210" cy="124" r="14" stroke={color} strokeWidth="1.1" opacity="0.7" />
    <path d="M210 90 V104" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FooterMetaBlock = ({ label, value, line, textColor, align = 'left', asset, assetAlt, assetClassName }) => (
  <div className={align === 'right' ? 'flex flex-col items-start sm:items-end' : 'flex flex-col items-start'}>
    {asset && (
      <img
        src={asset}
        alt={assetAlt}
        className={assetClassName}
      />
    )}
    <div
      className="w-full"
      style={{ borderTop: `1px solid ${line}`, paddingTop: '0.6rem', minWidth: 150 }}
    >
      <p className="font-cinzel text-[0.62rem] sm:text-[0.74rem]" style={{ color: textColor, letterSpacing: '0.12em' }}>
        {label}
      </p>
      <p className="font-crimson text-[0.85rem] sm:text-[0.98rem]" style={{ color: textColor }}>
        {value}
      </p>
    </div>
  </div>
);

const CertificateShell = ({ palette, children, className = '', decorations = null }) => (
  <div
    className={`relative mx-auto w-full certificate-border overflow-hidden rounded-[30px] px-4 py-4 sm:px-7 sm:py-7 md:px-10 md:py-9 ${className}`}
    style={{
      maxWidth: 1120,
      aspectRatio: '297 / 210',
      minHeight: 460,
      background: palette.surfaceBackground,
      '--certificate-border-color': palette.border,
      '--certificate-border-inner': palette.borderInnerShadow,
      '--certificate-border-outer': palette.borderOuterShadow,
    }}
  >
    <div
      className="absolute inset-[12px] rounded-[24px]"
      style={{ border: `1px solid ${palette.line}`, boxShadow: `inset 0 0 0 1px ${palette.borderInnerShadow}` }}
    />
    <div className="absolute inset-[26px] rounded-[16px]" style={{ border: `1px solid ${palette.line}`, opacity: 0.36 }} />
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(circle at 15% 18%, ${palette.ornamentSoft} 0%, transparent 22%),
          radial-gradient(circle at 85% 17%, ${palette.ornamentSoft} 0%, transparent 24%),
          radial-gradient(circle at 14% 86%, ${palette.ornamentSoft} 0%, transparent 22%),
          radial-gradient(circle at 84% 84%, ${palette.ornamentSoft} 0%, transparent 24%)
        `,
        opacity: 0.8,
      }}
    />
    <CornerKnot color={palette.ornament} className="absolute top-3 left-3 w-20 h-20 opacity-80" />
    <CornerKnot color={palette.ornament} className="absolute top-3 right-3 w-20 h-20 opacity-80 rotate-90" />
    <CornerKnot color={palette.ornament} className="absolute bottom-3 right-3 w-20 h-20 opacity-80 rotate-180" />
    <CornerKnot color={palette.ornament} className="absolute bottom-3 left-3 w-20 h-20 opacity-80 -rotate-90" />
    {decorations}
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

const IjazahClassicTemplate = ({ cert, palette, templateMeta, signatureSrc, sealSrc, date }) => (
  <CertificateShell
    palette={palette}
    decorations={
      <>
        <PatternBand color={palette.ornament} soft={palette.border} className="absolute top-[18px] left-[76px] right-[76px] opacity-65" />
        <PatternBand color={palette.ornament} soft={palette.border} className="absolute bottom-[18px] left-[76px] right-[76px] opacity-65 rotate-180" />
        <Rosette color={palette.ornament} accent={palette.border} className="hidden sm:block absolute left-1/2 top-1/2 w-56 h-56 -translate-x-1/2 -translate-y-1/2" opacity={0.1} />
      </>
    }
  >
    <div className="h-full flex flex-col items-center text-center justify-between gap-4">
      <div className="space-y-3">
        <p className="font-amiri text-[1.15rem] sm:text-[1.8rem]" style={{ color: palette.academy }}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <p className="font-amiri text-[1.05rem] sm:text-[1.45rem]" style={{ color: palette.academy }}>
          أكاديمية علي نواز
        </p>
        <p className="font-cinzel font-black text-[0.92rem] sm:text-[1.55rem]" style={{ color: palette.academy, letterSpacing: '0.18em' }}>
          ALI NAWAZ ACADEMY
        </p>
        <p className="font-crimson italic text-[0.8rem] sm:text-[0.95rem]" style={{ color: palette.subtitle }}>
          Premium Islamic Certificate of Completion
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <PatternBand color={palette.ornament} soft={palette.border} className="w-full opacity-80" />
      </div>

      <div className="w-full max-w-3xl rounded-[28px] px-5 py-4 sm:px-8 sm:py-5" style={{ background: palette.panelStrong, border: `1px solid ${palette.line}` }}>
        <p className="font-amiri text-[1.02rem] sm:text-[1.35rem]" style={{ color: palette.academy }}>شهادة الإتمام</p>
        <p className="font-cinzel text-[0.76rem] sm:text-[0.98rem]" style={{ color: palette.heading, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          {templateMeta.name}
        </p>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${palette.line}, transparent)`, margin: '0.7rem 0 0.6rem' }} />
        <p className="font-crimson text-[0.86rem] sm:text-[0.96rem]" style={{ color: palette.body, opacity: 0.82 }}>
          This is to certify that
        </p>
      </div>

      <div className="w-full max-w-3xl rounded-[28px] px-5 py-5 sm:px-10 sm:py-6" style={{ background: palette.panel, border: `1px solid ${palette.line}` }}>
        <h1 className="font-cinzel font-black text-[1.5rem] sm:text-[2.8rem] break-words" style={{ color: palette.student, letterSpacing: '0.06em' }}>
          {cert.studentName}
        </h1>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${palette.line}, transparent)`, marginTop: '0.45rem' }} />
      </div>

      <div className="space-y-2">
        <p className="font-crimson text-[0.9rem] sm:text-[1rem]" style={{ color: palette.body, opacity: 0.75 }}>
          has successfully completed the course
        </p>
        <h2 className="font-cinzel font-bold text-[1.1rem] sm:text-[1.82rem] break-words max-w-3xl" style={{ color: palette.course, letterSpacing: '0.04em' }}>
          {cert.courseName}
        </h2>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-5 sm:items-end">
        <FooterMetaBlock
          label="DATE OF COMPLETION"
          value={date}
          line={palette.line}
          textColor={palette.signature}
          asset={sealSrc}
          assetAlt="Ali Nawaz Academy seal"
          assetClassName="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2"
        />
        <div className="text-center flex flex-col items-center justify-end gap-2">
          <Rosette color={palette.ornament} accent={palette.border} className="w-14 h-14 sm:w-16 sm:h-16" opacity={0.85} />
          <p className="font-cinzel text-[0.58rem] sm:text-[0.66rem]" style={{ color: palette.heading, letterSpacing: '0.14em' }}>
            CERTIFICATE ID: {cert.id}
          </p>
        </div>
        <FooterMetaBlock
          label="AUTHORIZED BY"
          value="Ali Nawaz Academy"
          line={palette.line}
          textColor={palette.signature}
          align="right"
          asset={signatureSrc}
          assetAlt="Ali Nawaz Academy signature"
          assetClassName="h-10 sm:h-12 w-auto object-contain mb-2"
        />
      </div>
    </div>
  </CertificateShell>
);

const OttomanRoyalTemplate = ({ cert, palette, templateMeta, signatureSrc, sealSrc, date }) => (
  <CertificateShell
    palette={palette}
    decorations={
      <>
        <Rosette color={palette.ornament} accent={palette.border} className="absolute top-[54px] left-[72px] w-28 h-28" opacity={0.18} />
        <Rosette color={palette.ornament} accent={palette.border} className="absolute top-[54px] right-[72px] w-28 h-28" opacity={0.18} />
        <div className="absolute top-[92px] left-[160px] right-[160px] h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${palette.line}, transparent)` }} />
      </>
    }
  >
    <div className="h-full flex flex-col justify-between gap-4 text-center">
      <div className="space-y-2">
        <p className="font-amiri text-[1.1rem] sm:text-[1.5rem]" style={{ color: palette.academy }}>فرمان الإجازة</p>
        <p className="font-cinzel font-black text-[1rem] sm:text-[1.65rem]" style={{ color: palette.academy, letterSpacing: '0.24em' }}>
          OTTOMAN ROYAL CERTIFICATE
        </p>
        <p className="font-crimson text-[0.84rem] sm:text-[0.96rem]" style={{ color: palette.subtitle }}>
          Issued by Ali Nawaz Academy in honor of disciplined sacred study
        </p>
      </div>

      <div className="grid sm:grid-cols-[1fr,auto,1fr] gap-4 items-center">
        <div className="hidden sm:flex justify-start">
          <Rosette color={palette.ornament} accent={palette.border} className="w-20 h-20" />
        </div>
        <div className="rounded-[30px] px-5 py-5 sm:px-10 sm:py-7" style={{ background: palette.panelStrong, border: `1px solid ${palette.line}` }}>
          <p className="font-amiri text-[1.05rem] sm:text-[1.35rem]" style={{ color: palette.academy }}>أكاديمية علي نواز</p>
          <p className="font-cinzel text-[0.75rem] sm:text-[0.96rem]" style={{ color: palette.heading, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
            {templateMeta.name}
          </p>
          <p className="font-crimson text-[0.86rem] sm:text-[0.96rem] mt-3" style={{ color: palette.body }}>
            Presented with honor to
          </p>
          <h1 className="font-cinzel font-black text-[1.55rem] sm:text-[2.65rem] break-words mt-2" style={{ color: palette.student, letterSpacing: '0.06em' }}>
            {cert.studentName}
          </h1>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${palette.line}, transparent)`, marginTop: '0.55rem' }} />
          <p className="font-crimson text-[0.88rem] sm:text-[0.98rem] mt-3" style={{ color: palette.body, opacity: 0.82 }}>
            for completion of
          </p>
          <h2 className="font-cinzel font-bold text-[1.08rem] sm:text-[1.72rem] mt-2 break-words" style={{ color: palette.course }}>
            {cert.courseName}
          </h2>
        </div>
        <div className="hidden sm:flex justify-end">
          <Rosette color={palette.ornament} accent={palette.border} className="w-20 h-20" />
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <PatternBand color={palette.ornament} soft={palette.border} className="w-full opacity-90" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,1fr] gap-5 sm:items-end">
        <FooterMetaBlock
          label="DATE OF COMPLETION"
          value={date}
          line={palette.line}
          textColor={palette.signature}
          asset={sealSrc}
          assetAlt="Ali Nawaz Academy seal"
          assetClassName="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2"
        />
        <div className="rounded-[20px] px-4 py-4 text-center" style={{ background: palette.panel, border: `1px solid ${palette.line}` }}>
          <p className="font-amiri text-[0.98rem] sm:text-[1.2rem]" style={{ color: palette.academy }}>رقم الشهادة</p>
          <p className="font-cinzel text-[0.66rem] sm:text-[0.8rem] mt-2 break-all" style={{ color: palette.heading, letterSpacing: '0.14em' }}>
            {cert.id}
          </p>
        </div>
        <FooterMetaBlock
          label="AUTHORIZED BY"
          value="Ali Nawaz Academy"
          line={palette.line}
          textColor={palette.signature}
          align="right"
          asset={signatureSrc}
          assetAlt="Ali Nawaz Academy signature"
          assetClassName="h-10 sm:h-12 w-auto object-contain mb-2"
        />
      </div>
    </div>
  </CertificateShell>
);

const MihrabModernTemplate = ({ cert, palette, templateMeta, signatureSrc, sealSrc, date }) => (
  <CertificateShell
    palette={palette}
    decorations={
      <Mihrab color={palette.line} accent={palette.ornament} className="hidden md:block absolute right-[60px] top-1/2 h-[78%] w-auto -translate-y-1/2 opacity-[0.16]" />
    }
  >
    <div className="h-full grid md:grid-cols-[1.1fr,0.9fr] gap-6 items-stretch">
      <div className="flex flex-col justify-between gap-5 text-left">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full px-4 py-1.5" style={{ background: palette.panelStrong, border: `1px solid ${palette.line}` }}>
            <span className="font-cinzel text-[0.7rem] sm:text-[0.78rem]" style={{ color: palette.heading, letterSpacing: '0.24em' }}>
              {templateMeta.style.toUpperCase()}
            </span>
          </div>
          <p className="font-amiri text-[1.05rem] sm:text-[1.4rem]" style={{ color: palette.academy }}>شهادة إتمام معتمدة</p>
          <h1 className="font-cinzel font-black text-[1.5rem] sm:text-[2.2rem] leading-tight" style={{ color: palette.academy, letterSpacing: '0.08em' }}>
            CERTIFICATE OF COMPLETION
          </h1>
          <p className="font-crimson text-[0.9rem] sm:text-[1rem] max-w-xl" style={{ color: palette.body, opacity: 0.8 }}>
            Ali Nawaz Academy certifies that the student named below has completed the required course of study in full.
          </p>
        </div>

        <div className="rounded-[34px] px-5 py-5 sm:px-8 sm:py-7" style={{ background: palette.panelStrong, border: `1px solid ${palette.line}` }}>
          <p className="font-crimson text-[0.84rem] sm:text-[0.92rem]" style={{ color: palette.subtitle, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Student Name
          </p>
          <h2 className="font-cinzel font-black text-[1.48rem] sm:text-[2.5rem] mt-2 break-words" style={{ color: palette.student }}>
            {cert.studentName}
          </h2>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${palette.line}, transparent)`, marginTop: '0.55rem' }} />
          <p className="font-crimson text-[0.84rem] sm:text-[0.92rem] mt-4" style={{ color: palette.subtitle, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Completed Course
          </p>
          <p className="font-cinzel font-bold text-[1.05rem] sm:text-[1.55rem] mt-2 break-words" style={{ color: palette.course }}>
            {cert.courseName}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr] gap-5 items-end">
          <FooterMetaBlock
            label="DATE OF COMPLETION"
            value={date}
            line={palette.line}
            textColor={palette.signature}
            asset={sealSrc}
            assetAlt="Ali Nawaz Academy seal"
            assetClassName="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-2"
          />
          <FooterMetaBlock
            label="AUTHORIZED BY"
            value="Ali Nawaz Academy"
            line={palette.line}
            textColor={palette.signature}
            align="right"
            asset={signatureSrc}
            assetAlt="Ali Nawaz Academy signature"
            assetClassName="h-10 sm:h-11 w-auto object-contain mb-2"
          />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div className="rounded-[28px] h-full min-h-[180px] flex flex-col justify-between p-5 sm:p-7" style={{ background: palette.panel, border: `1px solid ${palette.line}` }}>
          <div className="space-y-3 text-center">
            <p className="font-amiri text-[1rem] sm:text-[1.3rem]" style={{ color: palette.academy }}>أكاديمية علي نواز</p>
            <PatternBand color={palette.ornament} soft={palette.border} className="w-full opacity-80" />
            <p className="font-cinzel text-[0.76rem] sm:text-[0.92rem]" style={{ color: palette.heading, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
              {templateMeta.name}
            </p>
          </div>

          <div className="flex justify-center">
            <Mihrab color={palette.line} accent={palette.ornament} className="w-48 h-48 sm:w-56 sm:h-56" />
          </div>

          <div className="text-center">
            <p className="font-cinzel text-[0.62rem] sm:text-[0.72rem]" style={{ color: palette.heading, letterSpacing: '0.14em' }}>
              CERTIFICATE ID
            </p>
            <p className="font-crimson text-[0.82rem] sm:text-[0.94rem] break-all mt-2" style={{ color: palette.signature }}>
              {cert.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  </CertificateShell>
);

const ManuscriptHeritageTemplate = ({ cert, palette, templateMeta, signatureSrc, sealSrc, date }) => (
  <CertificateShell
    palette={palette}
    decorations={
      <>
        <div className="absolute top-[34px] left-[56px] right-[56px] rounded-full h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${palette.line}, transparent)` }} />
        <div className="absolute bottom-[34px] left-[56px] right-[56px] rounded-full h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${palette.line}, transparent)` }} />
      </>
    }
  >
    <div className="h-full flex flex-col justify-between gap-5">
      <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center text-center">
        <div className="hidden md:flex justify-start">
          <PatternBand color={palette.ornament} soft={palette.border} className="w-full opacity-80" />
        </div>
        <div>
          <p className="font-amiri text-[1.05rem] sm:text-[1.42rem]" style={{ color: palette.academy }}>
            سجل الإجازة العلمية
          </p>
          <p className="font-cinzel font-black text-[0.96rem] sm:text-[1.52rem]" style={{ color: palette.academy, letterSpacing: '0.2em' }}>
            MANUSCRIPT HERITAGE CERTIFICATE
          </p>
        </div>
        <div className="hidden md:flex justify-end">
          <PatternBand color={palette.ornament} soft={palette.border} className="w-full opacity-80" />
        </div>
      </div>

      <div className="rounded-[32px] p-5 sm:p-8 md:p-10" style={{ background: palette.panelStrong, border: `1px solid ${palette.line}` }}>
        <div className="grid md:grid-cols-[0.72fr,1.28fr] gap-6 items-start">
          <div className="space-y-4">
            <div className="rounded-[22px] p-4" style={{ background: palette.panel, border: `1px solid ${palette.line}` }}>
              <p className="font-cinzel text-[0.68rem] sm:text-[0.78rem]" style={{ color: palette.heading, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Institution
              </p>
              <p className="font-amiri text-[1rem] sm:text-[1.2rem] mt-2" style={{ color: palette.academy }}>
                أكاديمية علي نواز
              </p>
              <p className="font-cinzel font-bold text-[0.88rem] sm:text-[1rem] mt-1" style={{ color: palette.signature }}>
                Ali Nawaz Academy
              </p>
            </div>
            <Rosette color={palette.ornament} accent={palette.border} className="w-24 h-24 mx-auto md:mx-0" opacity={0.9} />
            <div className="rounded-[22px] p-4" style={{ background: palette.panel, border: `1px solid ${palette.line}` }}>
              <p className="font-cinzel text-[0.68rem] sm:text-[0.78rem]" style={{ color: palette.heading, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Certificate ID
              </p>
              <p className="font-crimson text-[0.84rem] sm:text-[0.96rem] break-all mt-2" style={{ color: palette.signature }}>
                {cert.id}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-crimson text-[0.9rem] sm:text-[1rem]" style={{ color: palette.body, opacity: 0.82 }}>
              This manuscript-style certificate records that
            </p>
            <div className="rounded-[26px] px-5 py-5 sm:px-7 sm:py-6" style={{ background: palette.panel, border: `1px solid ${palette.line}` }}>
              <h1 className="font-cinzel font-black text-[1.5rem] sm:text-[2.5rem] break-words" style={{ color: palette.student, letterSpacing: '0.06em' }}>
                {cert.studentName}
              </h1>
            </div>
            <p className="font-crimson text-[0.9rem] sm:text-[1rem]" style={{ color: palette.body, opacity: 0.82 }}>
              has completed the course of study titled
            </p>
            <h2 className="font-cinzel font-bold text-[1.08rem] sm:text-[1.72rem] break-words" style={{ color: palette.course }}>
              {cert.courseName}
            </h2>
            <div className="w-full max-w-2xl">
              <PatternBand color={palette.ornament} soft={palette.border} className="w-full opacity-85" />
            </div>
            <p className="font-crimson text-[0.82rem] sm:text-[0.95rem]" style={{ color: palette.subtitle }}>
              Template: {templateMeta.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr] gap-5 items-end">
        <FooterMetaBlock
          label="DATE OF COMPLETION"
          value={date}
          line={palette.line}
          textColor={palette.signature}
          asset={sealSrc}
          assetAlt="Ali Nawaz Academy seal"
          assetClassName="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2"
        />
        <FooterMetaBlock
          label="AUTHORIZED BY"
          value="Ali Nawaz Academy"
          line={palette.line}
          textColor={palette.signature}
          align="right"
          asset={signatureSrc}
          assetAlt="Ali Nawaz Academy signature"
          assetClassName="h-10 sm:h-12 w-auto object-contain mb-2"
        />
      </div>
    </div>
  </CertificateShell>
);

export default function CertificateCanvas({ cert, template, theme, signatureImage }) {
  const { platformSettings } = useApp();
  const activeTemplate = template || platformSettings.certificateTemplate || cert.template;
  const activeTheme = theme || platformSettings.certificateTheme || cert.theme;
  const templateMeta = getCertificateTemplateMeta(activeTemplate);
  const palette = getCertificateThemeMeta(activeTheme);
  const date = useMemo(() => formatCertificateDate(cert.issuedAt), [cert.issuedAt]);
  const signatureSrc = signatureImage || platformSettings.certificateSignature || signatureAsset;

  const commonProps = {
    cert,
    palette,
    templateMeta,
    signatureSrc,
    sealSrc: sealImage,
    date,
  };

  switch (templateMeta.id) {
    case 'ottoman-royal':
      return <OttomanRoyalTemplate {...commonProps} />;
    case 'mihrab-modern':
      return <MihrabModernTemplate {...commonProps} />;
    case 'manuscript-heritage':
      return <ManuscriptHeritageTemplate {...commonProps} />;
    case 'ijazah-classic':
    default:
      return <IjazahClassicTemplate {...commonProps} />;
  }
}
