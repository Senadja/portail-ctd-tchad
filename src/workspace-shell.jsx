import React, { useState } from 'react';
import { Icon } from './icons';

export function WorkspaceShell({ go, role, sections, current, onNav, user, accent, children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`ws-layout ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="ws-sidebar" data-accent={accent}>
        <a href="#" className="ws-brand" onClick={(e) => { e.preventDefault(); go('home'); }}>
          <img src="/assets/armoiries-tchad.png" alt="" />
          <div>
            <div className="ws-brand-name">{role}</div>
            <div className="ws-brand-sub">Espace privé</div>
          </div>
        </a>
        <nav className="ws-nav" aria-label="Navigation espace">
          {sections.map(s => (
            <React.Fragment key={s.id}>
              {s.heading && <div className="ws-nav-heading">{s.heading}</div>}
              {s.items.map(it => (
                <a key={it.id} href="#"
                   onClick={(e) => { e.preventDefault(); onNav(it.id); }}
                   className={current === it.id ? 'active' : ''}>
                  <span className="ws-nav-icon" aria-hidden="true">{it.icon}</span>
                  <span className="ws-nav-label">{it.label}</span>
                  {it.badge && <span className="ws-nav-badge">{it.badge}</span>}
                </a>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div className="ws-sidebar-foot">
          <a href="#" onClick={(e) => { e.preventDefault(); go('home'); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Retour au portail public
          </a>
        </div>
      </aside>
      <div className="ws-main">
        <header className="ws-topbar">
          <button className="ws-collapse" onClick={() => setCollapsed(c => !c)} aria-label="Replier">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
          </button>
          <div className="ws-search">
            <Icon.search style={{ width: 16, height: 16, color: 'var(--ink-mute)' }} />
            <input type="search" placeholder="Rechercher dans l'espace…" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="ws-topbar-actions">
            <button className="ws-icon-btn" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16z" />
                <path d="M10 21a2 2 0 0 0 4 0" />
              </svg>
              <span className="ws-icon-dot"></span>
            </button>
            <button className="ws-icon-btn" aria-label="Aide">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 3.5" />
                <line x1="12" y1="16" x2="12" y2="16.5" />
              </svg>
            </button>
            <div className="ws-user">
              <div className="ws-user-avatar">{user.initials}</div>
              <div className="ws-user-meta">
                <div className="ws-user-name">{user.name}</div>
                <div className="ws-user-role">{user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="ws-content">{children}</div>
      </div>
    </div>
  );
}
