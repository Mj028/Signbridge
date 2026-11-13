import { useMemo } from 'react';
import { Captions, Hand, Minus, Plus } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { mapMessageToSigns } from '../lib/signMapping';
import { fmtTime } from '../lib/util';
import { ModeSwitch } from './ui';
import { SignStage } from './SignAvatar';

/** What the Deaf user sees. Re-renders instantly when the communication preference changes. */
export function DeafScreen({ showSwitch = true }: { showSwitch?: boolean }) {
  const { settings, update, messages, focusId } = useApp();
  const talk = messages.filter((m) => m.speaker !== 'system');
  const hearing = talk.filter((m) => m.speaker === 'hearing');
  const focused = (focusId && hearing.find((m) => m.id === focusId)) || hearing[hearing.length - 1];
  const items = useMemo(() => (focused ? mapMessageToSigns(focused.text) : []), [focused?.id, focused?.text]);
  const earlier = talk.filter((m) => m.id !== focused?.id).slice(-4);

  return (
    <section className="deaf-screen card" aria-label="Deaf user’s screen">
      <header className="card-head">
        <h2 className="card-title">
          {settings.mode === 'text' ? <Captions size={18} aria-hidden="true" /> : <Hand size={18} aria-hidden="true" />}
          Deaf user’s screen · {settings.mode === 'text' ? 'Text Mode' : 'Sign Mode'}
        </h2>
        {showSwitch && <ModeSwitch size="sm" />}
      </header>

      {settings.mode === 'text' ? (
        <div className="text-view">
          <div className="text-tools" role="group" aria-label="Text size">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => update({ textScale: Math.max(1, settings.textScale - 1) })} aria-label="Smaller text" disabled={settings.textScale <= 1}>
              <Minus size={15} />
            </button>
            <span className="small muted">Text size {settings.textScale}/5</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => update({ textScale: Math.min(5, settings.textScale + 1) })} aria-label="Larger text" disabled={settings.textScale >= 5}>
              <Plus size={15} />
            </button>
          </div>
          <div className="big-message" aria-live="polite" aria-atomic="true">
            {focused ? (
              <>
                <span className="eyebrow">Hearing person{settings.showTimestamps && ` · ${fmtTime(focused.ts)}`}</span>
                <p>{focused.text}</p>
              </>
            ) : (
              <p className="placeholder">Waiting for a message. Speak or type on the hearing person’s side.</p>
            )}
          </div>
          {earlier.length > 0 && (
            <ul className="mini-history" aria-label="Earlier messages">
              {earlier.map((m) => (
                <li key={m.id} className={m.speaker}>
                  <span className="who">{m.speaker === 'hearing' ? 'Hearing' : 'You (glove)'}</span>
                  <span className="txt">{m.text}</span>
                  {settings.showTimestamps && <time>{fmtTime(m.ts)}</time>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <SignStage items={items} text={focused?.text ?? ''} />
      )}
    </section>
  );
}
