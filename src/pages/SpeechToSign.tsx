import { PageHeader } from '../components/ui';
import { SpeechInput } from '../components/SpeechInput';
import { DeafScreen } from '../components/DeafScreen';
import { SignDisclaimer } from '../components/SignAvatar';
import { useApp } from '../state/AppContext';

export function SpeechToSign() {
  const { settings } = useApp();
  return (
    <>
      <PageHeader title="Speech to Sign / Text" sub="The hearing person speaks. The Deaf user receives the message in their chosen format." />
      {settings.mode === 'sign' && <SignDisclaimer />}
      <div className="sts-grid">
        <SpeechInput />
        <DeafScreen />
      </div>
    </>
  );
}
