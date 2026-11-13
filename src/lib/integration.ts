import { findEntry } from '../data/library';
import type { ImuReading } from '../types';

/**
 * Integration seams for real hardware and AI.
 *
 * Phase One ships only the SIMULATED implementations below. To go live:
 *   1. Implement `GloveTransport` with Web Bluetooth (BLE GATT notifications from the ESP32).
 *   2. Implement `GestureRecognizer` with an on-device model (TensorFlow.js / ONNX) or an API call.
 *   3. Swap the instances created in `state/AppContext.tsx`. The UI does not need to change.
 */

export interface SensorFrame {
  fingers: number[]; // flex bend %, thumb..little
  imu: ImuReading;
  /** Simulation only: which gesture the demo is "performing". Real frames never carry this. */
  gestureHint?: string;
}

export interface RecognitionResult {
  gestureId: string | null;
  confidence: number; // 0..1
}

export interface GestureRecognizer {
  readonly id: string;
  readonly label: string;
  readonly simulated: boolean;
  recognise(frame: SensorFrame, opts?: { forceUncertain?: boolean }): Promise<RecognitionResult>;
}

export interface GloveTransport {
  readonly simulated: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  battery(): Promise<number>; // percent
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const CONFIDENCE_THRESHOLD = 0.7;

export const REST_FRAME: SensorFrame = {
  fingers: [8, 8, 8, 8, 8],
  imu: { roll: 0, pitch: 0, yaw: 0, accel: 1.0, gyro: 0 },
};

/** Pretends to recognise a gesture. Returns the hinted gesture with a plausible confidence. */
export class SimulatedRecognizer implements GestureRecognizer {
  readonly id = 'simulated-v0';
  readonly label = 'Simulated recogniser (no model)';
  readonly simulated = true;

  async recognise(frame: SensorFrame, opts?: { forceUncertain?: boolean }): Promise<RecognitionResult> {
    await sleep(1500);
    const hint = frame.gestureHint ?? null;
    if (opts?.forceUncertain) {
      return { gestureId: hint, confidence: 0.42 + Math.random() * 0.16 };
    }
    const base = (hint && findEntry(hint)?.signature?.confidence) || 0.85;
    return { gestureId: hint, confidence: Math.min(0.99, base + (Math.random() - 0.5) * 0.04) };
  }
}

/** Pretends to pair over Bluetooth. No radio is used. */
export class SimulatedGloveTransport implements GloveTransport {
  readonly simulated = true;
  async connect() {
    await sleep(1800);
  }
  async disconnect() {
    await sleep(250);
  }
  async battery() {
    return 82;
  }
}
