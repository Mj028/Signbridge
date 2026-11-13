import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { GloveStatus, Message, Mode, RecogState } from '../types';
import { findEntry, sentence } from '../data/library';
import { mapMessageToSigns } from '../lib/signMapping';
import {
  CONFIDENCE_THRESHOLD,
  REST_FRAME,
  SimulatedGloveTransport,
  SimulatedRecognizer,
  type SensorFrame,
} from '../lib/integration';
import { speak, stopSpeaking, ttsSupported } from '../lib/tts';
import { useSpeechRecognition, type SpeechApi } from '../lib/stt';
import { uid } from '../lib/util';

/* ------------------------------------------------------------------ settings */

export interface Settings {
  mode: Mode;
  onboarded: boolean;
  textScale: number; // 1..5
  highContrast: boolean;
  reduceMotion: boolean;
  showTimestamps: boolean;
  autoSpeak: boolean;
  speechRate: number;
  volume: number;
  voiceURI: string;
  speechLang: string;
  autoSendSpeech: boolean;
  autoplaySign: boolean;
  signSpeed: number;
  loopSign: boolean;
  toastOnMessage: boolean;
  toastOnDevice: boolean;
  vibrate: boolean;
  autoConnect: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'text',
  onboarded: false,
  textScale: 3,
  highContrast: false,
  reduceMotion: false,
  showTimestamps: true,
  autoSpeak: true,
  speechRate: 1,
  volume: 1,
  voiceURI: '',
  speechLang: 'en-NG',
  autoSendSpeech: true,
  autoplaySign: true,
  signSpeed: 1,
  loopSign: false,
  toastOnMessage: true,
  toastOnDevice: true,
  vibrate: false,
  autoConnect: false,
};

const SETTINGS_KEY = 'signbridge.settings.v1';
const MESSAGES_KEY = 'signbridge.messages.v1';

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode, blocked) – the app still works */
  }
}

/* ------------------------------------------------------------------ sample data */

export function sampleMessages(): Message[] {
  const t = Date.now();
  const m = (secAgo: number, p: Omit<Message, 'id' | 'ts'>): Message => ({
    id: uid(),
    ts: t - secAgo * 1000,
    sample: true,
    ...p,
  });
  return [
    m(150, { speaker: 'hearing', text: 'Hello. How are you?', via: 'sample', deliveredAs: 'text' }),
    m(149, { speaker: 'system', text: 'Speech converted successfully. Delivered to the Deaf user’s screen.' }),
    m(110, { speaker: 'deaf', text: 'I am fine.', via: 'glove-sim', confidence: 0.93, gestureId: 'i-am-fine' }),
    m(109, { speaker: 'system', text: 'Gesture recognised (simulated, 93% confidence) and converted to speech.' }),
    m(80, { speaker: 'deaf', text: 'Thank you.', via: 'glove-sim', confidence: 0.94, gestureId: 'thank-you' }),
    m(79, { speaker: 'system', text: 'Gesture recognised (simulated, 94% confidence) and converted to speech.' }),
  ];
}

/* ------------------------------------------------------------------ types */

export interface GloveState {
  status: GloveStatus;
  battery: number;
  lastSync: number | null;
}
export interface RecogView {
  state: RecogState;
  gestureId: string | null;
  confidence: number;
  stage: number;
  message: string;
}
export interface HistoryItem {
  id: string;
  gestureId: string;
  phrase: string;
  confidence: number;
  outcome: 'recognised' | 'uncertain';
  ts: number;
}
export interface Toast {
  id: string;
  text: string;
  tone: 'info' | 'ok' | 'warn';
}
export interface DemoState {
  active: boolean;
  step: number;
}

const IDLE_RECOG: RecogView = { state: 'idle', gestureId: null, confidence: 0, stage: 0, message: '' };

interface AppApi {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reduceMotion: boolean;
  resetAll: () => void;

  messages: Message[];
  focusId: string | null;
  setFocusId: (id: string | null) => void;
  sendHearing: (text: string, via: 'speech' | 'typed' | 'sample') => void;
  clearConversation: () => void;
  loadSample: () => void;
  draft: string;
  setDraft: (v: string) => void;

  glove: GloveState;
  connectGlove: () => Promise<void>;
  disconnectGlove: () => Promise<void>;
  frame: SensorFrame;

  recog: RecogView;
  history: HistoryItem[];
  runGesture: (id: string, opts?: { forceUncertain?: boolean }) => Promise<void>;
  resetRecog: () => void;

  speech: SpeechApi;
  speakText: (text: string) => boolean;
  speaking: boolean;

  toasts: Toast[];
  toast: (text: string, tone?: Toast['tone']) => void;

  demo: DemoState;
  startDemo: () => void;
  stopDemo: () => void;
  setDemoStep: (n: number) => void;
  replayKey: number;
  bumpReplay: () => void;
}

