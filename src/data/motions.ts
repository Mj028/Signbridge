/**
 * Placeholder motion templates for the illustrative avatar.
 *
 * These are generic arm movements used ONLY to demonstrate the animation pipeline.
 * They are NOT Nigerian Sign Language (nor ASL/BSL). The avatar UI always says so.
 *
 * Angles are in degrees, per arm: [shoulder, elbow].
 *   shoulder: 0 = arm hanging down, 90 = out to the side, 180 = straight up
 *   elbow:    0 = straight, positive = forearm curls up/inward
 * `hl`/`hr` = hand openness (0 closed .. 1 open).
 *
 * Replace these with verified NSL clips (skeleton keyframes, video, or Lottie) by pointing
 * `LibraryEntry.motionId` at a new provider. See README → "Adding verified NSL content".
 */

export interface Pose {
  L: [number, number];
  R: [number, number];
  hl: number;
  hr: number;
}
export interface Keyframe extends Pose {
  t: number; // 0..1
}
export interface Motion {
  id: string;
  label: string;
  duration: number; // ms at 1x speed
  frames: Keyframe[];
}

export const REST: Pose = { L: [8, 6], R: [8, 6], hl: 0.45, hr: 0.45 };

const k = (
  t: number,
  L: [number, number],
  R: [number, number],
  hl = 0.5,
  hr = 0.5,
): Keyframe => ({ t, L, R, hl, hr });

export const MOTIONS: Record<string, Motion> = {
  'raise-sway': {
    id: 'raise-sway',
    label: 'Placeholder motion 1 · raise and sway',
    duration: 2400,
    frames: [
      k(0, REST.L, REST.R, 0.45, 0.45),
      k(0.25, REST.L, [150, 30], 0.45, 1),
      k(0.45, REST.L, [150, 8], 0.45, 1),
      k(0.65, REST.L, [150, 34], 0.45, 1),
      k(0.82, REST.L, [150, 8], 0.45, 1),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'rise-open': {
    id: 'rise-open',
    label: 'Placeholder motion 2 · slow rise',
    duration: 2800,
    frames: [
      k(0, REST.L, REST.R),
      k(0.4, [70, 70], [70, 70], 0.7, 0.7),
      k(0.8, [125, 20], [125, 20], 1, 1),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'both-forward': {
    id: 'both-forward',
    label: 'Placeholder motion 3 · both hands out',
    duration: 2600,
    frames: [
      k(0, REST.L, REST.R),
      k(0.3, [55, 95], [55, 95], 1, 1),
      k(0.55, [40, 80], [40, 80], 1, 1),
      k(0.8, [55, 95], [55, 95], 1, 1),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'chin-out': {
    id: 'chin-out',
    label: 'Placeholder motion 4 · hand to chin and out',
    duration: 2400,
    frames: [
      k(0, REST.L, REST.R),
      k(0.35, REST.L, [28, 165], 0.45, 1),
      k(0.7, REST.L, [58, 100], 0.45, 1),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'chest-pat': {
    id: 'chest-pat',
    label: 'Placeholder motion 5 · hand to chest',
    duration: 2200,
    frames: [
      k(0, REST.L, REST.R),
      k(0.3, REST.L, [26, 128], 0.45, 0),
      k(0.5, REST.L, [34, 118], 0.45, 0),
      k(0.7, REST.L, [26, 128], 0.45, 0),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'both-up': {
    id: 'both-up',
    label: 'Placeholder motion 6 · both arms up',
    duration: 2600,
    frames: [
      k(0, REST.L, REST.R),
      k(0.3, [140, 40], [140, 40], 1, 1),
      k(0.5, [140, 15], [140, 15], 1, 1),
      k(0.7, [140, 40], [140, 40], 1, 1),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  cup: {
    id: 'cup',
    label: 'Placeholder motion 7 · hand to mouth',
    duration: 2500,
    frames: [
      k(0, REST.L, REST.R),
      k(0.35, REST.L, [30, 160], 0.45, 0.6),
      k(0.6, REST.L, [34, 172], 0.45, 0.6),
      k(0.85, REST.L, [30, 160], 0.45, 0.6),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'fist-bounce': {
    id: 'fist-bounce',
    label: 'Placeholder motion 8 · fist bounce',
    duration: 2000,
    frames: [
      k(0, REST.L, REST.R),
      k(0.25, REST.L, [42, 105], 0.45, 0),
      k(0.4, REST.L, [42, 80], 0.45, 0),
      k(0.55, REST.L, [42, 105], 0.45, 0),
      k(0.7, REST.L, [42, 80], 0.45, 0),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'side-shake': {
    id: 'side-shake',
    label: 'Placeholder motion 9 · side to side',
    duration: 2200,
    frames: [
      k(0, REST.L, REST.R),
      k(0.25, REST.L, [75, 55], 0.45, 0.8),
      k(0.4, REST.L, [105, 55], 0.45, 0.8),
      k(0.55, REST.L, [75, 55], 0.45, 0.8),
      k(0.7, REST.L, [105, 55], 0.45, 0.8),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
  'wave-out': {
    id: 'wave-out',
    label: 'Placeholder motion 10 · wide wave',
    duration: 2600,
    frames: [
      k(0, REST.L, REST.R),
      k(0.25, REST.L, [128, 45], 0.45, 1),
      k(0.4, REST.L, [128, 5], 0.45, 1),
      k(0.55, REST.L, [128, 45], 0.45, 1),
      k(0.7, REST.L, [128, 5], 0.45, 1),
      k(1, REST.L, REST.R, 0.45, 0.45),
    ],
  },
};

const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function interpolate(motion: Motion, p: number): Pose {
  const f = motion.frames;
  if (p <= f[0].t) return f[0];
  if (p >= f[f.length - 1].t) return f[f.length - 1];
  let i = 0;
  while (i < f.length - 1 && p > f[i + 1].t) i++;
  const a = f[i];
  const b = f[i + 1];
  const t = ease((p - a.t) / (b.t - a.t));
  return {
    L: [lerp(a.L[0], b.L[0], t), lerp(a.L[1], b.L[1], t)],
    R: [lerp(a.R[0], b.R[0], t), lerp(a.R[1], b.R[1], t)],
    hl: lerp(a.hl, b.hl, t),
    hr: lerp(a.hr, b.hr, t),
  };
}
