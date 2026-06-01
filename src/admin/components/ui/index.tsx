import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@admin/lib/utils';

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const base = 'tw-inline-flex tw-items-center tw-justify-center tw-font-semibold tw-rounded-xl tw-transition-all tw-duration-150 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed';
  const variants = {
    default: 'tw-bg-[#0D1F35] tw-text-white hover:tw-bg-[#0D1F35]/90',
    outline: 'tw-border tw-border-gray-200 tw-bg-white tw-text-gray-700 hover:tw-bg-gray-50',
    ghost: 'tw-bg-transparent tw-text-gray-600 hover:tw-bg-gray-100',
    destructive: 'tw-bg-red-500 tw-text-white hover:tw-bg-red-600',
  };
  const sizes = { sm: 'tw-h-8 tw-px-3 tw-text-xs', default: 'tw-h-10 tw-px-4 tw-text-sm', lg: 'tw-h-12 tw-px-6 tw-text-base' };
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});
Button.displayName = 'Button';

// Input
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('tw-flex tw-h-10 tw-w-full tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-outline-none placeholder:tw-text-gray-400 focus:tw-border-[#0D1F35]/40 focus:tw-ring-2 focus:tw-ring-[#0D1F35]/10 disabled:tw-opacity-50', className)} {...props} />
));
Input.displayName = 'Input';

// Label
export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('tw-text-sm tw-font-medium tw-text-gray-700', className)} {...props} />
));
Label.displayName = 'Label';

// Textarea
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('tw-flex tw-min-h-[80px] tw-w-full tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-outline-none placeholder:tw-text-gray-400 focus:tw-border-[#0D1F35]/40 focus:tw-ring-2 focus:tw-ring-[#0D1F35]/10 disabled:tw-opacity-50 tw-resize-none', className)} {...props} />
));
Textarea.displayName = 'Textarea';

// Badge
export const Badge = ({ className, children }: { className?: string; children: ReactNode }) => (
  <span className={cn('tw-inline-flex tw-items-center tw-rounded-full tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold', className)}>{children}</span>
);
