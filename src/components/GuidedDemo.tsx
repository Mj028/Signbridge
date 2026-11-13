import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Play, Volume2, X, Sparkles, RotateCcw } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { navigate } from '../lib/router';
import { Segmented } from './ui';
import { GestureChips, RecognitionStatus } from './GesturePanels';
import type { Mode } from '../types';

const STEPS = [
  { title: 'Introduce SIGNBRIDGE', route: '/app' },
  { title: 'Choose a communication preference', route: '/app' },
  { title: 'A hearing person speaks', route: '/app/conversation' },
  { title: 'The message is delivered', route: '/app/conversation' },
  { title: 'The Deaf person responds', route: '/app/sign-to-speech' },
  { title: 'Recognition', route: '/app/sign-to-speech' },
  { title: 'Speech output', route: '/app/sign-to-speech' },
  { title: 'The complete conversation', route: '/app/conversation' },
];

const SAMPLE = 'Good morning. How are you today?';

export function GuidedDemo() {
  const { demo, setDemoStep, stopDemo, settings, update, sendHearing, bumpReplay, recog, runGesture, messages, speakText, speaking } = useApp();
  const [min, setMin] = useState(false);
  const step = demo.step;

  useEffect(() => {
    if (demo.active) navigate(STEPS[step].route);
  }, [demo.active, step]);

  if (!demo.active) return null;
  const lastDeaf = [...messages].reverse().find((m) => m.speaker === 'deaf');
  const last = step === STEPS.length - 1;

  return (
    <aside className={`demo-panel ${min ? 'min' : ''}`} aria-label="Guided demonstration">
      <header className="demo-head">
        <span className="demo-step">
          <Sparkles size={15} aria-hidden="true" /> Step {step + 1} of {STEPS.length}
        </span>
        <div className="row gap-sm">
          <button type="button" className="icon-btn" onClick={() => setMin((m) => !m)} aria-label={min ? 'Expand guide' : 'Minimise guide'} aria-expanded={!min}>
            <ChevronDown size={18} style={{ transform: min ? 'rotate(180deg)' : undefined }} />
          </button>
          <button type="button" className="icon-btn" onClick={stopDemo} aria-label="Exit guided demo"><X size={18} /></button>
        </div>
      </header>
      {!min && (
        <div className="demo-body">
          <div className="demo-dots" aria-hidden="true">
            {STEPS.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
          </div>
          <h2>{STEPS[step].title}</h2>

          {step === 0 && (
            <>
              <p>Deaf and hearing people often share no common language. A hearing person may not know Nigerian Sign Language, and written notes don’t suit everyone.</p>
              <p>SIGNBRIDGE turns <b>sign into speech</b> through a smart glove, and <b>speech into text or sign</b> on the phone.</p>
              <p className="small muted">Everything in this tour is simulated: no real glove, model or validated NSL content is connected.</p>
            </>
          )}
          {step === 1 && (
            <>
              <p>How does the Deaf user prefer to receive messages? You can change this any time.</p>
              <Segmented<Mode>
                label="Communication preference"
                value={settings.mode}
                onChange={(mode) => update({ mode })}
                options={[
                  { value: 'text', label: 'Text Mode · I can read' },
                  { value: 'sign', label: 'Sign Mode · sign language' },
                ]}
              />
            </>
          )}
          {step === 2 && (
            <>
              <p>The hearing person speaks. Try the sample, use the microphone, or type your own in the conversation panel.</p>
              <button type="button" className="btn btn-primary" onClick={() => sendHearing(SAMPLE, 'sample')}>
                <Play size={16} /> Say: “{SAMPLE}”
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <p>
                {settings.mode === 'text'
                  ? 'In Text Mode the message appears as large, high-contrast text on the Deaf user’s screen.'
                  : 'In Sign Mode the message is looked up in the sign library and shown by the illustrative avatar. Phrases with no content show an honest fallback, never an invented sign.'}
              </p>
              <div className="row gap-sm wrap">
                <button type="button" className="btn btn-ghost" onClick={() => sendHearing(SAMPLE, 'sample')}>Send the sample again</button>
                {settings.mode === 'sign' && <button type="button" className="btn btn-ghost" onClick={bumpReplay}><RotateCcw size={15} /> Replay animation</button>}
              </div>
              <p className="small muted">Tip: switch preference with the Text / Sign toggle at the top. The Deaf screen updates instantly.</p>
            </>
          )}
          {step === 4 && (
            <>
              <p>The Deaf person replies by signing with the glove. Pick a demonstration gesture to simulate it.</p>
              <GestureChips />
            </>
          )}
          {step === 5 && (
            <>
              <p className="small muted">Watch the flex sensors and IMU readings change, then the recognised message and confidence.</p>
              <RecognitionStatus />
              <div className="row gap-sm wrap">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => runGesture(recog.gestureId ?? 'i-am-fine', { forceUncertain: true })}>Show an uncertain result</button>
              </div>
            </>
          )}
          {step === 6 && (
            <>
              <p>The recognised English message is spoken aloud using your browser’s text-to-speech.</p>
              <button type="button" className="btn btn-primary" disabled={!lastDeaf} onClick={() => lastDeaf && speakText(lastDeaf.text)}>
                <Volume2 size={16} /> {speaking ? 'Speaking…' : lastDeaf ? `Play “${lastDeaf.text}”` : 'Run a gesture first (step 5)'}
              </button>
            </>
          )}
          {step === 7 && (
            <>
              <p>Both directions are now in one conversation: speech converted for the Deaf user, and signs converted to speech for the hearing user.</p>
              <p className="small muted">Keep going: type, speak or sign more messages, or explore the NSL Library, Device and Settings pages.</p>
            </>
          )}

          <footer className="demo-foot">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDemoStep(Math.max(0, step - 1))} disabled={step === 0}><ChevronLeft size={16} /> Back</button>
            {last ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={stopDemo}>Finish</button>
            ) : (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setDemoStep(step + 1)}>Next <ChevronRight size={16} /></button>
            )}
          </footer>
        </div>
      )}
    </aside>
  );
}
