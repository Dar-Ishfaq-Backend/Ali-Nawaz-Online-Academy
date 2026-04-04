import { useRef } from 'react';
import { Download } from 'lucide-react';
import { CERTIFICATE_LAYOUT } from '../utils/certificateTemplates';
import CertificateCanvas from './certificates/CertificateCanvas';

const waitForFonts = async () => {
  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Non-blocking: PDF export can still proceed if font readiness fails.
  }
};

const waitForImages = async (element) => {
  const images = [...element.querySelectorAll('img')];

  await Promise.all(images.map((image) => {
    if (image.complete) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });
  }));
};

const createExportClone = (element) => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = `${CERTIFICATE_LAYOUT.width + 72}px`;
  wrapper.style.padding = '24px';
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.background = CERTIFICATE_LAYOUT.canvasBackground;
  wrapper.style.zIndex = '-1';

  const clone = element.cloneNode(true);
  clone.style.width = `${CERTIFICATE_LAYOUT.width}px`;
  clone.style.maxWidth = `${CERTIFICATE_LAYOUT.width}px`;
  clone.style.minWidth = `${CERTIFICATE_LAYOUT.width}px`;
  clone.style.animation = 'none';
  clone.style.transform = 'none';
  clone.dataset.certificateExport = 'true';

  const textureLayer = clone.querySelector('.certificate-texture-layer');
  if (textureLayer) {
    textureLayer.style.backgroundImage = `
      radial-gradient(circle at 50% 60%, rgba(174, 142, 78, 0.045) 0%, transparent 26%),
      linear-gradient(180deg, rgba(255,255,255,0.12), transparent 30%)
    `;
    textureLayer.style.backgroundSize = 'auto';
    textureLayer.style.opacity = '0.35';
  }

  const root = clone.querySelector('.certificate-root');
  if (root) {
    root.style.boxShadow = '0 18px 36px rgba(24,15,4,0.16)';
  }

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { wrapper, clone };
};

export default function CertificateGenerator({ cert, signatureImage, onDownload, showDownload = true }) {
  const certRef = useRef(null);

  const handleDownload = async () => {
    if (!certRef.current) return;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      await waitForFonts();
      await waitForImages(certRef.current);

      const { wrapper, clone } = createExportClone(certRef.current);
      let canvas = null;

      try {
        const exportScale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5));

        canvas = await html2canvas(clone, {
          scale: exportScale,
          backgroundColor: CERTIFICATE_LAYOUT.canvasBackground,
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 0,
          windowWidth: CERTIFICATE_LAYOUT.width + 120,
          windowHeight: CERTIFICATE_LAYOUT.height + 120,
          onclone: (doc) => {
            doc.body.style.margin = '0';
            doc.body.style.background = CERTIFICATE_LAYOUT.canvasBackground;
            doc.documentElement.style.background = CERTIFICATE_LAYOUT.canvasBackground;

            doc.querySelectorAll('.animate-fade-in').forEach((node) => {
              node.style.animation = 'none';
            });
          },
        });
      } finally {
        wrapper.remove();
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 7;
      const usableWidth = pageWidth - (margin * 2);
      const usableHeight = pageHeight - (margin * 2);
      const renderRatio = Math.min(usableWidth / canvas.width, usableHeight / canvas.height);
      const renderWidth = canvas.width * renderRatio;
      const renderHeight = canvas.height * renderRatio;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
      pdf.save(`${(cert.studentName || 'student').replace(/\s+/g, '_')}_Certificate_${cert.id}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Could not generate PDF. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="overflow-auto rounded-[26px] p-3 sm:p-5" style={{ background: 'rgba(3, 18, 12, 0.34)' }}>
        <div className="mx-auto w-fit">
          <div ref={certRef}>
            <CertificateCanvas cert={cert} signatureImage={signatureImage} />
          </div>
        </div>
      </div>

      {showDownload && (
        <div className="flex justify-center">
          <button onClick={onDownload || handleDownload} className="btn-gold flex items-center justify-center gap-2 text-sm px-6 py-3 w-full sm:w-auto">
            <Download size={16} />
            Download Certificate (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
