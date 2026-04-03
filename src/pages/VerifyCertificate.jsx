import { useEffect, useState } from 'react';
import { AlertTriangle, BadgeCheck, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AcademyLogo from '../components/AcademyLogo';
import { CERTIFICATE_LAYOUT } from '../utils/certificateTemplates';
import { fetchIssuedCertificateRecord } from '../utils/certificateRecords';

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const DetailRow = ({ label, value }) => (
  <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255, 250, 239, 0.08)', border: `1px solid ${CERTIFICATE_LAYOUT.frameGoldSoft}` }}>
    <p className="font-cinzel text-[0.58rem] uppercase text-gold-400/70 tracking-[0.22em]">{label}</p>
    <p className="mt-2 text-sm sm:text-base text-cream/90 break-words">{value}</p>
  </div>
);

export default function VerifyCertificate() {
  const { certificateId = '' } = useParams();
  const [status, setStatus] = useState('loading');
  const [record, setRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadCertificate = async () => {
      setStatus('loading');
      const result = await fetchIssuedCertificateRecord(certificateId);

      if (!active) return;

      if (!result.ok) {
        setRecord(null);
        setErrorMessage(result.message || 'This certificate could not be verified.');
        setStatus('invalid');
        return;
      }

      setRecord(result.record);
      setErrorMessage('');
      setStatus('valid');
    };

    void loadCertificate();

    return () => {
      active = false;
    };
  }, [certificateId]);

  return (
    <div className="geometric-bg min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="glass-card px-5 py-6 sm:px-8 sm:py-8">
          <AcademyLogo size="md" className="justify-center mb-6" textAlign="center" />
          <div className="text-center">
            <p className="font-cinzel text-gold-400 text-xs tracking-[0.22em] uppercase">Public Verification</p>
            <h1 className="mt-2 font-cormorant text-4xl font-semibold text-cream">Certificate Verification</h1>
            <p className="mt-3 text-cream/55">
              Ali Nawaz Academy verification portal for issued course completion certificates.
            </p>
          </div>
        </div>

        <div className="glass-card px-5 py-6 sm:px-8 sm:py-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={30} className="animate-spin text-gold-400" />
              <p className="mt-4 text-cream/60">Checking certificate record...</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-5 text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-400/20">
                <AlertTriangle size={28} className="text-red-300" />
              </div>
              <div>
                <h2 className="font-cinzel text-2xl text-red-200">Certificate Not Verified</h2>
                <p className="mt-3 text-cream/55 max-w-2xl mx-auto">{errorMessage || 'This certificate ID was not found in the Ali Nawaz Academy verification records.'}</p>
              </div>
              <div className="rounded-2xl px-4 py-4 text-left max-w-xl mx-auto" style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(248,113,113,0.18)' }}>
                <p className="font-cinzel text-[0.6rem] uppercase text-red-200/70 tracking-[0.22em]">Certificate ID Checked</p>
                <p className="mt-2 break-all text-cream/85">{certificateId || 'Unavailable'}</p>
              </div>
            </div>
          )}

          {status === 'valid' && record && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/20">
                    <BadgeCheck size={26} className="text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-cinzel text-xs uppercase text-emerald-300 tracking-[0.22em]">Valid Certificate</p>
                    <h2 className="font-cormorant text-3xl font-semibold text-cream">Record Confirmed</h2>
                  </div>
                </div>
                <span className="badge badge-emerald text-[11px] w-fit">Ali Nawaz Academy</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Student Name" value={record.studentName} />
                <DetailRow label="Course Name" value={record.courseName} />
                <DetailRow label="Completion Date" value={formatDate(record.completionDate)} />
                <DetailRow label="Certificate ID" value={record.certificateId} />
              </div>

              <div className="rounded-2xl px-5 py-5 text-center" style={{ background: 'rgba(255, 250, 239, 0.06)', border: `1px solid ${CERTIFICATE_LAYOUT.frameGoldSoft}` }}>
                <p className="font-amiri text-2xl text-emerald-300">أكاديمية علي نواز</p>
                <p className="mt-2 text-cream/65">
                  This certificate is recognized as an authentic Ali Nawaz Academy completion record.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="btn-gold inline-flex items-center justify-center">
            Back to Academy Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
