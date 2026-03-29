import { useRef } from 'react';
import { Download, Award } from 'lucide-react';

// Islamic geometric ornament SVG
const OrnamentTop = () => (
  <svg viewBox="0 0 400 60" fill="none" className="w-full opacity-60">
    <path d="M200 10 L220 30 L200 50 L180 30 Z" stroke="#d97706" strokeWidth="1" fill="none"/>
    <path d="M200 5 L230 30 L200 55 L170 30 Z" stroke="#d97706" strokeWidth="0.5" fill="none"/>
    <line x1="0" y1="30" x2="160" y2="30" stroke="#d97706" strokeWidth="0.5" opacity="0.5"/>
    <line x1="240" y1="30" x2="400" y2="30" stroke="#d97706" strokeWidth="0.5" opacity="0.5"/>
    <circle cx="200" cy="30" r="3" fill="#d97706" opacity="0.6"/>
    <circle cx="150" cy="30" r="2" fill="#d97706" opacity="0.4"/>
    <circle cx="250" cy="30" r="2" fill="#d97706" opacity="0.4"/>
  </svg>
);

export default function CertificateGenerator({ cert, onDownload }) {
  const certRef = useRef(null);

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#1a0f00',
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

  return (
    <div className="animate-fade-in">
      {/* Certificate Canvas */}
      <div ref={certRef} className="relative mx-auto certificate-border rounded-2xl overflow-hidden"
        style={{
          maxWidth: 860,
          background: 'linear-gradient(135deg, #1a0a00 0%, #0a1a08 40%, #1a0d00 100%)',
          fontFamily: "'Cinzel', serif",
          minHeight: 520,
          padding: '3rem',
        }}>

        {/* Corner ornaments */}
        <div className="absolute top-3 left-3 w-16 h-16 opacity-40"
          style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />
        <div className="absolute top-3 right-3 w-16 h-16 opacity-40"
          style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />
        <div className="absolute bottom-3 left-3 w-16 h-16 opacity-40"
          style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />
        <div className="absolute bottom-3 right-3 w-16 h-16 opacity-40"
          style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 text-center flex flex-col items-center gap-4">
          {/* Bismillah */}
          <p style={{ fontFamily: "'Amiri', serif", fontSize: '1.8rem', color: '#d97706', lineHeight: 1.3 }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Logo area */}
          <div className="flex items-center gap-2 my-1">
            <Award size={28} color="#d97706" />
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: '1.4rem', color: '#d97706', letterSpacing: '0.15em' }}>
                ALI NAWAZ ACADEMY
              </div>
              <div style={{ fontFamily: "'Amiri', serif", fontSize: '0.9rem', color: '#a16207', letterSpacing: '0.1em' }}>
                أكاديمية علي نواز
              </div>
            </div>
          </div>

          <OrnamentTop />

          {/* Certificate title */}
          <div>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '0.9rem', color: '#a16207', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Certificate of Completion
            </p>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d97706, transparent)', margin: '0.5rem 0' }} />
          </div>

          {/* This is to certify */}
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1rem', color: '#fef3c7', opacity: 0.7 }}>
            This is to certify that
          </p>

          {/* Student name */}
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: '2.5rem', color: '#fbbf24', letterSpacing: '0.05em', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
              {cert.studentName}
            </h1>
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #d97706, transparent)', marginTop: '0.25rem' }} />
          </div>

          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1rem', color: '#fef3c7', opacity: 0.7 }}>
            has successfully completed the course
          </p>

          {/* Course name */}
          <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '1.6rem', color: '#10b981', letterSpacing: '0.03em' }}>
            {cert.courseName}
          </h2>

          <OrnamentTop />

          {/* Footer row */}
          <div className="w-full flex justify-between items-end mt-2">
            <div className="text-left">
              <div style={{ borderTop: '1px solid #d97706', paddingTop: '0.5rem', minWidth: 140 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', color: '#a16207', letterSpacing: '0.1em' }}>DATE OF COMPLETION</p>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '0.9rem', color: '#fbbf24' }}>{date}</p>
              </div>
            </div>

            <div className="text-center">
              <div style={{ fontFamily: "'Amiri', serif", fontSize: '2rem', color: '#d97706', opacity: 0.4 }}>☽</div>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: '#a16207', letterSpacing: '0.1em' }}>CERTIFICATE ID: {cert.id}</p>
            </div>

            <div className="text-right">
              <div style={{ borderTop: '1px solid #d97706', paddingTop: '0.5rem', minWidth: 140 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', color: '#a16207', letterSpacing: '0.1em' }}>AUTHORIZED BY</p>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic', fontSize: '0.9rem', color: '#fbbf24' }}>Ali Nawaz Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center mt-6">
        <button onClick={handleDownload} className="btn-gold flex items-center gap-2 text-sm px-6 py-3">
          <Download size={16} />
          Download Certificate (PDF)
        </button>
      </div>
    </div>
  );
}
