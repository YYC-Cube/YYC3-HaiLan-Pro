import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from '@/app/context/PrivacyContext';

interface PrivacyBlurProps {
  children: React.ReactNode;
  alwaysBlur?: boolean;
}

export function PrivacyBlur({ children, alwaysBlur = false }: PrivacyBlurProps) {
  const { isBlur } = usePrivacy();
  const shouldBlur = alwaysBlur || isBlur;

  return (
    <div className="relative">
      {children}
      {shouldBlur && (
        <div className="absolute inset-0 backdrop-blur-md bg-slate-900/10 flex items-center justify-center rounded-lg animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <EyeOff className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      )}
    </div>
  );
}

interface PrivacyToggleProps {
  /** 尺寸规格：sm 用于紧凑布局，md 为默认 */
  size?: 'sm' | 'md';
  /** 是否隐藏文字标签，仅显示图标 */
  iconOnly?: boolean;
}

export function PrivacyToggle({ size = 'md', iconOnly = false }: PrivacyToggleProps) {
  const { isBlur, setIsBlur } = usePrivacy();

  const sizeClasses = size === 'sm'
    ? 'gap-1.5 px-2.5 py-1'
    : 'gap-2 px-4 py-2';
  const iconClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textClasses = size === 'sm' ? 'text-[10px]' : 'text-sm';

  return (
    <button
      onClick={() => setIsBlur(!isBlur)}
      aria-pressed={isBlur}
      aria-label={isBlur ? '关闭隐私模式' : '开启隐私模式'}
      className={`
        flex items-center rounded-full transition-all
        ${sizeClasses}
        ${isBlur 
          ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }
      `}
    >
      {isBlur ? (
        <>
          <EyeOff className={`${iconClasses} shrink-0`} />
          {!iconOnly && <span className={`${textClasses} font-medium`}>Privacy Mode</span>}
        </>
      ) : (
        <>
          <Eye className={`${iconClasses} shrink-0`} />
          {!iconOnly && <span className={`${textClasses} font-medium`}>Normal Mode</span>}
        </>
      )}
    </button>
  );
}
