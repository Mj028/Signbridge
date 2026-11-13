import { useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Cpu, Hand, LayoutGrid, MessagesSquare, Mic, MoreHorizontal, Settings, Sparkles, X } from 'lucide-react';
import { navigate } from '../lib/router';
import { useApp } from '../state/AppContext';
import { DemoBadge, Logo, ModeSwitch } from './ui';
import { GuidedDemo } from './GuidedDemo';

const NAV = [
  { path: '/app', label: 'Home', icon: LayoutGrid },
  { path: '/app/sign-to-speech', label: 'Sign → Speech', icon: Hand },
  { path: '/app/speech-to-sign', label: 'Speech → Sign/Text', icon: Mic },
  { path: '/app/conversation', label: 'Conversation', icon: MessagesSquare },
  { path: '/app/library', label: 'NSL Library', icon: BookOpen },
  { path: '/app/devices', label: 'Device', icon: Cpu },
  { path: '/app/settings', label: 'Settings', icon: Settings },
] as const;

export function Shell({ route, children }: { route: string; children: ReactNode }) {
  const { startDemo, toasts, speech } = useApp();
  const [more, setMore] = useState(false);
  const current = NAV.find((n) => n.path === route) ?? NAV[0];

  useEffect(() => {
    setMore(false);
    speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const go = (p: string) => () => navigate(p);

  return (
    <div className="app">
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <aside className="sidebar" aria-label="Primary">
        <button type="button" className="logo-btn" onClick={go('/')} aria-label="SIGNBRIDGE home page"><Logo /></button>
        <nav>
          {NAV.map((n) => (
            <button key={n.path} type="button" className={`nav-item ${route === n.path ? 'on' : ''}`} onClick={go(n.path)} aria-current={route === n.path ? 'page' : undefined}>
              <n.icon size={18} aria-hidden="true" />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button type="button" className="btn btn-outline btn-block" onClick={startDemo}><Sparkles size={16} /> Guided demo</button>
          <p className="small muted">Phase One prototype. Glove, recognition and NSL content are simulated.</p>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <button type="button" className="logo-btn mobile-only" onClick={go('/')} aria-label="SIGNBRIDGE home page"><Logo size={26} /></button>
          <span className="topbar-title">{current.label}</span>
          <div className="topbar-right">
            <DemoBadge />
            <ModeSwitch size="sm" />
            <button type="button" className="btn btn-outline btn-sm mobile-hide" onClick={startDemo}><Sparkles size={15} /> Guided demo</button>
            <button type="button" className="icon-btn mobile-only" onClick={startDemo} aria-label="Start guided demo"><Sparkles size={18} /></button>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="main">{children}</main>
      </div>

      <nav className="tabbar" aria-label="Primary">
        {NAV.slice(0, 4).map((n) => (
          <button key={n.path} type="button" className={route === n.path ? 'on' : ''} onClick={go(n.path)} aria-current={route === n.path ? 'page' : undefined}>
            <n.icon size={20} aria-hidden="true" />
            <span>{n.label.replace('Speech → Sign/Text', 'Speech').replace('Sign → Speech', 'Sign')}</span>
          </button>
        ))}
        <button type="button" className={NAV.slice(4).some((n) => n.path === route) ? 'on' : ''} onClick={() => setMore((m) => !m)} aria-expanded={more} aria-haspopup="menu">
          <MoreHorizontal size={20} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
      {more && (
        <div className="more-sheet" role="menu" aria-label="More">
          <button type="button" className="icon-btn more-close" onClick={() => setMore(false)} aria-label="Close menu"><X size={18} /></button>
          {NAV.slice(4).map((n) => (
            <button key={n.path} type="button" role="menuitem" className={`nav-item ${route === n.path ? 'on' : ''}`} onClick={go(n.path)}>
              <n.icon size={18} aria-hidden="true" /> {n.label}
            </button>
          ))}
          <button type="button" role="menuitem" className="nav-item" onClick={() => { setMore(false); startDemo(); }}><Sparkles size={18} aria-hidden="true" /> Guided demo</button>
          <button type="button" role="menuitem" className="nav-item" onClick={go('/')}>About SIGNBRIDGE</button>
        </div>
      )}

      <GuidedDemo />
      <div className="toasts" aria-live="polite" role="status">
        {toasts.map((t) => <div key={t.id} className={`toast toast-${t.tone}`}>{t.text}</div>)}
      </div>
    </div>
  );
}
