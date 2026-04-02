export const COURSE_PAYMENT_DETAILS = {
  accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME || 'Ishfaq Dar',
  upiId: import.meta.env.VITE_PAYMENT_UPI_ID || 'mohdashfaq1416-1@okicici',
  note: 'Scan the generated QR for this student account.',
  methodLabel: 'UPI Payment',
  currency: import.meta.env.VITE_PAYMENT_CURRENCY || 'INR',
};
