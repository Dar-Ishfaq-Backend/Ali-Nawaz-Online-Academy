import { useEffect, useMemo, useState } from 'react';
import academyLogo from '../../assets/logo.png';
import sealImage from '../../assets/seal.png';
import bundledSignature from '../../assets/signature.png';
import { buildCertificateVerificationUrl, createCertificateQrDataUrl } from '../../utils/certificateRecords';
import { CERTIFICATE_LAYOUT } from '../../utils/certificateTemplates';

const formatCertificateDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStudentNameSize = (value = '') => {
  if (value.length > 30) return '2.35rem';
  if (value.length > 22) return '2.7rem';
  if (value.length > 16) return '3rem';
  return '3.3rem';
};

const getCourseNameSize = (value = '') => {
  if (value.length > 36) return '1.55rem';
  if (value.length > 28) return '1.8rem';
  if (value.length > 20) return '2rem';
  return '2.2rem';
};

const CornerOrnament = ({ position }) => {
  const positionStyle = {
    topLeft: { top: 18, left: 18, transform: 'none' },
    topRight: { top: 18, right: 18, transform: 'scaleX(-1)' },
    bottomLeft: { bottom: 18, left: 18, transform: 'scaleY(-1)' },
    bottomRight: { bottom: 18, right: 18, transform: 'scale(-1)' },
  }[position];

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute h-16 w-16 sm:h-20 sm:w-20"
      style={{ ...positionStyle, color: CERTIFICATE_LAYOUT.frameGold }}
      fill="none"
    >
      <path d="M8 70C8 26 26 8 70 8" stroke="currentColor" strokeWidth="1.25" opacity="0.8" />
      <path d="M16 72C16 33 33 16 72 16" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      <path d="M8 50C22 48 31 40 38 28C42 40 52 48 68 50C52 53 42 61 38 74C31 61 22 53 8 50Z" fill="currentColor" opacity="0.15" />
      <path d="M30 18L40 28L30 38L20 28Z" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <path d="M18 50L28 60L18 70L8 60Z" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      <path d="M70 8V34" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      <path d="M8 70H34" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
    </svg>
  );
};

const DividerMotif = () => (
  <div className="flex items-center justify-center gap-4" style={{ color: CERTIFICATE_LAYOUT.frameGold }}>
    <span className="h-px w-20 sm:w-24" style={{ background: `linear-gradient(90deg, transparent, ${CERTIFICATE_LAYOUT.frameGold}, transparent)` }} />
    <svg viewBox="0 0 48 16" className="h-4 w-12" fill="none">
      <path d="M8 8L16 0L24 8L16 16L8 8Z" stroke="currentColor" strokeWidth="1" />
      <path d="M24 8L32 0L40 8L32 16L24 8Z" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <circle cx="16" cy="8" r="2.5" fill="currentColor" opacity="0.35" />
      <circle cx="32" cy="8" r="2.5" fill="currentColor" opacity="0.18" />
    </svg>
    <span className="h-px w-20 sm:w-24" style={{ background: `linear-gradient(90deg, transparent, ${CERTIFICATE_LAYOUT.frameGold}, transparent)` }} />
  </div>
);

const MetaCard = ({ label, value, align = 'center' }) => (
  <div
    className="rounded-[18px] px-4 py-3 text-center min-h-[84px] flex flex-col justify-center"
    style={{
      background: 'rgba(255, 250, 239, 0.7)',
      border: `1px solid ${CERTIFICATE_LAYOUT.line}`,
      boxShadow: '0 12px 28px rgba(120, 93, 42, 0.07)',
      textAlign: align,
    }}
  >
    <p
      className="font-cinzel text-[0.56rem] uppercase"
      style={{ color: CERTIFICATE_LAYOUT.inkSoft, letterSpacing: '0.22em' }}
    >
      {label}
    </p>
    <p
      className="mt-2 break-words"
      style={{
        color: CERTIFICATE_LAYOUT.emeraldDeep,
        fontSize: value.length > 20 ? '0.8rem' : '0.92rem',
        lineHeight: 1.3,
      }}
    >
      {value}
    </p>
  </div>
);

const SealBadge = () => (
  <div className="flex flex-col items-center justify-center gap-1.5">
    <div
      className="relative flex h-24 w-24 items-center justify-center rounded-full"
      style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(244, 231, 204, 0.92))',
        border: `1.5px solid ${CERTIFICATE_LAYOUT.frameGold}`,
        boxShadow: '0 12px 24px rgba(130, 92, 25, 0.16)',
      }}
    >
      <div
        className="absolute inset-[7px] rounded-full"
        style={{ border: `1px dashed ${CERTIFICATE_LAYOUT.frameGold}`, opacity: 0.8 }}
      />
      <img src={sealImage} alt="Ali Nawaz Academy seal" className="h-16 w-16 object-contain" />
    </div>
    <div className="text-center">
      <p className="font-cinzel text-[0.5rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.inkSoft, letterSpacing: '0.18em' }}>
        Traditional
      </p>
      <p className="font-cormorant text-[0.9rem] font-semibold leading-none mt-0.5" style={{ color: CERTIFICATE_LAYOUT.ink }}>
        Ijazah
      </p>
      <p className="font-cinzel text-[0.5rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.inkSoft, letterSpacing: '0.18em' }}>
        Inspired Presentation
      </p>
    </div>
  </div>
);

