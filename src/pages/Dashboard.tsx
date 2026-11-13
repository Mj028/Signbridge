import { ArrowRight, Hand, Mic, Plug, Radio, Captions, FlaskConical, MessagesSquare } from 'lucide-react';
import { navigate } from '../lib/router';
import { useApp } from '../state/AppContext';
import { fmtTime } from '../lib/util';
import { Badge, Card, Dot, ModeSwitch, PageHeader } from '../components/ui';
import { GestureChips, RecognitionStatus } from '../components/GesturePanels';
import { SpeechInput } from '../components/SpeechInput';

export function Dashboard() {
  const { glove, settings, speech, messages, loadSample, connectGlove } = useApp();
  const talk = messages.filter((m) => m.speaker !== 'system').slice(-5).reverse();
  const mic =
    speech.status === 'listening' ? ['Listening', 'red'] :
    speech.status === 'unsupported' ? ['Not supported · typing', 'grey'] :
    speech.status === 'denied' ? ['Permission denied', 'amber'] :
    speech.status === 'error' ? ['Unavailable', 'amber'] : ['Ready', 'green'];

  return (
    <>
      <PageHeader title="Communication workspace" sub="Two directions, one conversation. Everything here runs in Demo Mode." />

      <div className="demo-banner" role="note">
        <FlaskConical size={18} aria-hidden="true" />
        <span><b>Demo Mode.</b> The glove, sensor data and recognition are simulated; sign animations are illustrative and not validated NSL.</span>
      </div>

      <div className="tiles">
        <div className="tile">
          <span className="eyebrow"><Plug size={14} aria-hidden="true" /> Glove</span>
          <strong><Dot tone={glove.status === 'connected' ? 'green' : glove.status === 'connecting' ? 'amber' : 'grey'} />{glove.status === 'connected' ? `Connected · ${glove.battery}%` : glove.status === 'connecting' ? 'Connecting…' : 'Disconnected'}</strong>
          <button type="button" className="link-btn" onClick={() => (glove.status === 'disconnected' ? void connectGlove() : navigate('/app/devices'))}>
            {glove.status === 'disconnected' ? 'Connect (simulated)' : 'Device details'}
          </button>
        </div>
        <div className="tile">
          <span className="eyebrow"><Radio size={14} aria-hidden="true" /> Communication preference</span>
          <strong>{settings.mode === 'text' ? <><Captions size={16} aria-hidden="true" /> Text Mode</> : <><Hand size={16} aria-hidden="true" /> Sign Mode</>}</strong>
          <ModeSwitch size="sm" />
        </div>
        <div className="tile">
          <span className="eyebrow"><Mic size={14} aria-hidden="true" /> Microphone</span>
          <strong><Dot tone={mic[1] as 'green'} />{mic[0]}</strong>
          <button type="button" className="link-btn" onClick={() => navigate('/app/speech-to-sign')}>Open speech input</button>
        </div>
      </div>

      <div className="grid-2">
        <Card
          title="Sign to Speech"
          icon={<Hand size={18} aria-hidden="true" />}
          action={<Badge tone="amber">Simulated</Badge>}
          className="panel-primary"
        >
          <p className="muted small">The Deaf user signs with the glove; SIGNBRIDGE recognises the gesture and speaks it.</p>
          <RecognitionStatus />
          <span className="eyebrow">Try a demonstration gesture</span>
          <GestureChips />
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => navigate('/app/sign-to-speech')}>Open full workspace <ArrowRight size={15} /></button>
        </Card>

        <Card
          title="Speech to Sign / Text"
          icon={<Mic size={18} aria-hidden="true" />}
          action={<Badge tone="teal">{settings.mode === 'text' ? 'Text Mode' : 'Sign Mode'}</Badge>}
          className="panel-primary"
        >
          <p className="muted small">
            The hearing person speaks or types; the Deaf user receives it as {settings.mode === 'text' ? 'large text' : 'an illustrative sign animation'}.
          </p>
          <SpeechInput compact />
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => navigate('/app/speech-to-sign')}>Open full workspace <ArrowRight size={15} /></button>
        </Card>
      </div>

      <Card
        title="Recent conversation activity"
        icon={<MessagesSquare size={18} aria-hidden="true" />}
        action={<button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/app/conversation')}>Open conversation</button>}
      >
        {talk.length === 0 ? (
          <div className="empty">
            <p className="muted">No messages yet.</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadSample}>Load sample conversation</button>
          </div>
        ) : (
          <ul className="activity">
            {talk.map((m) => (
              <li key={m.id}>
                <span className={`who who-${m.speaker}`}>{m.speaker === 'hearing' ? 'Hearing' : 'Deaf (glove)'}</span>
                <span className="act-text">{m.text}</span>
                <time>{fmtTime(m.ts)}</time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
