import logoPortalHormezinda from '../../assets/logo/logoportalhormezinda.png';
import { cn } from '../../lib/utils';

type SchoolLogoProps = {
  className?: string;
};

export function SchoolLogo({ className }: SchoolLogoProps) {
  return (
    <img
      alt="Portal Hormezinda"
      className={cn('h-full w-full object-contain', className)}
      src={logoPortalHormezinda}
    />
  );
}
