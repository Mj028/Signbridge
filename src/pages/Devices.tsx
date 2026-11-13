import { ArrowRight, Battery, Bluetooth, CheckCircle2, CircleDashed, Cpu, ListChecks, Waves, XCircle } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { FINGERS, GloveGraphic } from '../components/Glove';
import { GloveConnection } from '../components/GesturePanels';
import { Badge, Card, Dot, Notice, PageHeader } from '../components/ui';

const ARCH = [
  { icon: Cpu, name: 'Controller', value: 'ESP32', note: 'Reads sensors and transmits data' },
  { icon: Waves, name: 'Sensors', value: 'Flex sensors ×5 · MPU6050 accelerometer + gyroscope', note: 'Finger bend and hand motion' },
  { icon: Bluetooth, name: 'Communication', value: 'Bluetooth Low Energy', note: 'Subject to final firmware and mobile integration architecture' },
  { icon: Battery, name: 'Power', value: 'Rechargeable battery', note: 'Capacity to be specified' },
];

const INTEGRATION: { label: string; status: 'sim' | 'todo'; note: string }[] = [
  { label: 'Glove BLE transport', status: 'todo', note: 'Interface defined (GloveTransport). Simulated in this prototype.' },
  { label: 'Sensor frame streaming', status: 'todo', note: 'Readings are generated from illustrative signatures.' },
  { label: 'Gesture recognition model', status: 'todo', note: 'Interface defined (GestureRecognizer). No model is connected.' },
  { label: 'NSL recordings and dataset', status: 'todo', note: 'Not collected yet.' },
  { label: 'Verified NSL animation library', status: 'todo', note: 'Placeholders only. Requires linguistic validation.' },
  { label: 'Speech recognition and text-to-speech', status: 'sim', note: 'Uses the browser’s built-in APIs where supported.' },
];

export function Devices() {
  const { glove, frame } = useApp();
  const on = glove.status === 'connected';
  return (
    <>
      <PageHeader title="Device management" sub="The proposed SIGNBRIDGE Smart Glove hardware architecture and its integration status." />
      <Notice tone="amber" icon={<CircleDashed size={18} aria-hidden="true" />}>
        <b>No real device is connected.</b> Connection, battery and sensor status below come from a simulation so the experience can be demonstrated without hardware.
      </Notice>

      <div className="dev-grid">
        <Card title="Proposed glove" icon={<Cpu size={18} aria-hidden="true" />}>
          <div className="dev-glove">
            <GloveGraphic bends={frame.fingers} />
            <ul className="legend-list">
              <li><i style={{ background: '#2DD4BF' }} /> Flex sensor strips (one per finger)</li>
              <li><i style={{ background: '#0B1F3A', outline: '1.5px solid #2DD4BF' }} /> ESP32 controller on the back of the hand</li>
              <li><i style={{ background: '#2DD4BF' }} /> MPU6050 IMU</li>
              <li><i style={{ background: '#0E9F9A' }} /> Rechargeable battery in the cuff</li>
            </ul>
          </div>
        </Card>

        <div className="stack">
          <GloveConnection />
          <Card title="Sensor status" icon={<Waves size={18} aria-hidden="true" />}>
            <ul className="sensor-status">
              {[...FINGERS.map((f) => `${f} flex sensor`), 'MPU6050 IMU'].map((s) => (
                <li key={s}><span>{s}</span><span><Dot tone={on ? 'green' : 'grey'} />{on ? 'OK (simulated)' : 'No signal'}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid-2">
        <Card title="Hardware architecture" icon={<Cpu size={18} aria-hidden="true" />}>
          <ul className="arch">
            {ARCH.map((a) => (
              <li key={a.name}>
                <a.icon size={20} aria-hidden="true" />
                <div><b>{a.name}</b><span>{a.value}</span><small>{a.note}</small></div>
              </li>
            ))}
          </ul>
          <div className="pipeline" aria-label="Data flow">
            {['Flex + IMU', 'ESP32', 'BLE', 'Phone app', 'Recogniser', 'Text + speech'].map((s, i, a) => (
              <span key={s}>{s}{i < a.length - 1 && <ArrowRight size={14} aria-hidden="true" />}</span>
            ))}
          </div>
        </Card>

        <Card title="Hardware integration status" icon={<ListChecks size={18} aria-hidden="true" />}>
          <ul className="integ">
            {INTEGRATION.map((i) => (
              <li key={i.label}>
                {i.status === 'sim' ? <CheckCircle2 size={18} className="ok" aria-hidden="true" /> : <XCircle size={18} className="todo" aria-hidden="true" />}
                <div><b>{i.label}</b><small>{i.note}</small></div>
                <Badge tone={i.status === 'sim' ? 'teal' : 'amber'}>{i.status === 'sim' ? 'Browser API' : 'Not integrated'}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Connection instructions" icon={<Bluetooth size={18} aria-hidden="true" />}>
        <div className="grid-2 tight">
          <div>
            <h3 className="h3">In this prototype</h3>
            <ol className="steps">
              <li>Press <b>Connect</b> on the glove card. The app simulates pairing for about two seconds.</li>
              <li>Select a gesture on <b>Sign → Speech</b> to see simulated sensor readings.</li>
              <li>Press <b>Disconnect</b> to see the disconnected state.</li>
            </ol>
          </div>
          <div>
            <h3 className="h3">With real hardware (future)</h3>
            <ol className="steps">
              <li>Power on the glove and wear it.</li>
              <li>Allow Bluetooth in the app and select “SIGNBRIDGE Smart Glove”.</li>
              <li>Calibrate flat and fist hand positions.</li>
              <li>Confirm all six sensors report before signing.</li>
            </ol>
          </div>
        </div>
      </Card>
    </>
  );
}
