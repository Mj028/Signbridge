export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface SpeakOptions {
  rate: number;
  volume: number;
  voiceURI?: string;
}

export function getVoices(): SpeechSynthesisVoice[] {
  return ttsSupported ? window.speechSynthesis.getVoices() : [];
}

export function stopSpeaking() {
  if (ttsSupported) window.speechSynthesis.cancel();
}

export function speak(text: string, opts: SpeakOptions, onEnd?: () => void): boolean {
  if (!ttsSupported || !text.trim()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts.rate;
  u.volume = opts.volume;
  const voice = opts.voiceURI ? synth.getVoices().find((v) => v.voiceURI === opts.voiceURI) : undefined;
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = 'en-GB';
  }
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
  return true;
}
