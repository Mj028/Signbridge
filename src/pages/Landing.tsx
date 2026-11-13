import {
  ArrowRight, BookOpen, Captions, Cpu, FlaskConical, Hand, Languages, MessagesSquare, Mic, Settings2,
  Smartphone, Volume2, Waves, Ear, PenLine, Users,
} from 'lucide-react';
import { navigate } from '../lib/router';
import { useApp } from '../state/AppContext';
import { Logo } from '../components/ui';
import { HeroIllustration } from '../components/Hero';
import { GloveGraphic } from '../components/Glove';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function Landing() {
  const { settings, startDemo } = useApp();
  const tryDemo = () => navigate(settings.onboarded ? '/app' : '/onboarding');

  return (
    <div className="landing">
      <header className="l-nav">
        <div className="wrap l-nav-in">
          <Logo />
          <nav className="l-links" aria-label="Page sections">
            <button type="button" onClick={() => scrollTo('problem')}>The problem</button>
            <button type="button" onClick={() => scrollTo('how')}>How it works</button>
            <button type="button" onClick={() => scrollTo('glove')}>Smart glove</button>
            <button type="button" onClick={() => scrollTo('features')}>Features</button>
          </nav>
          <button type="button" className="btn btn-primary btn-sm" onClick={tryDemo}>Try the Demo</button>
        </div>
      </header>

      <section className="hero wrap">
        <div className="hero-copy">
          <span className="pill"><FlaskConical size={14} aria-hidden="true" /> Phase One prototype</span>
          <h1>Communication without barriers.</h1>
          <p className="lead">
            Bringing Deaf and hearing people closer through intelligent wearable technology, sign language recognition and accessible communication.
          </p>
          <div className="row gap wrap">
            <button type="button" className="btn btn-primary btn-lg" onClick={tryDemo}>Try the Demo <ArrowRight size={18} /></button>
            <button type="button" className="btn btn-outline btn-lg" onClick={() => scrollTo('how')}>Explore How It Works</button>
          </div>
          <button type="button" className="link-btn" onClick={() => { navigate('/app'); startDemo(); }}>or start the 8-step guided demo</button>
        </div>
        <div className="hero-art"><HeroIllustration /></div>
      </section>

      <section className="band" id="problem">
        <div className="wrap">
          <span className="eyebrow">The problem</span>
          <h2>Two people, two ways of communicating, no shared language.</h2>
          <div className="triple">
            <article>
              <Ear size={22} aria-hidden="true" />
              <h3>Hearing people rarely know NSL</h3>
              <p>A hearing person may not understand Nigerian Sign Language, so even a simple greeting can stall.</p>
            </article>
            <article>
              <Hand size={22} aria-hidden="true" />
              <h3>Signing is often the preferred language</h3>
              <p>Many Deaf people prefer to communicate through signs rather than spoken language.</p>
            </article>
            <article>
              <PenLine size={22} aria-hidden="true" />
              <h3>Writing is not always enough</h3>
              <p>Written communication is not an adequate answer for everyone, because comfort with written language varies.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="wrap section" id="how">
        <span className="eyebrow">The solution</span>
        <h2>A glove, a phone and two directions of translation.</h2>
        <p className="lead narrow">
          SIGNBRIDGE combines a smart electronic glove, gesture recognition, speech recognition, text-to-speech and sign animation in one mobile-friendly app.
        </p>
        <div className="two-col">
          <article className="flow-card">
            <header><span className="dir">Direction A</span><h3>Sign to speech</h3></header>
            <ol className="flow">
              <li><Hand size={18} aria-hidden="true" /><span>Deaf user signs wearing the glove</span></li>
              <li><Waves size={18} aria-hidden="true" /><span>Flex sensors and IMU capture the movement</span></li>
              <li><Languages size={18} aria-hidden="true" /><span>Gesture recognition identifies the phrase</span></li>
              <li><Volume2 size={18} aria-hidden="true" /><span>The app speaks it in English</span></li>
            </ol>
          </article>
          <article className="flow-card alt">
            <header><span className="dir">Direction B</span><h3>Speech to sign or text</h3></header>
            <ol className="flow">
              <li><Mic size={18} aria-hidden="true" /><span>Hearing person speaks to the phone</span></li>
              <li><Languages size={18} aria-hidden="true" /><span>Speech recognition converts it to text</span></li>
              <li><Captions size={18} aria-hidden="true" /><span>Text Mode: readable, adjustable text</span></li>
              <li><Hand size={18} aria-hidden="true" /><span>Sign Mode: visual sign representation</span></li>
            </ol>
          </article>
        </div>
      </section>

      <section className="band dark" id="glove">
        <div className="wrap glove-sec">
          <div className="glove-art"><GloveGraphic bends={[10, 10, 10, 10, 10]} /></div>
          <div>
            <span className="eyebrow light">The smart glove</span>
            <h2>Sensors in the glove, intelligence in the app.</h2>
            <p className="lead light">The proposed glove reads finger bend and hand motion, and sends it to the phone over Bluetooth Low Energy.</p>
            <ul className="spec-list">
              <li><Cpu size={18} aria-hidden="true" /><span><b>ESP32 controller</b> collects and transmits sensor data</span></li>
              <li><Waves size={18} aria-hidden="true" /><span><b>Five flex sensors</b> measure thumb to little finger bend</span></li>
              <li><Smartphone size={18} aria-hidden="true" /><span><b>MPU6050 IMU</b> adds orientation and motion; <b>BLE</b> link to the app, subject to final firmware design</span></li>
            </ul>
            <p className="light small">In this prototype the glove is simulated. No hardware is required to try the demo.</p>
          </div>
        </div>
      </section>

      <section className="wrap section" id="features">
        <span className="eyebrow">What the prototype demonstrates</span>
        <h2>Eight parts of one communication experience.</h2>
        <div className="feature-grid">
          {[
            [Hand, 'Sign to speech', 'Simulated glove, sensor readings, recognition and spoken output.'],
            [Mic, 'Speech input', 'Live microphone transcription with a typed fallback that always works.'],
            [Captions, 'Text Mode', 'Large, adjustable, high-contrast messages with timestamps.'],
            [Users, 'Sign Mode', 'An illustrative avatar and an honest fallback when no sign exists.'],
            [MessagesSquare, 'Two-way conversation', 'Both directions in one thread, with clear speaker labels.'],
            [BookOpen, 'NSL Library', 'Searchable vocabulary with explicit validation status.'],
            [Cpu, 'Device management', 'The proposed ESP32 hardware architecture and integration status.'],
            [Settings2, 'Personalisation', 'Text size, audio, animation, accessibility and notifications.'],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Hand;
            return (
              <article key={title as string} className="feature">
                <I size={20} aria-hidden="true" />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="band vision">
        <div className="wrap narrow-c">
          <span className="eyebrow">Our vision</span>
          <p className="vision-text">To make communication easier and more accessible by removing barriers between people who communicate through sign language and those who communicate through speech.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={tryDemo}>Try the Demo <ArrowRight size={18} /></button>
        </div>
      </section>

      <footer className="l-foot">
        <div className="wrap">
          <Logo />
          <p className="small muted">
            <b>Honest status:</b> SIGNBRIDGE is a Phase One prototype. The smart glove, sensor data, gesture-recognition model and Nigerian Sign Language
            content are <b>simulated or illustrative</b>. No expression is marked as validated NSL. Verified NSL content requires recordings and review by
            Deaf NSL users and linguists.
          </p>
        </div>
      </footer>
    </div>
  );
}
