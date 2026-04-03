import logoImage from '../assets/logo.png';

const sizeMap = {
  sm: {
    image: 'h-10 w-10',
    title: 'text-[11px] sm:text-sm md:text-base tracking-[0.12em] sm:tracking-[0.18em]',
    subtitle: 'text-[10px]',
    gap: 'gap-2.5',
  },
  md: {
    image: 'h-12 w-12',
    title: 'text-sm md:text-base tracking-[0.16em]',
    subtitle: 'text-[10px] md:text-[11px]',
    gap: 'gap-3',
  },
  lg: {
    image: 'h-16 w-16 md:h-20 md:w-20',
    title: 'text-xl md:text-2xl tracking-[0.14em]',
    subtitle: 'text-xs md:text-sm',
    gap: 'gap-4',
  },
};

export default function AcademyLogo({
  size = 'sm',
  showWordmark = true,
  showArabic = true,
  className = '',
  imageClassName = '',
  textAlign = 'left',
}) {
  const styles = sizeMap[size] || sizeMap.sm;

  return (
    <div className={`flex items-center ${styles.gap} ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-gold-400/10 blur-md" />
        <img
          src={logoImage}
          alt="Ali Nawaz Academy logo"
          className={`relative object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] ${styles.image} ${imageClassName}`}
        />
      </div>

      {showWordmark && (
        <div className={textAlign === 'center' ? 'text-center' : 'text-left'}>
          <div className={`font-cinzel font-bold text-gold-400 leading-none ${styles.title}`}>
            ALI NAWAZ ACADEMY
          </div>
          {showArabic && (
            <div className={`font-crimson text-emerald-300/75 leading-none mt-1 ${styles.subtitle}`}>
              أكاديمية علي نواز
            </div>
          )}
        </div>
      )}
    </div>
  );
}
