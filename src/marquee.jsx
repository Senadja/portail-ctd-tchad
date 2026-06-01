/* Marquee infini avec pause au survol + LogoMark placeholders */

import React from 'react';

export function LogoMark({ mark, color, short }) {
  const c = color || "#0E2A5E";
  const marks = {
    diamond: (
      <svg viewBox="0 0 40 40"><polygon points="20,4 36,20 20,36 4,20" fill={c} /><polygon points="20,12 28,20 20,28 12,20" fill="white" /></svg>
    ),
    wave: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><path d="M6 22 Q12 16 20 22 T34 22" stroke="white" strokeWidth="2.5" fill="none" /><path d="M6 28 Q12 22 20 28 T34 28" stroke="white" strokeWidth="2.5" fill="none" opacity="0.7" /></svg>
    ),
    bolt: (
      <svg viewBox="0 0 40 40"><rect x="2" y="2" width="36" height="36" rx="6" fill={c} /><polygon points="22,6 12,22 19,22 17,34 28,18 21,18" fill="white" /></svg>
    ),
    shield: (
      <svg viewBox="0 0 40 40"><path d="M20 4 L34 9 V20 C34 28 28 34 20 36 C12 34 6 28 6 20 V9 Z" fill={c} /><path d="M14 19 L19 24 L27 15" stroke="white" strokeWidth="2.5" fill="none" /></svg>
    ),
    grain: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><path d="M20 8 Q14 16 20 24 Q26 16 20 8" fill="white" /><path d="M20 16 Q14 24 20 32 Q26 24 20 16" fill="white" opacity="0.7" /></svg>
    ),
    path: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><path d="M8 32 L18 8 L22 8 L32 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" /><line x1="14" y1="20" x2="26" y2="20" stroke="white" strokeWidth="2.5" /></svg>
    ),
    signal: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><circle cx="20" cy="20" r="3" fill="white" /><path d="M14 14 Q20 8 26 14" stroke="white" strokeWidth="2" fill="none" /><path d="M10 10 Q20 0 30 10" stroke="white" strokeWidth="2" fill="none" opacity="0.7" /></svg>
    ),
    book: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><rect x="10" y="9" width="20" height="22" rx="1" fill="white" /><line x1="20" y1="9" x2="20" y2="31" stroke={c} strokeWidth="1.5" /></svg>
    ),
    growth: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><polyline points="8,28 16,20 22,24 32,12" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" /><polyline points="27,12 32,12 32,17" stroke="white" strokeWidth="2.5" fill="none" /></svg>
    ),
    sun: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><circle cx="20" cy="20" r="6" fill="white" /><g stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="20" y1="6" x2="20" y2="10" /><line x1="20" y1="30" x2="20" y2="34" /><line x1="6" y1="20" x2="10" y2="20" /><line x1="30" y1="20" x2="34" y2="20" /><line x1="10" y1="10" x2="13" y2="13" /><line x1="27" y1="27" x2="30" y2="30" /><line x1="10" y1="30" x2="13" y2="27" /><line x1="27" y1="13" x2="30" y2="10" /></g></svg>
    ),
    globe: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><circle cx="20" cy="20" r="13" stroke="white" strokeWidth="1.5" fill="none" /><ellipse cx="20" cy="20" rx="13" ry="6" stroke="white" strokeWidth="1.5" fill="none" /><line x1="7" y1="20" x2="33" y2="20" stroke="white" strokeWidth="1.5" /></svg>
    ),
    olive: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><circle cx="20" cy="20" r="3.5" fill="white" /><path d="M8 28 Q12 22 18 22 M32 28 Q28 22 22 22" stroke="white" strokeWidth="1.5" fill="none" /></svg>
    ),
    tower: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><rect x="12" y="10" width="16" height="22" fill="white" /><rect x="15" y="14" width="3" height="3" fill={c} /><rect x="22" y="14" width="3" height="3" fill={c} /><rect x="15" y="20" width="3" height="3" fill={c} /><rect x="22" y="20" width="3" height="3" fill={c} /></svg>
    ),
    scale: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><line x1="20" y1="8" x2="20" y2="32" stroke="white" strokeWidth="2" /><line x1="10" y1="14" x2="30" y2="14" stroke="white" strokeWidth="2" /><circle cx="10" cy="14" r="3" stroke="white" strokeWidth="2" fill="none" /><circle cx="30" cy="14" r="3" stroke="white" strokeWidth="2" fill="none" /></svg>
    ),
    stars: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><g fill="#F5C518"><polygon points="20,10 21,13 24,13 21.5,15 22.5,18 20,16 17.5,18 18.5,15 16,13 19,13" /><polygon points="12,18 12.5,19.5 14,19.5 13,20.5 13.5,22 12,21 10.5,22 11,20.5 10,19.5 11.5,19.5" /><polygon points="28,18 28.5,19.5 30,19.5 29,20.5 29.5,22 28,21 26.5,22 27,20.5 26,19.5 27.5,19.5" /></g></svg>
    ),
    tricolor: (
      <svg viewBox="0 0 40 40"><rect width="13.3" height="40" fill="#0055A4" /><rect x="13.3" width="13.3" height="40" fill="white" /><rect x="26.6" width="13.4" height="40" fill="#EF4135" /></svg>
    ),
    acacia: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><rect x="19" y="22" width="2" height="10" fill="white" /><ellipse cx="20" cy="16" rx="11" ry="7" fill="white" opacity="0.9" /></svg>
    ),
    gear: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><g fill="white"><circle cx="20" cy="20" r="6" /><rect x="18" y="6" width="4" height="6" /><rect x="18" y="28" width="4" height="6" /><rect x="6" y="18" width="6" height="4" /><rect x="28" y="18" width="6" height="4" /></g><circle cx="20" cy="20" r="2.5" fill={c} /></svg>
    ),
    hands: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><path d="M10 22 Q14 16 20 18 Q26 16 30 22 L28 28 Q20 26 12 28 Z" fill="white" /></svg>
    ),
    cross: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><rect x="17" y="9" width="6" height="22" fill="white" /><rect x="9" y="17" width="22" height="6" fill="white" /></svg>
    ),
    circle: (
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><circle cx="20" cy="20" r="11" stroke="white" strokeWidth="2.5" fill="none" /><circle cx="20" cy="20" r="4" fill="white" /></svg>
    ),
    rod: (
      <svg viewBox="0 0 40 40"><rect width="40" height="40" rx="4" fill={c} /><rect x="18.5" y="6" width="3" height="28" fill="white" /><path d="M14 14 Q20 18 26 14 Q24 22 20 22 Q16 22 14 14" fill="white" /></svg>
    ),
  };
  return marks[mark] || (
    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill={c} /><text x="20" y="25" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{short ? short.charAt(0) : "•"}</text></svg>
  );
}

export function Marquee({ items, speed = 50, ariaLabel }) {
  const trackItems = [...items, ...items];
  return (
    <div className="marquee" aria-label={ariaLabel} role="region">
      <div className="marquee-fade marquee-fade-l" aria-hidden="true"></div>
      <div className="marquee-fade marquee-fade-r" aria-hidden="true"></div>
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {trackItems.map((it, i) => (
          <a key={i} href={it.url} target="_blank" rel="noopener noreferrer" className="marquee-item" title={it.name}>
            <div className="logo-mark">
              <LogoMark mark={it.mark} color={it.color} short={it.short} />
            </div>
            <div className="logo-text">
              <div className="logo-short">{it.short}</div>
              <div className="logo-name">{it.name}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
