import { useState } from 'react';
import { Award, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { COURSES } from '../data/courses';
import { getCourseProgress } from '../utils/storage';
import CertificateGenerator from '../components/CertificateGenerator';

export default function Certificates() {
  const { certificates, enrollments, issueCert } = useApp();
  const [viewing, setViewing] = useState(null);

  // Find courses that are complete but no cert yet
  const completedNoCert = COURSES
    .filter(c => enrollments[c.id] && getCourseProgress(c) === 100 && !certificates[c.id]);

  const certList = Object.values(certificates);

  if (viewing) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setViewing(null)}
          className="flex items-center gap-2 text-cream/40 hover:text-cream/80 font-crimson text-sm mb-6">
          ← Back to Certificates
        </button>
        <h1 className="font-cinzel font-black text-2xl text-gold-400 mb-6">Your Certificate</h1>
        <CertificateGenerator cert={viewing} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-cinzel font-black text-2xl md:text-3xl text-gold-400 mb-1">Certificates</h1>
        <p className="text-cream/50 font-crimson">Your earned credentials</p>
      </div>

      {/* Claimable certificates */}
      {completedNoCert.length > 0 && (
        <div className="glass-card p-5 border-gold-500/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-gold-400" />
            <h2 className="font-cinzel font-bold text-gold-400">Ready to Claim!</h2>
          </div>
          <div className="space-y-3">
            {completedNoCert.map(course => (
              <div key={course.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Award size={20} className="text-gold-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-cinzel font-bold text-gold-300 text-sm">{course.title}</p>
                  <p className="text-cream/40 text-xs font-crimson">100% completed</p>
                </div>
                <button onClick={() => { const c = issueCert(course.id, course.title); setViewing(c); }}
                  className="btn-gold text-xs px-4 py-2">
                  Claim Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing certificates */}
      {certList.length === 0 && completedNoCert.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Award size={60} className="text-gold-500/15 mx-auto mb-4" />
          <p className="font-cinzel text-cream/30 text-lg mb-2">No certificates yet</p>
          <p className="text-cream/20 font-crimson text-sm mb-6">Complete a course to earn your first certificate</p>
          <Link to="/courses" className="btn-gold inline-block">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certList.map(cert => (
            <div key={cert.id} className="glass-card p-5 flex flex-col items-center text-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer"
              onClick={() => setViewing(cert)}>
              {/* Mini certificate preview */}
              <div className="w-full h-32 rounded-xl flex flex-col items-center justify-center certificate-border"
                style={{ background: 'linear-gradient(135deg, #1a0a00, #0a1a08)' }}>
                <p className="font-amiri text-gold-400 text-lg">بِسْمِ اللَّهِ</p>
                <Award size={28} className="text-gold-400 my-1" />
                <p className="font-cinzel text-[10px] text-gold-500/60 tracking-widest">CERTIFICATE</p>
              </div>
              <div>
                <p className="font-cinzel font-bold text-gold-400 text-sm mb-0.5">{cert.courseName}</p>
                <p className="text-cream/50 font-crimson text-xs">{cert.studentName}</p>
                <p className="text-cream/30 font-crimson text-xs mt-1">
                  {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-cream/20 font-crimson text-[10px] mt-1">{cert.id}</p>
              </div>
              <button className="btn-gold text-xs px-5 py-2 w-full">View & Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
