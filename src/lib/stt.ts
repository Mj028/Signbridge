import { useCallback, useEffect, useRef, useState } from 'react';

export type MicStatus = 'idle' | 'listening' | 'denied' | 'unsupported' | 'error';

// The Web Speech API is not in the standard TS DOM lib; keep this loosely typed.
type RecognitionCtor = new () => any;
const getCtor = (): RecognitionCtor | null =>
  typeof window === 'undefined'
    ? null
    : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

export interface SpeechApi {
  supported: boolean;
  status: MicStatus;
  interim: string;
  finalText: string;
  message: string;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

/**
 * Thin wrapper around the browser Web Speech API.
 * `onFinal` fires once per listening session with the final transcript.
 */
export function useSpeechRecognition(lang: string, onFinal: (text: string) => void): SpeechApi {
  const Ctor = getCtor();
  const supported = !!Ctor;
  const [status, setStatus] = useState<MicStatus>(supported ? 'idle' : 'unsupported');
  const [interim, setInterim] = useState('');
  const [finalText, setFinalText] = useState('');
  const [message, setMessage] = useState('');
  const recRef = useRef<any>(null);
  const finalRef = useRef('');
  const failedRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const start = useCallback(() => {
    const C = getCtor();
    if (!C) {
      setStatus('unsupported');
      return;
    }
    if (recRef.current) return;
    const rec = new C();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    finalRef.current = '';
    failedRef.current = false;
    setInterim('');
    setFinalText('');
    setMessage('');

    rec.onstart = () => setStatus('listening');
    rec.onresult = (e: any) => {
      let interimText = '';
      let finalChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalChunk) {
        finalRef.current = `${finalRef.current} ${finalChunk}`.trim();
        setFinalText(finalRef.current);
      }
      setInterim(interimText);
    };
    rec.onerror = (e: any) => {
      failedRef.current = true;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setStatus('denied');
        setMessage('Microphone permission was denied. Type your message instead, or allow the microphone in your browser settings.');
      } else if (e.error === 'no-speech') {
        failedRef.current = false;
        setMessage('No speech detected. Try again, or type your message.');
      } else if (e.error === 'audio-capture') {
        setStatus('error');
        setMessage('No microphone was found. Type your message instead.');
      } else if (e.error === 'aborted') {
        failedRef.current = false;
      } else {
        setStatus('error');
        setMessage(`Speech recognition error (${e.error}). Type your message instead.`);
      }
    };
    rec.onend = () => {
      recRef.current = null;
      setInterim('');
      setStatus((s) => (failedRef.current && (s === 'denied' || s === 'error') ? s : 'idle'));
      const text = finalRef.current.trim();
      if (text) onFinalRef.current(text);
      finalRef.current = '';
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      recRef.current = null;
      setStatus('error');
      setMessage('Could not start the microphone. Type your message instead.');
    }
  }, [lang]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => {
    setFinalText('');
    setInterim('');
    setMessage('');
  }, []);

  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  return { supported, status, interim, finalText, message, start, stop, clear };
}
