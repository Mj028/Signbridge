import type { Category, ContentStatus, LibraryEntry, SensorSignature } from '../types';

/**
 * SIGNBRIDGE expression library (Phase One).
 *
 * IMPORTANT
 * - This is the single source of truth for vocabulary, glove demo gestures and animations.
 * - Sensor signatures and placeholder motions are ILLUSTRATIVE. They are not measured data and
 *   they are not Nigerian Sign Language. No entry is marked "validated".
 * - To add verified NSL content later: record with Deaf NSL signers, have it reviewed by NSL
 *   linguists, then replace `motionId` with a verified animation clip and `signature` with
 *   real recorded sensor templates, and only then set `status: 'validated'`.
 */

export const CATEGORY_LABELS: Record<Category, string> = {
  greetings: 'Greetings',
  everyday: 'Everyday communication',
  health: 'Health and emergencies',
  education: 'Education',
  requests: 'Requests and assistance',
  responses: 'Common responses',
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  demo: 'Demonstration sample',
  awaiting: 'Awaiting linguistic validation',
  validated: 'Validated NSL content',
};

const sig = (
  fingers: SensorSignature['fingers'],
  roll: number,
  pitch: number,
  yaw: number,
  accel: number,
  gyro: number,
  confidence: number,
): SensorSignature => ({ fingers, imu: { roll, pitch, yaw, accel, gyro }, confidence });

const demo = (
  id: string,
  phrase: string,
  category: Category,
  motionId: string,
  signature: SensorSignature,
): LibraryEntry => ({ id, phrase, category, status: 'demo', motionId, signature });

const pending = (id: string, phrase: string, category: Category): LibraryEntry => ({
  id,
  phrase,
  category,
  status: 'awaiting',
});

export const LIBRARY: LibraryEntry[] = [
  // Greetings
  demo('hello', 'Hello', 'greetings', 'raise-sway', sig([10, 8, 8, 10, 12], 6, -18, 12, 1.4, 140, 0.94)),
  demo('good-morning', 'Good morning', 'greetings', 'rise-open', sig([14, 10, 10, 12, 14], -8, 34, 4, 0.9, 85, 0.92)),
  demo('how-are-you', 'How are you?', 'greetings', 'both-forward', sig([55, 12, 14, 62, 70], 18, 8, -22, 1.1, 110, 0.9)),
  demo('goodbye', 'Goodbye', 'greetings', 'wave-out', sig([6, 5, 5, 6, 8], 12, -30, 26, 1.7, 180, 0.95)),
  pending('good-afternoon', 'Good afternoon', 'greetings'),
  pending('good-evening', 'Good evening', 'greetings'),
  pending('nice-to-meet-you', 'Nice to meet you', 'greetings'),

  // Everyday communication
  demo('thank-you', 'Thank you', 'everyday', 'chin-out', sig([20, 12, 12, 14, 16], -4, 24, 0, 1.0, 95, 0.93)),
  pending('please', 'Please', 'everyday'),
  pending('sorry', 'Sorry', 'everyday'),
  pending('excuse-me', 'Excuse me', 'everyday'),
  pending('what-is-your-name', 'What is your name?', 'everyday'),
  pending('my-name-is', 'My name is', 'everyday'),

  // Health and emergencies
  demo('i-need-water', 'I need water', 'health', 'cup', sig([68, 38, 44, 50, 56], 28, 52, 6, 0.8, 70, 0.88)),
  pending('i-am-sick', 'I am sick', 'health'),
  pending('i-am-in-pain', 'I am in pain', 'health'),
  pending('call-a-doctor', 'Call a doctor', 'health'),
  pending('emergency', 'Emergency', 'health'),

  // Education
  pending('i-do-not-understand', 'I do not understand', 'education'),
  pending('please-repeat', 'Please repeat', 'education'),
  pending('i-have-a-question', 'I have a question', 'education'),
  pending('where-is-the-classroom', 'Where is the classroom?', 'education'),

  // Requests and assistance
  demo('please-help-me', 'Please help me', 'requests', 'both-up', sig([30, 24, 24, 26, 28], 2, -42, 0, 1.6, 150, 0.91)),
  pending('please-wait', 'Please wait', 'requests'),
  pending('please-come-here', 'Please come here', 'requests'),
  pending('i-need-the-restroom', 'I need the restroom', 'requests'),
  pending('i-need-food', 'I need food', 'requests'),

  // Common responses
  demo('i-am-fine', 'I am fine', 'responses', 'chest-pat', sig([6, 88, 90, 90, 92], 0, 14, 0, 1.0, 80, 0.93)),
  demo('yes', 'Yes', 'responses', 'fist-bounce', sig([82, 90, 92, 90, 90], -6, 20, 0, 1.3, 130, 0.96)),
  demo('no', 'No', 'responses', 'side-shake', sig([22, 14, 16, 86, 88], 4, 0, 34, 1.5, 165, 0.95)),
  pending('i-understand', 'I understand', 'responses'),
  pending('i-do-not-know', 'I do not know', 'responses'),
];

export const sentence = (e: LibraryEntry) => (/[.?!]$/.test(e.phrase) ? e.phrase : `${e.phrase}.`);

export const datasetLabel = (e: LibraryEntry) =>
  e.status === 'validated'
    ? 'Validated dataset'
    : e.signature
      ? 'Simulated template only'
      : 'No recordings collected';

export const GESTURES = LIBRARY.filter((e) => e.signature);
export const findEntry = (id: string) => LIBRARY.find((e) => e.id === id);
