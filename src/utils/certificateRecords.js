import QRCode from 'qrcode';
import { getSupabaseSession, isSupabaseEnabled, requestSupabase } from './supabaseAuth';

const CERTIFICATE_SELECT = 'certificate_id,user_id,course_id,student_name,course_name,completion_date,issued_at';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');
const safeText = (value, fallback = '') => (typeof value === 'string' ? value.trim() : '') || fallback;
const toDateOnly = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
};

export const buildCertificateVerificationUrl = (certificateId) => {
  const configuredSiteUrl = trimTrailingSlash(import.meta.env.VITE_SITE_URL || '');
  const origin = configuredSiteUrl || (
    typeof window !== 'undefined' ? trimTrailingSlash(window.location.origin) : ''
  );

  if (!origin || !certificateId) return '';
  return `${origin}/verify-certificate/${encodeURIComponent(certificateId)}`;
};

export const createCertificateQrDataUrl = async (certificateId, verificationUrl = buildCertificateVerificationUrl(certificateId)) => {
  if (!verificationUrl) {
    return { verificationUrl: '', qrCodeDataUrl: '' };
  }

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1b573d',
      light: '#fffdf9',
    },
  });

  return { verificationUrl, qrCodeDataUrl };
};

const normalizeCertificateRecord = (record) => {
  if (!record?.certificate_id) return null;

  return {
    certificateId: record.certificate_id,
    userId: record.user_id || '',
    courseId: safeText(record.course_id),
    studentName: safeText(record.student_name, 'Student'),
    courseName: safeText(record.course_name, 'Course'),
    completionDate: toDateOnly(record.completion_date || record.issued_at),
    issuedAt: record.issued_at || new Date().toISOString(),
  };
};

export const upsertIssuedCertificateRecord = async ({
  certificateId,
  userId,
  courseId,
  studentName,
  courseName,
  completionDate,
  issuedAt,
}) => {
  if (!isSupabaseEnabled()) {
    return {
      ok: false,
      message: 'Supabase must be configured before certificates can be issued because QR verification is required.',
    };
  }

  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) {
    return {
      ok: false,
      message: 'Please sign in again before issuing the certificate.',
    };
  }

  const verifiedStudentName = safeText(studentName, 'Student');
  const verifiedCourseName = safeText(courseName, 'Course');
  const verifiedIssuedAt = issuedAt || new Date().toISOString();
  const verifiedCompletionDate = toDateOnly(completionDate || verifiedIssuedAt);
  const qrResult = await createCertificateQrDataUrl(certificateId);

  const result = await requestSupabase(`/rest/v1/certificates?select=${CERTIFICATE_SELECT}&on_conflict=certificate_id`, {
    method: 'POST',
    accessToken: sessionResult.session.access_token,
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: [{
      certificate_id: certificateId,
      user_id: userId,
      course_id: String(courseId || ''),
      student_name: verifiedStudentName,
      course_name: verifiedCourseName,
      completion_date: verifiedCompletionDate,
      issued_at: verifiedIssuedAt,
    }],
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message || 'The certificate record could not be saved to Supabase.',
    };
  }

  const record = normalizeCertificateRecord(Array.isArray(result.data) ? result.data[0] : null);

  return {
    ok: true,
    record,
    verificationUrl: qrResult.verificationUrl,
    qrCodeDataUrl: qrResult.qrCodeDataUrl,
  };
};

export const fetchIssuedCertificateRecord = async (certificateId) => {
  if (!certificateId) {
    return { ok: false, message: 'Certificate ID is missing.' };
  }

  if (!isSupabaseEnabled()) {
    return {
      ok: false,
      message: 'Supabase is not configured for certificate verification yet.',
    };
  }

  const result = await requestSupabase(`/rest/v1/certificates?certificate_id=eq.${encodeURIComponent(certificateId)}&select=${CERTIFICATE_SELECT}`, {
    headers: {
      Prefer: 'return=representation',
    },
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message || 'The certificate could not be verified.',
    };
  }

  const record = normalizeCertificateRecord(Array.isArray(result.data) ? result.data[0] : null);
  if (!record) {
    return {
      ok: false,
      message: 'No certificate record was found for this ID.',
    };
  }

  return {
    ok: true,
    record,
    verificationUrl: buildCertificateVerificationUrl(record.certificateId),
  };
};

export const deleteIssuedCertificateRecord = async (certificateId) => {
  if (!certificateId) {
    return { ok: true };
  }

  if (!isSupabaseEnabled()) {
    return {
      ok: false,
      message: 'Supabase must be configured to remove issued certificate records.',
    };
  }

  const sessionResult = await getSupabaseSession();
  if (!sessionResult.ok) {
    return {
      ok: false,
      message: 'Please sign in again before resetting the certificate record.',
    };
  }

  const result = await requestSupabase(`/rest/v1/certificates?certificate_id=eq.${encodeURIComponent(certificateId)}`, {
    method: 'DELETE',
    accessToken: sessionResult.session.access_token,
    headers: {
      Prefer: 'return=minimal',
    },
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message || 'The certificate record could not be removed from Supabase.',
    };
  }

  return { ok: true };
};
