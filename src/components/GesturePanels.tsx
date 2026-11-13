import { AlertTriangle, Battery, BatteryLow, Bluetooth, BluetoothConnected, BluetoothOff, Check, Loader2, Plug, PlugZap, RefreshCw, ScanLine, Volume2 } from 'lucide-react';
import { GESTURES, findEntry, STATUS_LABELS } from '../data/library';
import { CONFIDENCE_THRESHOLD } from '../lib/integration';
import { ago, fmtTime, useNow } from '../lib/util';
import { useApp } from '../state/AppContext';
import { Badge, Card, Dot } from './ui';

/** Compact gesture buttons shared by several pages. */
export function GestureChips({ cols = false }: { cols?: boolean }) {
  const { runGesture, recog } = useApp();
  const busy = recog.state === 'processing';
  return (
    <div className={cols ? 'gesture-grid' : 'chips'} role="group" aria-label="Demonstration gestures">
      {GESTURES.map((g) => (
        <button
          key={g.id}
          type="button"
          className={`${cols ? 'gesture-btn' : 'chip'} ${recog.gestureId === g.id ? 'on' : ''}`}
          onClick={() => runGesture(g.id)}
          disabled={busy}
        >
          {g.phrase.replace('?', '')}
          {cols && <small>Demo sample</small>}
        </button>
      ))}
    </div>
  );
}

const STAGES = ['Reading flex sensors', 'Reading IMU motion', 'Matching demo templates'];

export function RecognitionStatus({ large = false }: { large?: boolean }) {
  const { recog, runGesture, speakText, speaking, resetRecog } = useApp();
  const entry = recog.gestureId ? findEntry(recog.gestureId) : undefined;
  const pct = Math.round(recog.confidence * 100);

  return (
    <div className={`recog recog-${recog.state} ${large ? 'large' : ''}`} aria-live="polite">
      <div className="recog-head">
        <span className="recog-icon" aria-hidden="true">
          {recog.state === 'idle' && <ScanLine size={22} />}
          {recog.state === 'processing' && <Loader2 size={22} className="spin" />}
          {recog.state === 'recognised' && <Check size={22} />}
          {recog.state === 'uncertain' && <AlertTriangle size={22} />}
        </span>
        <div>
          <strong>
            {recog.state === 'idle' && 'Waiting for gesture'}
            {recog.state === 'processing' && 'Processing'}
            {recog.state === 'recognised' && 'Gesture recognised'}
            {recog.state === 'uncertain' && 'Recognition uncertain'}
          </strong>
          <span className="small muted">
            {recog.state === 'idle' && 'Choose a demonstration gesture to simulate the glove.'}
            {recog.state === 'processing' && `${STAGES[Math.min(recog.stage, 2)]}…`}
            {recog.state === 'recognised' && 'Simulated result · not from a real glove or model'}
            {recog.state === 'uncertain' && 'Not confident enough to translate. Nothing was spoken.'}
          </span>
        </div>
      </div>

      {recog.state === 'processing' && <div className="scan" aria-hidden="true"><span /></div>}

      {(recog.state === 'recognised' || recog.state === 'uncertain') && entry && (
        <>
          <dl className="recog-facts">
            <div>
              <dt>{recog.state === 'uncertain' ? 'Best guess (not sent)' : 'Detected gesture'}</dt>
              <dd>{entry.phrase.replace('?', '')}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>
                <span className="conf" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Confidence">
                  <span className={`conf-fill ${recog.state === 'uncertain' ? 'low' : ''}`} style={{ width: `${pct}%` }} />
                  <span className="conf-mark" style={{ left: `${CONFIDENCE_THRESHOLD * 100}%` }} title="Minimum confidence to accept" />
                </span>
                <b>{pct}%</b>
              </dd>
            </div>
          </dl>
          {recog.state === 'recognised' ? (
            <div className="recog-message">
              <span className="eyebrow">Recognised message</span>
              <p>{recog.message}</p>
              <div className="row gap-sm wrap">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => speakText(recog.message)}>
                  <Volume2 size={15} /> {speaking ? 'Speaking…' : 'Replay audio'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={resetRecog}>Clear</button>
              </div>
            </div>
          ) : (
            <div className="row gap-sm wrap">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => runGesture(entry.id)}>
                <RefreshCw size={15} /> Retry gesture
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetRecog}>Dismiss</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function RecognitionHistory() {
  const { history } = useApp();
  return (
    <ul className="history" aria-label="Recognition history">
      {history.length === 0 && <li className="placeholder">No recognitions yet.</li>}
      {history.map((h) => (
        <li key={h.id}>
          <span className="h-main">
            <strong>{h.phrase.replace('?', '')}</strong>
            <small>{fmtTime(h.ts)}</small>
          </span>
          <span className="h-side">
            <b>{Math.round(h.confidence * 100)}%</b>
            <Badge tone={h.outcome === 'recognised' ? 'green' : 'amber'}>{h.outcome === 'recognised' ? 'Recognised' : 'Uncertain'}</Badge>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function GloveConnection() {
  const { glove, connectGlove, disconnectGlove } = useApp();
  const now = useNow(1000);
  const s = glove.status;
  const BtIcon = s === 'connected' ? BluetoothConnected : s === 'connecting' ? Bluetooth : BluetoothOff;
  return (
    <Card
      title="SIGNBRIDGE Smart Glove"
      icon={<Plug size={18} aria-hidden="true" />}
      action={<Badge tone="amber">Demo Mode · simulated</Badge>}
    >
      <div className="conn-grid">
        <div className="conn-item">
          <span className="eyebrow">Connection</span>
          <span className="conn-val" aria-live="polite">
            <Dot tone={s === 'connected' ? 'green' : s === 'connecting' ? 'amber' : 'grey'} />
            {s === 'connected' ? 'Connected' : s === 'connecting' ? 'Connecting…' : 'Disconnected'}
          </span>
        </div>
        <div className="conn-item">
          <span className="eyebrow">Bluetooth</span>
          <span className={`conn-val bt ${s}`}><BtIcon size={17} aria-hidden="true" /> {s === 'connected' ? 'BLE link (simulated)' : s === 'connecting' ? 'Pairing…' : 'Off'}</span>
        </div>
        <div className="conn-item">
          <span className="eyebrow">Battery</span>
          <span className="conn-val">
            {s === 'connected' ? <Battery size={17} aria-hidden="true" /> : <BatteryLow size={17} aria-hidden="true" />}
            {s === 'connected' ? `${glove.battery}%` : '—'}
          </span>
        </div>
        <div className="conn-item">
          <span className="eyebrow">Last sync</span>
          <span className="conn-val">{s === 'connected' ? ago(glove.lastSync, now) : glove.lastSync ? ago(glove.lastSync, now) : '—'}</span>
        </div>
      </div>
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void connectGlove()} disabled={s !== 'disconnected'}>
          {s === 'connecting' ? <Loader2 size={15} className="spin" /> : <PlugZap size={15} />} Connect
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void disconnectGlove()} disabled={s !== 'connected'}>Disconnect</button>
      </div>
      <p className="small muted">No Bluetooth radio is used. This simulates the pairing flow so the app can be demonstrated without hardware.</p>
    </Card>
  );
}

export function StatusLabel({ id }: { id: string }) {
  const e = findEntry(id);
  return e ? <Badge tone="amber">{STATUS_LABELS[e.status]}</Badge> : null;
}
