import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye, Hand, Mic, Trash2, Volume2, Cpu, RotateCcw } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { fmtTime } from '../lib/util';
import { PageHeader, Badge, Segmented } from '../components/ui';
import { DeafScreen } from '../components/DeafScreen';
import { SpeechInput } from '../components/SpeechInput';
import { GestureChips, RecognitionStatus } from '../components/GesturePanels';

type Who = 'hearing' | 'deaf';
type Pane = 'chat' | 'screen';

export function Conversation() {
  const { messages, settings, speakText, setFocusId, clearConversation, loadSample, recog } = useApp();
  const [who, setWho] = useState<Who>('hearing');
  const [pane, setPane] = useState<Pane>('chat');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [messages.length]);

  return (
    <>
      <PageHeader
        title="Two-way conversation"
        sub="Simulate a conversation between a Deaf NSL user and a hearing person, with SIGNBRIDGE in between."
        action={
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadSample}><RotateCcw size={15} /> Sample</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearConversation}><Trash2 size={15} /> Clear</button>
          </div>
        }
      />

      <div className="pane-tabs">
        <Segmented<Pane> label="View" value={pane} onChange={setPane} options={[{ value: 'chat', label: 'Conversation' }, { value: 'screen', label: 'Deaf user’s screen' }]} />
      </div>

      <div className="conv-grid" data-pane={pane}>
        <div className="conv-main">
          <section className="card thread-card" aria-label="Conversation">
            <div className="legend" aria-hidden="true">
              <span><i className="lg hearing" /> Hearing person</span>
              <span><i className="lg deaf" /> Deaf person (glove, simulated)</span>
              <span><i className="lg sys" /> SIGNBRIDGE</span>
            </div>
            <ol className="thread" aria-live="polite">
              {messages.length === 0 && <li className="empty muted">No messages yet. Type, speak or sign below.</li>}
              {messages.map((m) =>
                m.speaker === 'system' ? (
                  <li key={m.id} className="sys-note"><Cpu size={13} aria-hidden="true" /> <span>SIGNBRIDGE: {m.text}</span></li>
                ) : (
                  <li key={m.id} className={`bubble-row ${m.speaker}`}>
                    <div className="bubble">
                      <div className="bubble-meta">
                        <strong>{m.speaker === 'hearing' ? 'Hearing person' : 'Deaf person'}</strong>
                        <Badge tone={m.speaker === 'hearing' ? 'neutral' : 'teal'}>
                          {m.speaker === 'hearing' ? (settings.mode === 'text' ? 'Speech → Text' : 'Speech → Sign') : 'Sign → Speech'}
                        </Badge>
                        {m.sample && <Badge tone="amber">Sample</Badge>}
                        {settings.showTimestamps && <time>{fmtTime(m.ts)}</time>}
                      </div>
                      <p>{m.text}</p>
                      <div className="bubble-actions">
                        <button type="button" className="btn btn-ghost btn-xs" onClick={() => speakText(m.text)}><Volume2 size={14} /> Play</button>
                        {m.speaker === 'hearing' && (
                          <button type="button" className="btn btn-ghost btn-xs" onClick={() => { setFocusId(m.id); setPane('screen'); }}>
                            <Eye size={14} /> Show on Deaf screen
                          </button>
                        )}
                        {m.confidence && <small className="muted">{Math.round(m.confidence * 100)}% confidence</small>}
                      </div>
                    </div>
                  </li>
                ),
              )}
              <div ref={endRef} />
            </ol>
          </section>

          <section className="card composer-card" aria-label="Send a message">
            <Segmented<Who>
              label="Who is speaking"
              value={who}
              onChange={setWho}
              options={[
                { value: 'hearing', label: <><Mic size={15} /> Hearing person</> },
                { value: 'deaf', label: <><Hand size={15} /> Deaf person (glove)</> },
              ]}
            />
            {who === 'hearing' ? (
              <SpeechInput compact />
            ) : (
              <div className="stack">
                <p className="small muted">Pick a demonstration gesture. The simulated glove “signs” it, SIGNBRIDGE recognises it and speaks it.</p>
                <GestureChips />
                {recog.state !== 'idle' && <RecognitionStatus />}
              </div>
            )}
            <button type="button" className="link-btn self-start mobile-only" onClick={() => setPane('screen')}>View Deaf user’s screen <ArrowRight size={14} /></button>
          </section>
        </div>

        <div className="conv-side">
          <DeafScreen />
        </div>
      </div>
    </>
  );
}
