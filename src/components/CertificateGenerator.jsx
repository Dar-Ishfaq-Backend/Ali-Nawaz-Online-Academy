import { useRef } from 'react';
import { Download } from 'lucide-react';
import { getCertificateThemeMeta } from '../utils/certificateTemplates';
import CertificateCanvas from './certificates/CertificateCanvas';

const waitForFonts = async () => {
  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Font readiness is a nice-to-have for export, not a blocker.
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

const createExportClone = (element, backgroundColor) => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '1200px';
  wrapper.style.padding = '24px';
  wrapper.style.background = backgroundColor;
  wrapper.style.zIndex = '-1';

  const clone = element.cloneNode(true);
  clone.style.width = '1120px';
  clone.style.maxWidth = '1120px';
  clone.style.minWidth = '1120px';
  clone.style.animation = 'none';
  clone.style.transform = 'none';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { wrapper, clone };
};

export default function CertificateGenerator({ cert, template, theme, signatureImage, onDownload, showDownload = true }) {
  const certRef = useRef(null);
  const palette = getCertificateThemeMeta(theme || cert.theme);

  const handleDownload = async () => {
    if (!certRef.current) return;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      await waitForFonts();
      await waitForImages(certRef.current);

      const { wrapper, clone } = createExportClone(certRef.current, palette.canvasBackground);
      let canvas = null;

      try {
        const exportScale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1.5));

        canvas = await html2canvas(clone, {
          scale: exportScale,
          backgroundColor: palette.canvasBackground,
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 0,
          windowWidth: 1400,
          windowHeight: 1100,
          onclone: (doc) => {
            doc.body.style.margin = '0';
            doc.body.style.background = palette.canvasBackground;
            doc.documentElement.style.background = palette.canvasBackground;

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
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
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
    <div className="animate-fade-in">
      <div className="overflow-x-auto overflow-y-visible pb-3">
        <div className="w-max min-w-full flex justify-center">
          <div ref={certRef}>
            <CertificateCanvas
              cert={cert}
              template={template}
              theme={theme}
              signatureImage={signatureImage}
            />
          </div>
        </div>
      </div>

      {showDownload && (
        <div className="flex justify-center mt-6">
          <button onClick={onDownload || handleDownload} className="btn-gold flex items-center justify-center gap-2 text-sm px-6 py-3 w-full sm:w-auto">
            <Download size={16} />
            Download Certificate (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