const Ctx = createContext<AppApi | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
};

/* ------------------------------------------------------------------ provider */

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...(readJSON<Partial<Settings>>(SETTINGS_KEY) ?? {}),
  }));
  const [messages, setMessages] = useState<Message[]>(() => readJSON<Message[]>(MESSAGES_KEY) ?? sampleMessages());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [glove, setGlove] = useState<GloveState>({ status: 'disconnected', battery: 82, lastSync: null });
  const [frame, setFrame] = useState<SensorFrame>(REST_FRAME);
  const [recog, setRecog] = useState<RecogView>(IDLE_RECOG);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [demo, setDemo] = useState<DemoState>({ active: false, step: 0 });
  const [replayKey, setReplayKey] = useState(0);
  const [osReduce, setOsReduce] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const gloveStatus = useRef<GloveStatus>('disconnected');
  const connectPromise = useRef<Promise<void> | null>(null);
  const runRef = useRef(0);
  const transport = useRef(new SimulatedGloveTransport()).current;
  const recogniser = useRef(new SimulatedRecognizer()).current;

  /* ---- persistence + root attributes */
  useEffect(() => writeJSON(SETTINGS_KEY, settings), [settings]);
  useEffect(() => writeJSON(MESSAGES_KEY, messages.slice(-120)), [messages]);

  const reduceMotion = settings.reduceMotion || osReduce;
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setOsReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
    const msg = [22, 28, 36, 46, 58][settings.textScale - 1] ?? 36;
    const bubble = [15, 17, 19, 22, 26][settings.textScale - 1] ?? 19;
    root.style.setProperty('--msg-size', `${msg}px`);
    root.style.setProperty('--bubble-size', `${bubble}px`);
  }, [settings.highContrast, settings.textScale, reduceMotion]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);

  /* ---- toasts */
  const toast = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = uid();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  /* ---- text to speech */
  const speakText = useCallback(
    (text: string) => {
      if (!ttsSupported) {
        toast('Speech output is not supported in this browser.', 'warn');
        return false;
      }
      const s = settingsRef.current;
      setSpeaking(true);
      return speak(text, { rate: s.speechRate, volume: s.volume, voiceURI: s.voiceURI }, () => setSpeaking(false));
    },
    [toast],
  );

  /* ---- messages */
  const push = useCallback((...m: Message[]) => setMessages((prev) => [...prev, ...m]), []);
  const system = (text: string): Message => ({ id: uid(), speaker: 'system', text, ts: Date.now() });

  const sendHearing = useCallback(
    (raw: string, via: 'speech' | 'typed' | 'sample') => {
      const text = raw.trim();
      if (!text) return;
      const mode = settingsRef.current.mode;
      const msg: Message = { id: uid(), speaker: 'hearing', text, ts: Date.now(), via, deliveredAs: mode };
      const items = mapMessageToSigns(text);
      const mapped = items.filter((i) => i.kind === 'sign').length;
      const intro = via === 'speech' ? 'Speech converted successfully.' : 'Message received.';
      const delivery =
        mode === 'text'
          ? 'Delivered as text.'
          : `Delivered in Sign Mode (illustrative): ${mapped} of ${items.length} segment${items.length === 1 ? '' : 's'} had demo animations.`;
      const note = system(`${intro} ${delivery}`);
      note.ts = msg.ts + 1;
      push(msg, note);
      setFocusId(msg.id);
      setDraft('');
      if (settingsRef.current.toastOnMessage) toast('Deaf user’s device: new message received', 'info');
      if (settingsRef.current.vibrate && 'vibrate' in navigator) navigator.vibrate?.(120);
    },
    [push, toast],
  );

  const speech = useSpeechRecognition(settings.speechLang, (text) => {
    if (settingsRef.current.autoSendSpeech) sendHearing(text, 'speech');
    else setDraft(text);
  });

  const clearConversation = useCallback(() => {
    setMessages([]);
    setFocusId(null);
    setHistory([]);
    setRecog(IDLE_RECOG);
  }, []);
  const loadSample = useCallback(() => {
    setMessages(sampleMessages());
    setFocusId(null);
  }, []);

  /* ---- glove */
  const connectGlove = useCallback((): Promise<void> => {
    if (gloveStatus.current === 'connected') return Promise.resolve();
    if (connectPromise.current) return connectPromise.current;
    gloveStatus.current = 'connecting';
    setGlove((g) => ({ ...g, status: 'connecting' }));
    const p = transport
      .connect()
      .then(async () => {
        const battery = await transport.battery();
        gloveStatus.current = 'connected';
        setGlove({ status: 'connected', battery, lastSync: Date.now() });
        if (settingsRef.current.toastOnDevice) toast('Simulated glove connected', 'ok');
      })
      .finally(() => {
        connectPromise.current = null;
      });
    connectPromise.current = p;
    return p;
  }, [transport, toast]);

  const disconnectGlove = useCallback(async () => {
    runRef.current++;
    await transport.disconnect();
    gloveStatus.current = 'disconnected';
    setGlove((g) => ({ ...g, status: 'disconnected' }));
    setFrame(REST_FRAME);
    setRecog(IDLE_RECOG);
    if (settingsRef.current.toastOnDevice) toast('Simulated glove disconnected', 'warn');
  }, [transport, toast]);

  useEffect(() => {
    if (glove.status !== 'connected') return;
    const i = setInterval(() => setGlove((g) => ({ ...g, lastSync: Date.now() })), 8000);
    return () => clearInterval(i);
  }, [glove.status]);

  useEffect(() => {
    if (settings.autoConnect) void connectGlove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- gesture simulation */
  const resetRecog = useCallback(() => {
    runRef.current++;
    setRecog(IDLE_RECOG);
    setFrame(REST_FRAME);
  }, []);

  const runGesture = useCallback(
    async (id: string, opts: { forceUncertain?: boolean } = {}) => {
      const entry = findEntry(id);
      if (!entry?.signature) return;
      const run = ++runRef.current;
      const live = () => runRef.current === run;
      const sf: SensorFrame = { fingers: [...entry.signature.fingers], imu: entry.signature.imu, gestureHint: id };
      setFrame(sf);
      setRecog({ state: 'processing', gestureId: id, confidence: 0, stage: 0, message: '' });
      stopSpeaking();

      await connectGlove();
      if (!live()) return;

      const t1 = setTimeout(() => live() && setRecog((r) => ({ ...r, stage: 1 })), 500);
      const t2 = setTimeout(() => live() && setRecog((r) => ({ ...r, stage: 2 })), 1000);
      const res = await recogniser.recognise(sf, opts);
      clearTimeout(t1);
      clearTimeout(t2);
      if (!live()) return;

      const pct = Math.round(res.confidence * 100);
      const now = Date.now();
      if (res.confidence < CONFIDENCE_THRESHOLD) {
        setRecog({ state: 'uncertain', gestureId: id, confidence: res.confidence, stage: 3, message: '' });
        setHistory((h) => [{ id: uid(), gestureId: id, phrase: entry.phrase, confidence: res.confidence, outcome: 'uncertain' as const, ts: now }, ...h].slice(0, 8));
        push(system(`Recognition uncertain (${pct}%). Nothing was translated or spoken. Please retry the gesture.`));
        return;
      }
      const message = sentence(entry);
      setRecog({ state: 'recognised', gestureId: id, confidence: res.confidence, stage: 3, message });
      setHistory((h) => [{ id: uid(), gestureId: id, phrase: entry.phrase, confidence: res.confidence, outcome: 'recognised' as const, ts: now }, ...h].slice(0, 8));
      const deaf: Message = { id: uid(), speaker: 'deaf', text: message, ts: now, via: 'glove-sim', confidence: res.confidence, gestureId: id };
      const note = system(`Gesture recognised (simulated, ${pct}% confidence) and converted to speech.`);
      note.ts = now + 1;
      push(deaf, note);
      if (settingsRef.current.autoSpeak) speakText(message);
      if (settingsRef.current.vibrate && 'vibrate' in navigator) navigator.vibrate?.(80);
    },
    [connectGlove, recogniser, push, speakText],
  );

  /* ---- guided demo */
  const startDemo = useCallback(() => setDemo({ active: true, step: 0 }), []);
  const stopDemo = useCallback(() => setDemo((d) => ({ ...d, active: false })), []);
  const setDemoStep = useCallback((n: number) => setDemo((d) => ({ ...d, step: n })), []);
  const bumpReplay = useCallback(() => setReplayKey((k) => k + 1), []);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(MESSAGES_KEY);
    } catch {
      /* ignore */
    }
    setSettings(DEFAULT_SETTINGS);
    setMessages(sampleMessages());
    setHistory([]);
    setRecog(IDLE_RECOG);
    setFrame(REST_FRAME);
    setFocusId(null);
    stopSpeaking();
  }, []);

  const value = useMemo<AppApi>(
    () => ({
      settings, update, reduceMotion, resetAll,
      messages, focusId, setFocusId, sendHearing, clearConversation, loadSample, draft, setDraft,
      glove, connectGlove, disconnectGlove, frame,
      recog, history, runGesture, resetRecog,
      speech, speakText, speaking,
      toasts, toast,
      demo, startDemo, stopDemo, setDemoStep, replayKey, bumpReplay,
    }),
    [settings, update, reduceMotion, resetAll, messages, focusId, sendHearing, clearConversation, loadSample, draft,
      glove, connectGlove, disconnectGlove, frame, recog, history, runGesture, resetRecog, speech, speakText, speaking,
      toasts, toast, demo, startDemo, stopDemo, setDemoStep, replayKey, bumpReplay],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
