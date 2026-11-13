export type Mode = 'text' | 'sign';

/**
 * demo      – a placeholder used only so the prototype can be demonstrated.
 * awaiting  – vocabulary is listed but has no content yet; needs linguistic validation.
 * validated – reviewed by Deaf NSL users / linguists. NOTHING is marked validated in Phase One.
 */
export type ContentStatus = 'demo' | 'awaiting' | 'validated';

export type Category = 'greetings' | 'everyday' | 'health' | 'education' | 'requests' | 'responses';

export interface ImuReading {
  roll: number; // degrees
  pitch: number; // degrees
  yaw: number; // degrees
  accel: number; // g
  gyro: number; // deg/s
}

/** Illustrative sensor signature. NOT measured from a real glove. */
export interface SensorSignature {
  fingers: [number, number, number, number, number]; // bend %, thumb..little
  imu: ImuReading;
  confidence: number; // base confidence used by the simulated recogniser
}

export interface LibraryEntry {
  id: string;
  phrase: string; // English expression
  category: Category;
  status: ContentStatus;
  /** Key into MOTIONS (illustrative placeholder animation). Absent = no animation. */
  motionId?: string;
  /** Present only when the simulated glove can "perform" this expression. */
  signature?: SensorSignature;
}

export type GloveStatus = 'disconnected' | 'connecting' | 'connected';
export type RecogState = 'idle' | 'processing' | 'recognised' | 'uncertain';

export type Speaker = 'hearing' | 'deaf' | 'system';

export interface Message {
  id: string;
  speaker: Speaker;
  text: string;
  ts: number;
  via?: 'speech' | 'typed' | 'glove-sim' | 'sample';
  confidence?: number;
  gestureId?: string;
  deliveredAs?: Mode;
  sample?: boolean;
}
