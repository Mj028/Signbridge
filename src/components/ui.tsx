import type { ReactNode } from 'react';
import { Captions, FlaskConical, Hand } from 'lucide-react';
import { useApp } from '../state/AppContext';
import type { Mode } from '../types';

export function Logo({ light = false, size = 30 }: { light?: boolean; size?: number }) {
  return (
    <span className="logo" aria-label="SIGNBRIDGE">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? '#fff' : '#0B1F3A'} />
        <path d="M6 21 Q16 7 26 21" fill="none" stroke="#14B8A6" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M5 22.5 H27" stroke={light ? '#0B1F3A' : '#fff'} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M8.5 21.5 V25.5 M23.5 21.5 V25.5" stroke={light ? '#0B1F3A' : '#fff'} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="logo-word" style={{ color: light ? '#fff' : undefined }}>
        SIGN<span>BRIDGE</span>
      </span>
    </span>
  );
}

export type Tone = 'neutral' | 'teal' | 'amber' | 'navy' | 'green' | 'red';
export function Badge({ tone = 'neutral', children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export function Dot({ tone }: { tone: 'green' | 'amber' | 'red' | 'grey' | 'teal' }) {
  return <span className={`dot dot-${tone}`} aria-hidden="true" />;
}

export function Card({
  title,
  icon,
  action,
  children,
  className = '',
  id,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`card ${className}`} id={id}>
      {(title || action) && (
        <header className="card-head">
          <h2 className="card-title">
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = 'md',
}: {
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={`seg seg-${size}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={o.disabled}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="toggle-row">
      <span>
        <span className="toggle-label">{label}</span>
        {hint && <span className="toggle-hint">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

export function DemoBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="demo-badge"
      title="Everything here is simulated: no real glove, sensor data, recognition model or validated NSL content is connected."
    >
      <FlaskConical size={14} aria-hidden="true" />
      {compact ? 'Demo' : 'Demo Mode'}
    </span>
  );
}

export function ModeSwitch({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { settings, update } = useApp();
  return (
    <Segmented<Mode>
      size={size}
      label="Deaf user’s communication preference"
      value={settings.mode}
      onChange={(mode) => update({ mode })}
      options={[
        { value: 'text', label: <><Captions size={15} aria-hidden="true" /> Text</> },
        { value: 'sign', label: <><Hand size={15} aria-hidden="true" /> Sign</> },
      ]}
    />
  );
}

export function Notice({
  tone = 'amber',
  icon,
  children,
}: {
  tone?: 'amber' | 'teal' | 'red' | 'neutral';
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`notice notice-${tone}`} role="note">
      {icon}
      <div>{children}</div>
    </div>
  );
}
