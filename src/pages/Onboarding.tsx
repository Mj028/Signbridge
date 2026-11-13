import { useState } from 'react';
import { ArrowLeft, ArrowRight, Captions, Check, Hand, Sparkles } from 'lucide-react';
import { navigate } from '../lib/router';
import { useApp } from '../state/AppContext';
import { Logo, Notice } from '../components/ui';
import type { Mode } from '../types';

export function Onboarding() {
  const { settings, update, startDemo } = useApp();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>(settings.mode);

  const finish = (guided: boolean) => {
    update({ mode, onboarded: true });
    navigate('/app');
    if (guided) startDemo();
  };

  const options: { value: Mode; label: string; desc: string; icon: typeof Hand; tag: string }[] = [
    { value: 'text', label: 'I can read', desc: 'Receive spoken messages as written text on your screen.', icon: Captions, tag: 'Text Mode' },
    { value: 'sign', label: 'I communicate through sign language', desc: 'Receive messages through visual Nigerian Sign Language representations.', icon: Hand, tag: 'Sign Mode' },
  ];

  return (
    <div className="onb">
      <header className="onb-top wrap">
        <button type="button" className="logo-btn" onClick={() => navigate('/')} aria-label="Back to the SIGNBRIDGE home page"><Logo /></button>
        <span className="small muted" aria-live="polite">Step {step + 1} of 2</span>
      </header>

      <main className="onb-card">
        <div className="demo-dots" aria-hidden="true"><i className="on" /><i className={step === 1 ? 'on' : ''} /></div>

        {step === 0 ? (
          <>
            <h1>Welcome to SIGNBRIDGE</h1>
            <p className="lead">A two-way bridge between sign language and speech.</p>
            <ul className="onb-points">
              <li><Hand size={20} aria-hidden="true" /><span><b>Sign to speech.</b> A smart glove’s gestures become spoken English.</span></li>
              <li><Captions size={20} aria-hidden="true" /><span><b>Speech to text or sign.</b> A hearing person’s words reach the Deaf user in the way they prefer.</span></li>
            </ul>
            <Notice tone="teal" icon={<Sparkles size={18} aria-hidden="true" />}>
              <b>Demo Mode.</b> This Phase One prototype simulates the glove and recognition so you can try everything without hardware. No account is needed.
            </Notice>
            <div className="onb-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(1)}>Continue <ArrowRight size={18} /></button>
            </div>
          </>
        ) : (
          <>
            <h1>How do you prefer to receive messages?</h1>
            <p className="lead">You can change this later in Settings, without repeating this step.</p>
            <div className="pref-grid" role="radiogroup" aria-label="Communication preference">
              {options.map((o) => (
                <button key={o.value} type="button" role="radio" aria-checked={mode === o.value} className={`pref ${mode === o.value ? 'on' : ''}`} onClick={() => setMode(o.value)}>
                  <span className="pref-icon"><o.icon size={26} aria-hidden="true" /></span>
                  <span className="pref-tag">{o.tag}</span>
                  <strong>{o.label}</strong>
                  <span>{o.desc}</span>
                  <span className="pref-check" aria-hidden="true"><Check size={16} /></span>
                </button>
              ))}
            </div>
            <div className="onb-actions between">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
              <div className="row gap-sm wrap">
                <button type="button" className="btn btn-outline" onClick={() => finish(true)}>Take the guided demo</button>
                <button type="button" className="btn btn-primary" onClick={() => finish(false)}>Continue without an account <ArrowRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
