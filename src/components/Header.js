'use client';

export default function Header({ title, subtitle, children }) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="header-title">{title}</div>
          {subtitle && <div className="header-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="header-right">
        {children}
      </div>
    </header>
  );
}
