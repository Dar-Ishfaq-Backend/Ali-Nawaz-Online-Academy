import { useRef } from 'react';
import { Download } from 'lucide-react';
import { getCertificateThemeMeta } from '../utils/certificateTemplates';
import CertificateCanvas from './certificates/CertificateCanvas';

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

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: palette.canvasBackground,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${cert.studentName.replace(/\s+/g, '_')}_Certificate_${cert.id}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Could not generate PDF. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div ref={certRef}>
        <CertificateCanvas
          cert={cert}
          template={template}
          theme={theme}
          signatureImage={signatureImage}
        />
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
