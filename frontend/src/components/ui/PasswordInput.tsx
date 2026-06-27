import { Eye, EyeOff } from 'lucide-react';
import { type InputHTMLAttributes, useState } from 'react';

import { cn } from '../../lib/utils';
import { Input } from './Input';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  error?: string;
};

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input className={cn('pr-12', className)} type={isVisible ? 'text' : 'password'} {...props} />
      <button
        aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-3 top-10 rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-brand-navy"
        onClick={() => setIsVisible((current) => !current)}
        type="button"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
