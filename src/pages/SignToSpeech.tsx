import { FlaskConical, Hand, Activity, Gauge, History, Zap } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { GloveGraphic, ImuPanel, SensorBars } from '../components/Glove';
import { GestureChips, GloveConnection, RecognitionHistory, RecognitionStatus } from '../components/GesturePanels';
import { Card, Notice, PageHeader, Segmented } from '../components/ui';

export function SignToSpeech() {
  const { frame, glove, recog, runGesture } = useApp();
  const active = glove.status === 'connected';
  return (
    <>
      <PageHeader title="Sign to Speech" sub="The Deaf user signs with the glove; SIGNBRIDGE recognises the gesture and speaks it in English." />

      <Notice tone="amber" icon={<FlaskConical size={18} aria-hidden="true" />}>
        <b>Simulated recognition.</b> Choosing a gesture below generates illustrative sensor readings and a scripted recognition result. No real glove, sensor data or
        trained model is involved, and these gestures are candidate expressions, not validated Nigerian Sign Language.
      </Notice>

      <div className="stw-grid">
        <div className="stack">
          <Card title="Gesture recognition" icon={<Hand size={18} aria-hidden="true" />} action={
            <Segmented
              label="Recognition source"
              size="sm"
              value="sim"
              onChange={() => undefined}
              options={[
                { value: 'sim', label: 'Simulated' },
                { value: 'real', label: 'Real glove', disabled: true },
              ]}
            />
          }>
            <div className="recog-layout">
              <div className="glove-wrap">
                <GloveGraphic bends={frame.fingers} />
                <span className="small muted center">Finger length shrinks as the flex sensor bends</span>
              </div>
              <div className="stack">
                <RecognitionStatus large />
              </div>
            </div>
            <span className="eyebrow">Demonstration gestures</span>
            <GestureChips cols />
            <div className="row gap-sm wrap">
              <button type="button" className="btn btn-ghost btn-sm" disabled={recog.state === 'processing'} onClick={() => runGesture(recog.gestureId ?? 'hello', { forceUncertain: true })}>
                <Zap size={15} /> Simulate an uncertain result
              </button>
              <span className="small muted">Shows how low-confidence results are held back rather than spoken.</span>
            </div>
          </Card>
        </div>

        <div className="stack">
          <GloveConnection />
          <Card title="Flex sensors" icon={<Activity size={18} aria-hidden="true" />} action={<span className="small muted">{active ? 'Simulated' : 'Glove disconnected'}</span>}>
            <SensorBars fingers={frame.fingers} active={active || recog.state !== 'idle'} />
          </Card>
          <Card title="IMU status" icon={<Gauge size={18} aria-hidden="true" />} action={<span className="small muted">MPU6050 · illustrative</span>}>
            <ImuPanel imu={frame.imu} active={active || recog.state !== 'idle'} />
          </Card>
          <Card title="Recognition history" icon={<History size={18} aria-hidden="true" />}>
            <RecognitionHistory />
          </Card>
        </div>
      </div>
    </>
  );
}
