import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Info } from 'lucide-react';
import { interpolate, REST, type Pose } from '../data/motions';
import { STATUS_LABELS } from '../data/library';
import { itemsKey, type SignItem } from '../lib/signMapping';
import { useApp } from '../state/AppContext';
import { mmss } from '../lib/util';
import { Badge, Notice } from './ui';

const SKIN = '#9A6240';
const SLEEVE = '#17304F';

function Arm({ side, a1, a2, open }: { side: 'L' | 'R'; a1: number; a2: number; open: number }) {
  const sign = side === 'L' ? 1 : -1;
  const x = side === 'L' ? 150 : 250;
  const fingerAngles = [-36, -18, 0, 18, 36];
  const len = 6 + open * 15;
  return (
    <g transform={`translate(${x} 254) rotate(${sign * a1})`}>
      <rect x="-14" y="-4" width="28" height="88" rx="14" fill={SLEEVE} />
      <g transform={`translate(0 80) rotate(${sign * a2})`}>
        <rect x="-10" y="0" width="20" height="78" rx="10" fill={SKIN} />
        <g transform="translate(0 84)">
          <circle r="13" fill={SKIN} />
          {fingerAngles.map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={Math.sin(rad) * 8}
                y1={Math.cos(rad) * 8}
                x2={Math.sin(rad) * (8 + len)}
                y2={Math.cos(rad) * (8 + len)}
                stroke={SKIN}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </g>
    </g>
  );
}

export function SignAvatar({ pose }: { pose: Pose }) {
  return (
    <svg viewBox="0 0 400 440" className="avatar-svg" role="img" aria-label="Illustrative animated avatar. Placeholder motion, not validated Nigerian Sign Language.">
      <path d="M104 440 V306 Q104 246 168 238 H232 Q296 246 296 306 V440 Z" fill="#0B1F3A" />
      <path d="M172 238 Q200 262 228 238" fill="none" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />
      <rect x="184" y="192" width="32" height="50" rx="12" fill="#85532F" />
      <Arm side="L" a1={pose.L[0]} a2={pose.L[1]} open={pose.hl} />
      <Arm side="R" a1={pose.R[0]} a2={pose.R[1]} open={pose.hr} />
      <ellipse cx="200" cy="148" rx="46" ry="54" fill={SKIN} />
      <path d="M154 140 Q154 92 200 92 Q246 92 246 140 Q232 118 200 118 Q168 118 154 140Z" fill="#171717" />
      <circle cx="184" cy="150" r="4.2" fill="#171717" />
      <circle cx="216" cy="150" r="4.2" fill="#171717" />
      <path d="M176 138 Q184 133 192 138 M208 138 Q216 133 224 138" fill="none" stroke="#171717" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M187 176 Q200 186 213 176" fill="none" stroke="#5B2F1A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface Timeline {
  starts: number[];
  total: number;
}
const buildTimeline = (items: SignItem[]): Timeline => {
  let t = 0;
  const starts = items.map((i) => {
    const s = t;
    t += i.duration;
    return s;
  });
  return { starts, total: t };
};

/**
 * Animation workspace: avatar + transport controls + sequence + transcription.
 * Pass `items` from `mapMessageToSigns`. Everything shown is illustrative.
 */
export function SignStage({
  items,
  text,
  compact = false,
  autoplay,
  loop,
}: {
  items: SignItem[];
  text: string;
  compact?: boolean;
  autoplay?: boolean;
  loop?: boolean;
}) {
  const { settings, update, reduceMotion, replayKey } = useApp();
  const speed = settings.signSpeed;
  const shouldAutoplay = autoplay ?? (settings.autoplaySign && !reduceMotion);
  const shouldLoop = loop ?? settings.loopSign;

  const timeline = useMemo(() => buildTimeline(items), [items]);
  const key = itemsKey(items);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const loopRef = useRef(shouldLoop);
  loopRef.current = shouldLoop;

  const seek = useCallback((t: number) => {
    timeRef.current = t;
    setTime(t);
  }, []);

  // reset when the message (or a replay request) changes
  useEffect(() => {
    seek(0);
    setPlaying(shouldAutoplay && items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, replayKey]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) * speedRef.current;
      last = now;
      let t = timeRef.current + dt;
      if (t >= timeline.total) {
        if (loopRef.current) {
          t = 0;
        } else {
          seek(timeline.total);
          setPlaying(false);
          return;
        }
      }
      seek(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, timeline.total, seek]);

  const finished = time >= timeline.total && timeline.total > 0;
  let idx = 0;
  for (let i = 0; i < items.length; i++) if (time >= timeline.starts[i]) idx = i;
  const current = items[idx];
  const local = current ? Math.min(1, Math.max(0, (time - timeline.starts[idx]) / current.duration)) : 0;
  const pose: Pose = current && current.kind === 'sign' ? interpolate(current.motion, local) : REST;

  const togglePlay = () => {
    if (finished) {
      seek(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };
  const replay = () => {
    seek(0);
    setPlaying(true);
  };

  if (items.length === 0) {
    return (
      <div className="sign-stage empty">
        <SignAvatar pose={REST} />
        <p className="muted center">Waiting for a message from the hearing person.</p>
      </div>
    );
  }

  return (
    <div className={`sign-stage ${compact ? 'compact' : ''}`}>
      <div className="stage-view">
        <div className="stage-chip" aria-live="polite">
          {current.kind === 'sign' ? (
            <>
              <span className="stage-chip-label">Now showing</span>
              <strong>{current.entry.phrase}</strong>
              <Badge tone="amber">{STATUS_LABELS[current.entry.status]}</Badge>
            </>
          ) : (
            <>
              <span className="stage-chip-label">No sign available</span>
              <strong>“{current.text}”</strong>
            </>
          )}
        </div>
        <SignAvatar pose={pose} />
        {current.kind === 'fallback' && (
          <div className="fallback-card" role="status">
            <Info size={18} aria-hidden="true" />
            <div>
              <strong>{current.reason === 'awaiting' ? 'Awaiting linguistic validation' : 'Not in the sign library'}</strong>
              <p>
                SIGNBRIDGE has no {current.reason === 'awaiting' ? 'validated or demo animation' : 'sign content'} for “{current.text}” yet, so it
                does not invent one. See the written text instead.
              </p>
            </div>
          </div>
        )}
        <div className="stage-disclaimer">
          <Info size={13} aria-hidden="true" /> Illustrative placeholder animation · not validated Nigerian Sign Language
        </div>
      </div>

      <div className="transport" role="group" aria-label="Animation playback">
        <button type="button" className="btn btn-primary btn-icon" onClick={togglePlay} aria-label={playing ? 'Pause' : finished ? 'Replay' : 'Play'}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
          <span>{playing ? 'Pause' : finished ? 'Replay' : 'Play'}</span>
        </button>
        <button type="button" className="btn btn-ghost btn-icon" onClick={replay} aria-label="Restart from the beginning">
          <RotateCcw size={17} />
          <span className="hide-sm">Restart</span>
        </button>
        <input
          className="range progress"
          type="range"
          min={0}
          max={Math.max(1, timeline.total)}
          value={Math.min(time, timeline.total)}
          onChange={(e) => {
            setPlaying(false);
            seek(Number(e.target.value));
          }}
          aria-label="Animation progress"
          aria-valuetext={`${mmss(time)} of ${mmss(timeline.total)}`}
        />
        <span className="time">{mmss(time)} / {mmss(timeline.total)}</span>
        {!compact && (
          <select className="select select-sm" value={speed} onChange={(e) => update({ signSpeed: Number(e.target.value) })} aria-label="Playback speed">
            <option value={0.5}>0.5×</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.5}>1.5×</option>
          </select>
        )}
      </div>

      {!compact && (
        <>
          <ol className="sign-seq" aria-label="Sign sequence">
            {items.map((it, i) => (
              <li key={`${it.text}-${i}`}>
                <button
                  type="button"
                  className={`seq-chip ${it.kind === 'fallback' ? 'fb' : ''} ${i === idx ? 'on' : ''}`}
                  onClick={() => {
                    setPlaying(false);
                    seek(timeline.starts[i] + 1);
                  }}
                >
                  {it.text}
                  {it.kind === 'fallback' && <small>no sign</small>}
                </button>
              </li>
            ))}
          </ol>
          <div className="transcript">
            <span className="eyebrow">Message transcription</span>
            <p>{text}</p>
            <p className="muted small">
              Phrase lookup only, not a grammatical translation. Word-for-word English is not Nigerian Sign Language grammar.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function SignDisclaimer() {
  return (
    <Notice tone="amber" icon={<Info size={18} aria-hidden="true" />}>
      <strong>Illustrative animations.</strong> The avatar uses placeholder movements to show how Sign Mode will work. They are not Nigerian Sign
      Language and have not been reviewed by Deaf NSL users or linguists.
    </Notice>
  );
}
