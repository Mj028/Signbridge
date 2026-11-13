import { useEffect, useRef } from 'react';
import { Mic, MicOff, Pencil, Send, Square, Volume2, AlertTriangle } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { Badge, Notice } from './ui';

export const SAMPLE_PHRASES = [
  'Good morning. How are you today?',
  'Hello. How are you?',
  'Can you tell me your name?',
  'Nice to meet you.',
  'Please help me',
];

function MicBadge() {
  const { speech } = useApp();
  switch (speech.status) {
    case 'listening': return <Badge tone="red">Listening</Badge>;
    case 'denied': return <Badge tone="amber">Permission denied</Badge>;
    case 'unsupported': return <Badge tone="neutral">Not supported · typing</Badge>;
    case 'error': return <Badge tone="amber">Unavailable</Badge>;
    default: return <Badge tone="neutral">Mic ready</Badge>;
  }
}

/** Hearing person's input: microphone (Web Speech API) with a typed fallback that is always available. */
export function SpeechInput({ compact = false }: { compact?: boolean }) {
  const { speech, sendHearing, draft, setDraft, messages, settings, speakText, update } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const listening = speech.status === 'listening';
  const lastHearing = [...messages].reverse().find((m) => m.speaker === 'hearing');
  const blocked = speech.status === 'denied' || speech.status === 'unsupported' || speech.status === 'error';

  useEffect(() => () => speech.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sendHearing(draft, 'typed');
  };
  const toggle = () => (listening ? speech.stop() : speech.start());
  const live = `${speech.finalText} ${speech.interim}`.trim();

  if (compact) {
    return (
      <div className="composer">
        <form onSubmit={submit} className="composer-row">
          <button type="button" className={`btn btn-icon mic-sm ${listening ? 'btn-danger' : 'btn-ghost'}`} onClick={toggle} disabled={speech.status === 'unsupported'} aria-label={listening ? 'Stop listening' : 'Start listening'} aria-pressed={listening}>
            {listening ? <Square size={17} /> : <Mic size={18} />}
          </button>
          <input ref={inputRef} className="input" value={listening ? live : draft} onChange={(e) => setDraft(e.target.value)} placeholder={listening ? 'Listening…' : 'Type what the hearing person says…'} aria-label="Hearing person’s message" readOnly={listening} />
          <button type="submit" className="btn btn-primary btn-icon" disabled={!draft.trim() || listening} aria-label="Send message">
            <Send size={17} />
            <span className="hide-sm">Send</span>
          </button>
        </form>
        {blocked && speech.message && <p className="small muted composer-note">{speech.message}</p>}
        <div className="chips" aria-label="Sample phrases">
          {SAMPLE_PHRASES.slice(0, 4).map((p) => (
            <button key={p} type="button" className="chip" onClick={() => sendHearing(p, 'sample')}>{p}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="card speech-card" aria-label="Hearing person’s speech input">
      <header className="card-head">
        <h2 className="card-title"><Mic size={18} aria-hidden="true" /> Hearing person · Speech input</h2>
        <MicBadge />
      </header>

      <div className="mic-area">
        <button type="button" className={`mic-btn ${listening ? 'live' : ''}`} onClick={toggle} disabled={speech.status === 'unsupported'} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Start listening'}>
          <span className="mic-ring" aria-hidden="true" />
          {speech.status === 'unsupported' ? <MicOff size={30} /> : listening ? <Square size={26} /> : <Mic size={32} />}
        </button>
        <div className="mic-text">
          <strong>{listening ? 'Listening… speak now' : speech.status === 'unsupported' ? 'Microphone input unavailable' : 'Tap to start listening'}</strong>
          <span className="muted small">
            {listening ? <Waveform /> : `Language: ${settings.speechLang}. Uses your browser’s speech recognition.`}
          </span>
          <div className="row gap-sm">
            <button type="button" className="btn btn-primary btn-sm" onClick={speech.start} disabled={listening || speech.status === 'unsupported'}>Start listening</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={speech.stop} disabled={!listening}>Stop listening</button>
          </div>
        </div>
      </div>

      {blocked && (
        <Notice tone="amber" icon={<AlertTriangle size={18} aria-hidden="true" />}>
          {speech.status === 'unsupported'
            ? 'This browser does not support speech recognition (Chrome, Edge or Safari usually do). You can still use the app by typing below.'
            : speech.message}
        </Notice>
      )}

      <div className="live-box" aria-live="polite" aria-label="Live transcription">
        <span className="eyebrow">Live transcription</span>
        <p className={live ? '' : 'placeholder'}>{live || (listening ? '…' : 'What you say appears here as you speak.')}</p>
      </div>

      <form onSubmit={submit} className="type-row">
        <label htmlFor="typed" className="eyebrow">Or type a message</label>
        <div className="composer-row">
          <input id="typed" ref={inputRef} className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Good morning. How are you today?" disabled={listening} />
          <button type="submit" className="btn btn-primary btn-icon" disabled={!draft.trim() || listening}><Send size={17} /> Send</button>
        </div>
      </form>

      <div className="chips" aria-label="Sample phrases">
        {SAMPLE_PHRASES.map((p) => (
          <button key={p} type="button" className="chip" onClick={() => sendHearing(p, 'sample')}>{p}</button>
        ))}
      </div>

      <label className="check-row">
        <input type="checkbox" checked={settings.autoSendSpeech} onChange={(e) => update({ autoSendSpeech: e.target.checked })} />
        Send automatically when I stop speaking
      </label>

      <div className="processed" aria-live="polite">
        <span className="eyebrow">Processed message</span>
        {lastHearing ? (
          <>
            <p className="processed-text">{lastHearing.text}</p>
            <div className="row gap-sm wrap">
              <Badge tone="teal">{lastHearing.via === 'speech' ? 'From speech' : lastHearing.via === 'typed' ? 'Typed' : 'Sample phrase'}</Badge>
              <Badge tone="navy">Delivered as {settings.mode === 'text' ? 'text' : 'sign (illustrative)'}</Badge>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => speakText(lastHearing.text)}><Volume2 size={15} /> Replay speech</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setDraft(lastHearing.text); inputRef.current?.focus(); }}><Pencil size={15} /> Edit and resend</button>
            </div>
          </>
        ) : (
          <p className="placeholder">Nothing sent yet.</p>
        )}
      </div>
    </section>
  );
}

function Waveform() {
  return (
    <span className="wave" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />)}
    </span>
  );
}
