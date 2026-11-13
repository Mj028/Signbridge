import { useApp } from '../state/AppContext';
import { useTween } from '../lib/util';
import type { ImuReading } from '../types';

export const FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Little'] as const;

/** Visual glove: finger length shrinks with bend, so bending reads as foreshortening. */
export function GloveGraphic({
  bends,
  className = '',
  showBoard = true,
}: {
  bends: number[];
  className?: string;
  showBoard?: boolean;
}) {
  // x positions for little, ring, middle, index (left→right) + thumb handled separately
  const cols = [
    { i: 4, x: 84, len: 80 },
    { i: 3, x: 118, len: 106 },
    { i: 2, x: 152, len: 120 },
    { i: 1, x: 186, len: 108 },
  ];
  const scale = (b: number) => 1 - (Math.min(100, Math.max(0, b)) / 100) * 0.55;
  const tf = (b: number) => ({
    transformBox: 'fill-box' as const,
    transformOrigin: '50% 100%',
    transform: `scaleY(${scale(b)})`,
    transition: 'transform .6s cubic-bezier(.3,.7,.2,1)',
  });
  const strip = (b: number) => 0.45 + (b / 100) * 0.55;

  return (
    <svg viewBox="0 0 300 370" className={`glove-svg ${className}`} role="img" aria-label="Illustration of the SIGNBRIDGE smart glove with five flex sensors, an IMU and an ESP32 controller">
      {/* fingers */}
      {cols.map(({ i, x, len }) => (
        <g key={i}>
          <rect x={x} y={182 - len} width="30" height={len + 18} rx="15" fill="#274B76" style={tf(bends[i] ?? 0)} />
          <rect x={x + 11} y={192 - len} width="8" height={len - 4} rx="4" fill="#2DD4BF" opacity={strip(bends[i] ?? 0)} style={tf(bends[i] ?? 0)} />
        </g>
      ))}
      <g transform="rotate(34 222 262)">
        <rect x="208" y="172" width="30" height="104" rx="15" fill="#274B76" style={tf(bends[0] ?? 0)} />
        <rect x="219" y="182" width="8" height="84" rx="4" fill="#2DD4BF" opacity={strip(bends[0] ?? 0)} style={tf(bends[0] ?? 0)} />
      </g>
      {/* palm */}
      <rect x="78" y="172" width="150" height="136" rx="30" fill="#1E3A5F" />
      {showBoard && (
        <>
          <rect x="104" y="204" width="94" height="56" rx="7" fill="#0B1F3A" stroke="#2DD4BF" strokeWidth="1.5" />
          <text x="151" y="238" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="Inter Variable, Inter, sans-serif">ESP32</text>
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <circle key={n} cx={112 + n * 13} cy={211} r="1.8" fill="#2DD4BF" />
          ))}
          <rect x="92" y="270" width="34" height="22" rx="4" fill="#2DD4BF" />
          <text x="109" y="285" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0B1F3A" fontFamily="Inter Variable, Inter, sans-serif">IMU</text>
        </>
      )}
      {/* cuff + battery */}
      <rect x="86" y="306" width="134" height="54" rx="10" fill="#17304F" />
      <rect x="116" y="320" width="74" height="26" rx="5" fill="#0E9F9A" />
      <rect x="190" y="327" width="5" height="12" rx="2" fill="#0E9F9A" />
      <text x="153" y="338" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff" fontFamily="Inter Variable, Inter, sans-serif">BATTERY</text>
    </svg>
  );
}

export function SensorBars({ fingers, active }: { fingers: number[]; active: boolean }) {
  const { reduceMotion } = useApp();
  return (
    <ul className="sensor-list" aria-label="Flex sensor readings (simulated)">
      {FINGERS.map((name, i) => (
        <SensorRow key={name} name={name} value={fingers[i] ?? 0} active={active} instant={reduceMotion} />
      ))}
    </ul>
  );
}

function SensorRow({ name, value, active, instant }: { name: string; value: number; active: boolean; instant: boolean }) {
  const v = useTween(value, 600, instant);
  return (
    <li className="sensor-row">
      <span className="sensor-name">{name}</span>
      <span className="bar" role="meter" aria-label={`${name} bend`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)}>
        <span className={`bar-fill ${active ? '' : 'off'}`} style={{ width: `${v}%` }} />
      </span>
      <span className="sensor-val">
        {Math.round(v)}%<small>ADC≈{Math.round(v * 40.95)}</small>
      </span>
    </li>
  );
}

export function ImuPanel({ imu, active }: { imu: ImuReading; active: boolean }) {
  const { reduceMotion } = useApp();
  const roll = useTween(imu.roll, 650, reduceMotion);
  const pitch = useTween(imu.pitch, 650, reduceMotion);
  const yaw = useTween(imu.yaw, 650, reduceMotion);
  const accel = useTween(imu.accel, 650, reduceMotion);
  const gyro = useTween(imu.gyro, 650, reduceMotion);
  return (
    <div className="imu">
      <div className="imu-stage" aria-hidden="true">
        <div className={`imu-board ${active ? '' : 'off'}`} style={{ transform: `rotateX(${-pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)` }}>
          <span>MPU6050</span>
        </div>
      </div>
      <dl className="imu-grid" aria-label="IMU readings (simulated)">
        <div><dt>Roll</dt><dd>{roll.toFixed(0)}°</dd></div>
        <div><dt>Pitch</dt><dd>{pitch.toFixed(0)}°</dd></div>
        <div><dt>Yaw</dt><dd>{yaw.toFixed(0)}°</dd></div>
        <div><dt>Accel</dt><dd>{accel.toFixed(2)} g</dd></div>
        <div><dt>Gyro</dt><dd>{gyro.toFixed(0)} °/s</dd></div>
      </dl>
    </div>
  );
}
