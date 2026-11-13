import { useRoute } from './lib/router';
import { useApp } from './state/AppContext';
import { Shell } from './components/Shell';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { SignToSpeech } from './pages/SignToSpeech';
import { SpeechToSign } from './pages/SpeechToSign';
import { Conversation } from './pages/Conversation';
import { Library } from './pages/Library';
import { Devices } from './pages/Devices';
import { SettingsPage } from './pages/Settings';

export function App() {
  const route = useRoute();
  const { settings } = useApp();

  if (route === '/' || route === '') return <Landing />;
  if (route === '/onboarding') return <Onboarding />;

  if (!route.startsWith('/app')) return <Landing />;
  // first-time visitors who deep-link into the app still get the app (no registration required)
  void settings;

  const page = (() => {
    switch (route) {
      case '/app/sign-to-speech': return <SignToSpeech />;
      case '/app/speech-to-sign': return <SpeechToSign />;
      case '/app/conversation': return <Conversation />;
      case '/app/library': return <Library />;
      case '/app/devices': return <Devices />;
      case '/app/settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  })();
  return <Shell route={route}>{page}</Shell>;
}
