import { useEffect, useState } from 'react';
import { Bell, Captions, Cpu, Eye, Hand, Info, Play, Settings2, Volume2, Accessibility, RotateCcw } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { getVoices, ttsSupported } from '../lib/tts';
import { Card, Notice, PageHeader, Segmented, Toggle } from '../components/ui';
import type { Mode } from '../types';

export function SettingsPage() {
  const { settings, update, speakText, resetAll, toast, speech } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!ttsSupported) return;
    const load = () => setVoices(getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')));
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  return (
    <>
      <PageHeader title="Settings" sub="Personalise SIGNBRIDGE. Changes apply immediately and are saved on this device." />

      <div className="settings-grid">
        <Card title="Communication preference" icon={<Settings2 size={18} aria-hidden="true" />}>
          <p className="small muted">Controls how the Deaf user receives the hearing person’s messages. Switching here updates the experience instantly.</p>
          <Segmented<Mode>
            label="Communication preference"
            value={settings.mode}
            onChange={(mode) => update({ mode })}
            options={[
              { value: 'text', label: <><Captions size={15} /> Text Mode · I can read</> },
              { value: 'sign', label: <><Hand size={15} /> Sign Mode</> },
            ]}
          />
        </Card>

        <Card title="Text size" icon={<Captions size={18} aria-hidden="true" />}>
          <label className="range-row">
            <span>Message text size <b>{settings.textScale}/5</b></span>
            <input type="range" className="range" min={1} max={5} step={1} value={settings.textScale} onChange={(e) => update({ textScale: Number(e.target.value) })} aria-label="Message text size" />
          </label>
          <div className="big-message preview"><p>Good morning. How are you today?</p></div>
        </Card>

        <Card title="Accessibility" icon={<Accessibility size={18} aria-hidden="true" />}>
          <Toggle label="High contrast" hint="Stronger borders and darker text" checked={settings.highContrast} onChange={(v) => update({ highContrast: v })} />
          <Toggle label="Reduce motion" hint="Turns off transitions and animation autoplay. Your device setting is also respected." checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
          <Toggle label="Show message timestamps" checked={settings.showTimestamps} onChange={(v) => update({ showTimestamps: v })} />
        </Card>

        <Card title="Audio playback" icon={<Volume2 size={18} aria-hidden="true" />}>
          {!ttsSupported && <Notice tone="amber">Text-to-speech is not supported in this browser.</Notice>}
          <Toggle label="Speak recognised gestures automatically" checked={settings.autoSpeak} onChange={(v) => update({ autoSpeak: v })} />
          <label className="range-row"><span>Speed <b>{settings.speechRate.toFixed(1)}×</b></span>
            <input type="range" className="range" min={0.6} max={1.6} step={0.1} value={settings.speechRate} onChange={(e) => update({ speechRate: Number(e.target.value) })} aria-label="Speech speed" /></label>
          <label className="range-row"><span>Volume <b>{Math.round(settings.volume * 100)}%</b></span>
            <input type="range" className="range" min={0.2} max={1} step={0.1} value={settings.volume} onChange={(e) => update({ volume: Number(e.target.value) })} aria-label="Speech volume" /></label>
          <label className="field"><span>Voice</span>
            <select className="select" value={settings.voiceURI} onChange={(e) => update({ voiceURI: e.target.value })} aria-label="Voice">
              <option value="">Browser default</option>
              {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
            </select></label>
          <label className="field"><span>Microphone language</span>
            <select className="select" value={settings.speechLang} onChange={(e) => update({ speechLang: e.target.value })} aria-label="Microphone language" disabled={!speech.supported}>
              <option value="en-NG">English (Nigeria)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-US">English (US)</option>
            </select></label>
          <button type="button" className="btn btn-outline btn-sm self-start" onClick={() => speakText('SIGNBRIDGE audio test. How are you?')}><Play size={15} /> Test voice</button>
        </Card>

        <Card title="Animation playback" icon={<Eye size={18} aria-hidden="true" />}>
          <Toggle label="Autoplay sign animation on new messages" checked={settings.autoplaySign} onChange={(v) => update({ autoplaySign: v })} />
          <Toggle label="Loop animation" checked={settings.loopSign} onChange={(v) => update({ loopSign: v })} />
          <label className="field"><span>Default speed</span>
            <select className="select" value={settings.signSpeed} onChange={(e) => update({ signSpeed: Number(e.target.value) })} aria-label="Default animation speed">
              <option value={0.5}>0.5×</option><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.5}>1.5×</option>
            </select></label>
        </Card>

        <Card title="Notifications" icon={<Bell size={18} aria-hidden="true" />}>
          <Toggle label="Notify when a message arrives" hint="Shows a toast on the Deaf user’s device" checked={settings.toastOnMessage} onChange={(v) => update({ toastOnMessage: v })} />
          <Toggle label="Notify on device changes" hint="Glove connected or disconnected" checked={settings.toastOnDevice} onChange={(v) => update({ toastOnDevice: v })} />
          <Toggle label="Vibrate on new message" hint="Only on devices and browsers that support vibration" checked={settings.vibrate} onChange={(v) => { update({ vibrate: v }); if (v && 'vibrate' in navigator) navigator.vibrate?.(80); else if (v) toast('Vibration is not supported on this device.', 'warn'); }} />
        </Card>

        <Card title="Device settings" icon={<Cpu size={18} aria-hidden="true" />}>
          <Toggle label="Auto-connect simulated glove on launch" checked={settings.autoConnect} onChange={(v) => update({ autoConnect: v })} />
          <Toggle label="Send speech automatically" hint="Send when the hearing person stops speaking" checked={settings.autoSendSpeech} onChange={(v) => update({ autoSendSpeech: v })} />
          <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => { resetAll(); toast('Demo data and settings reset', 'ok'); }}><RotateCcw size={15} /> Reset demo data</button>
        </Card>
      </div>

      <Card title="About SIGNBRIDGE" icon={<Info size={18} aria-hidden="true" />}>
        <p>SIGNBRIDGE is a smart wearable two-way communication system concept for Nigerian Sign Language users and hearing people. <b>Version 0.1.0 · Phase One prototype.</b></p>
        <div className="about-grid">
          <div>
            <h3 className="h3">Working in this prototype</h3>
            <ul className="bullets">
              <li>Speech recognition and text-to-speech (browser APIs, where supported)</li>
              <li>Text Mode, Sign Mode switching, conversation flow and settings</li>
              <li>Library, device and integration architecture</li>
            </ul>
          </div>
          <div>
            <h3 className="h3">Simulated or illustrative</h3>
            <ul className="bullets">
              <li>Smart glove connection, battery and sensor readings</li>
              <li>Gesture recognition (no trained model)</li>
              <li>Sign animations (placeholders, not validated NSL)</li>
            </ul>
          </div>
        </div>
      </Card>
    </>
  );
}