const SignatureBlock = ({ signatureSrc }) => (
  <div className="flex flex-col items-start gap-2 self-end">
    <div className="flex h-14 w-40 items-end">
      <img src={signatureSrc} alt="Ali Nawaz Academy signature" className="max-h-12 w-auto object-contain" />
    </div>
    <div className="w-[8.75rem]" style={{ borderTop: `1px solid ${CERTIFICATE_LAYOUT.frameGold}` }}>
      <p className="mt-2 font-cinzel text-[0.55rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.inkSoft, letterSpacing: '0.16em' }}>
        Authorized Instructor
      </p>
      <p className="text-[0.88rem] leading-tight" style={{ color: CERTIFICATE_LAYOUT.ink }}>
        Ali Nawaz Academy
      </p>
    </div>
  </div>
);

const QrBlock = ({ qrCodeDataUrl }) => (
  <div className="flex flex-col items-center gap-1.5 self-end">
    <div
      className="flex h-24 w-24 items-center justify-center rounded-[14px] bg-white p-2"
      style={{ border: `1px solid ${CERTIFICATE_LAYOUT.line}`, boxShadow: '0 12px 24px rgba(110, 84, 31, 0.08)' }}
    >
      {qrCodeDataUrl ? (
        <img src={qrCodeDataUrl} alt="Certificate verification QR code" className="h-full w-full object-contain" />
      ) : (
        <div className="h-full w-full rounded-[10px]" style={{ background: 'linear-gradient(135deg, rgba(31,106,74,0.14), rgba(201,162,78,0.14))' }} />
      )}
    </div>
    <div className="text-center">
      <p className="font-cinzel text-[0.56rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.inkSoft, letterSpacing: '0.16em' }}>
        Verify Certificate
      </p>
      <p className="text-[0.66rem] leading-tight" style={{ color: CERTIFICATE_LAYOUT.inkSoft }}>
        Scan to confirm authenticity
      </p>
    </div>
  </div>
);

const IssuerNote = ({ certificateId }) => (
  <div className="max-w-[11.75rem] text-right self-end">
    <p className="font-cinzel text-[0.58rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.emerald, letterSpacing: '0.16em' }}>
      Issued by Ali Nawaz Academy
    </p>
    <p className="mt-2 text-[0.78rem] leading-5" style={{ color: CERTIFICATE_LAYOUT.ink }}>
      May this completion be a source of barakah, growth, and beneficial knowledge.
    </p>
    <p className="mt-2 text-[0.66rem] leading-tight" style={{ color: CERTIFICATE_LAYOUT.inkSoft }}>
      Certificate ID: {certificateId}
    </p>
  </div>
);

