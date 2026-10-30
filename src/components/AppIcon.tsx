import React from 'react';

interface AppIconProps {
  appId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ appId, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-16 h-16 text-xl rounded-3xl',
  };

  const currentSize = sizeClasses[size];

  switch (appId) {
    case 'instagram':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        </div>
      );

    case 'whatsapp':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-emerald-500 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.6L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.6 14.39C16.35 14.26 15.12 13.65 14.89 13.57C14.66 13.49 14.49 13.45 14.32 13.7C14.15 13.95 13.67 14.52 13.52 14.69C13.37 14.86 13.22 14.88 12.97 14.76C12.72 14.63 11.92 14.37 10.97 13.52C10.23 12.86 9.73 12.04 9.58 11.79C9.43 11.54 9.56 11.4 9.69 11.27C9.8 11.16 9.94 10.98 10.07 10.83C10.2 10.68 10.24 10.57 10.32 10.4C10.4 10.23 10.36 10.08 10.3 9.96C10.24 9.84 9.75 8.64 9.55 8.14C9.35 7.66 9.15 7.72 9 7.71C8.86 7.7 8.7 7.7 8.53 7.7C8.36 7.7 8.09 7.76 7.86 8.01C7.63 8.26 7 8.85 7 10.05C7 11.25 7.88 12.4 8 12.56C8.12 12.72 9.72 15.19 12.18 16.25C12.77 16.5 13.22 16.65 13.58 16.77C14.17 16.96 14.71 16.93 15.13 16.87C15.6 16.8 16.57 16.28 16.78 15.7C16.99 15.12 16.99 14.62 16.93 14.52C16.87 14.42 16.72 14.36 16.47 14.23L16.6 14.39Z"/>
          </svg>
        </div>
      );

    case 'facebook':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-blue-600 ${currentSize} ${className}`}
        >
          <span className="font-extrabold text-2xl lowercase leading-none -mt-1 font-sans">f</span>
        </div>
      );

    case 'youtube':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-red-600 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      );

    case 'tiktok':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-slate-900 border border-slate-700 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5 text-cyan-400 drop-shadow-[2px_1px_0px_#f43f5e]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.103a2.895 2.895 0 0 1 3.123-4.398v-3.52a6.38 6.38 0 0 0-4.475 1.792A6.34 6.34 0 0 0 4 15.672 6.345 6.345 0 0 0 10.345 22a6.335 6.335 0 0 0 6.334-6.328V9.397a8.21 8.21 0 0 0 4.91 1.602V7.554a4.832 4.832 0 0 1-2-.868z"/>
          </svg>
        </div>
      );

    case 'x_twitter':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-black border border-slate-700 ${currentSize} ${className}`}
        >
          <span className="font-sans font-bold text-lg">𝕏</span>
        </div>
      );

    case 'reddit':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-orange-600 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path fill="#fff" d="M12 4a1.5 1.5 0 0 1 1.5 1.5v1.2l2.3.8a1.8 1.8 0 1 1 1.1 1.8 4.7 4.7 0 0 1 .1 1.1c0 2.5-2.2 4.6-5 4.6s-5-2.1-5-4.6c0-.4 0-.8.1-1.1a1.8 1.8 0 1 1 1.1-1.8l2.9-1v-2.1A1.5 1.5 0 0 1 12 4zm-2.2 7a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm4.4 0a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm-4 3.4a3.3 3.3 0 0 0 3.6 0 .4.4 0 1 0-.4-.7 2.6 2.6 0 0 1-2.8 0 .4.4 0 0 0-.4.7z"/>
          </svg>
        </div>
      );

    case 'chrome':
      return (
        <div
          className={`flex items-center justify-center font-bold shadow-md bg-slate-900 border border-slate-700 relative overflow-hidden ${currentSize} ${className}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-emerald-500 to-blue-500 opacity-90" />
          <div className="relative z-10 w-2/5 h-2/5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2/3 h-2/3 rounded-full bg-blue-600" />
          </div>
        </div>
      );

    case 'samsung_browser':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-indigo-600 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
        </div>
      );

    case 'firefox':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-r from-orange-500 to-rose-600 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
        </div>
      );

    case 'brave':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-r from-amber-600 to-orange-500 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
      );

    case 'gmail':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-rose-600 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
      );

    case 'slack':
      return (
        <div
          className={`flex items-center justify-center font-bold text-white shadow-md bg-purple-900 border border-purple-700 ${currentSize} ${className}`}
        >
          <span className="font-bold text-lg text-emerald-400">#</span>
        </div>
      );

    case 'spotify':
      return (
        <div
          className={`flex items-center justify-center font-bold text-slate-950 shadow-md bg-emerald-500 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.79-1.018-.33.076-.65-.133-.726-.463-.075-.33.134-.65.463-.725 3.808-.813 7.076-.445 9.704 1.162.293.18.386.563.206.837zm1.226-2.723c-.226.367-.707.482-1.074.256-2.69-1.654-6.79-2.133-9.972-1.167-.413.125-.85-.108-.974-.52-.125-.413.108-.85.52-.975 3.633-1.103 8.163-.568 11.244 1.332.367.226.482.707.256 1.074zm.105-2.836C14.693 8.94 9.38 8.766 6.29 9.703c-.495.15-1.02-.128-1.17-.623-.15-.495.128-1.02.623-1.17 3.555-1.079 9.43-.876 13.153 1.335.445.264.59.84.327 1.285-.264.445-.84.59-1.285.326z"/>
          </svg>
        </div>
      );

    case 'netflix':
      return (
        <div
          className={`flex items-center justify-center font-bold text-red-600 shadow-md bg-black border border-red-950 ${currentSize} ${className}`}
        >
          <span className="font-extrabold text-xl font-serif">N</span>
        </div>
      );

    default:
      return (
        <div
          className={`flex items-center justify-center font-bold text-slate-200 shadow-md bg-slate-800 border border-slate-700 ${currentSize} ${className}`}
        >
          <svg className="w-3/5 h-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
          </svg>
        </div>
      );
  }
};