export default function CertificateCanvas({ cert, signatureImage }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(cert.qrCodeDataUrl || '');

  const verificationUrl = useMemo(
    () => cert.verificationUrl || buildCertificateVerificationUrl(cert.id),
    [cert.id, cert.verificationUrl],
  );

  useEffect(() => {
    let active = true;

    if (cert.qrCodeDataUrl) {
      setQrCodeDataUrl(cert.qrCodeDataUrl);
      return () => {
        active = false;
      };
    }

    if (!cert.id) {
      setQrCodeDataUrl('');
      return () => {
        active = false;
      };
    }

    createCertificateQrDataUrl(cert.id, verificationUrl)
      .then((result) => {
        if (active) {
          setQrCodeDataUrl(result.qrCodeDataUrl || '');
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeDataUrl('');
        }
      });

    return () => {
      active = false;
    };
  }, [cert.id, cert.qrCodeDataUrl, verificationUrl]);

  const signatureSrc = signatureImage || cert.signatureImage || bundledSignature;
  const formattedDate = formatCertificateDate(cert.completionDate || cert.issuedAt);

  return (
    <div
      className="certificate-root relative overflow-hidden rounded-[28px] shadow-[0_24px_64px_rgba(24,15,4,0.22)]"
      style={{
        width: CERTIFICATE_LAYOUT.width,
        minWidth: CERTIFICATE_LAYOUT.width,
        maxWidth: CERTIFICATE_LAYOUT.width,
        height: CERTIFICATE_LAYOUT.height,
        background: `
          radial-gradient(circle at 50% 18%, rgba(255,255,255,0.2), transparent 18%),
          linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.04) 18%, transparent 38%, rgba(191,151,65,0.08) 100%),
          linear-gradient(135deg, ${CERTIFICATE_LAYOUT.parchment} 0%, ${CERTIFICATE_LAYOUT.parchmentWarm} 56%, #e5d0a4 100%)
        `,
      }}
    >
      <div
        className="certificate-texture-layer absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 60%, rgba(174, 142, 78, 0.05) 0%, transparent 24%),
            linear-gradient(45deg, rgba(201,162,78,0.03) 25%, transparent 25%, transparent 50%, rgba(201,162,78,0.03) 50%, rgba(201,162,78,0.03) 75%, transparent 75%, transparent),
            linear-gradient(-45deg, rgba(17,69,49,0.025) 25%, transparent 25%, transparent 50%, rgba(17,69,49,0.025) 50%, rgba(17,69,49,0.025) 75%, transparent 75%, transparent)
          `,
          backgroundSize: 'auto, 64px 64px, 64px 64px',
          opacity: 0.48,
        }}
      />

      <div
        className="absolute inset-[12px] rounded-[22px]"
        style={{ border: `1px solid ${CERTIFICATE_LAYOUT.frameGold}` }}
      />
      <div
        className="absolute inset-[24px] rounded-[16px]"
        style={{ border: `1px solid ${CERTIFICATE_LAYOUT.frameGoldSoft}` }}
      />

      <CornerOrnament position="topLeft" />
      <CornerOrnament position="topRight" />
      <CornerOrnament position="bottomLeft" />
      <CornerOrnament position="bottomRight" />

      <div
        className="absolute top-0 left-0 right-0 h-10"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(201,162,78,0.28), transparent)`,
          opacity: 0.8,
        }}
      />

      <div className="relative z-10 grid h-full grid-rows-[auto_auto_auto_auto_auto_1fr_auto_auto] gap-y-5 px-10 pb-8 pt-10">
        <div className="text-center">
          <p className="font-amiri text-[1.28rem]" style={{ color: CERTIFICATE_LAYOUT.emerald }}>
            بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ
          </p>
          <div className="mt-3 flex items-center justify-center">
            <img src={academyLogo} alt="Ali Nawaz Academy logo" className="h-20 w-20 object-contain" />
          </div>
          <p className="mt-2 font-cinzel text-[0.66rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.inkSoft, letterSpacing: '0.24em' }}>
            Ali Nawaz Academy
          </p>
          <p className="font-amiri text-[1.02rem]" style={{ color: CERTIFICATE_LAYOUT.emeraldDeep }}>
            أكاديمية علي نواز
          </p>
        </div>

        <div className="text-center">
          <p className="font-amiri text-[1.7rem]" style={{ color: CERTIFICATE_LAYOUT.emerald }}>
            شهادة إتمام
          </p>
          <h1
            className="mt-1 font-cormorant text-[2.75rem] font-semibold"
            style={{ color: CERTIFICATE_LAYOUT.ink, letterSpacing: '0.01em' }}
          >
            Certificate of Completion
          </h1>
          <DividerMotif />
          <p
            className="mx-auto mt-3 max-w-[37rem] text-center text-[0.88rem] leading-6"
            style={{ color: CERTIFICATE_LAYOUT.inkSoft }}
          >
            With gratitude and recognition for sincere effort in seeking beneficial knowledge, this certificate
            is presented in honor of successful completion.
          </p>
        </div>

        <div className="text-center">
          <p className="font-cinzel text-[0.66rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.frameGold, letterSpacing: '0.28em' }}>
            Presented To
          </p>
          <div className="mx-auto mt-2 max-w-[34rem] border-b pb-2.5" style={{ borderColor: CERTIFICATE_LAYOUT.line }}>
            <p
              className="font-cormorant font-semibold leading-tight"
              style={{ color: CERTIFICATE_LAYOUT.emerald, fontSize: getStudentNameSize(cert.studentName || '') }}
            >
              {cert.studentName}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="font-cinzel text-[0.66rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.frameGold, letterSpacing: '0.26em' }}>
            For Successfully Completing
          </p>
          <div className="mx-auto mt-2 max-w-[36rem] border-b pb-2.5" style={{ borderColor: CERTIFICATE_LAYOUT.line }}>
            <p
              className="font-cormorant font-semibold leading-tight"
              style={{ color: CERTIFICATE_LAYOUT.ink, fontSize: getCourseNameSize(cert.courseName || '') }}
            >
              {cert.courseName}
            </p>
          </div>
        </div>

        <div
          className="mx-auto w-full max-w-[31rem] rounded-[16px] px-7 py-4 text-center"
          style={{
            background: 'rgba(255, 250, 239, 0.62)',
            border: `1px solid ${CERTIFICATE_LAYOUT.line}`,
          }}
        >
          <p className="font-amiri text-[1.2rem]" style={{ color: CERTIFICATE_LAYOUT.emerald }}>
            رَبِّ زِدْنِي عِلْمًا
          </p>
          <p className="mt-1 font-cinzel text-[0.54rem] uppercase" style={{ color: CERTIFICATE_LAYOUT.frameGold, letterSpacing: '0.18em' }}>
            “My Lord, increase me in knowledge.”
          </p>
        </div>

        <div />

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
          <MetaCard label="Completion Date" value={formattedDate} />
          <SealBadge />
          <MetaCard label="Certificate ID" value={cert.id} />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
          <SignatureBlock signatureSrc={signatureSrc} />
          <QrBlock qrCodeDataUrl={qrCodeDataUrl} />
          <IssuerNote certificateId={cert.id} />
        </div>
      </div>
    </div>
  );
}
