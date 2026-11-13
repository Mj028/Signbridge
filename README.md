# SIGNBRIDGE: Phase One interactive prototype

A web demo of a smart two-way communication system between Nigerian Sign Language (NSL) users and hearing people.
React + TypeScript + Vite. No backend, no API keys, no environment variables.

> **Honest status.** The glove, sensor data, gesture-recognition model and sign animations are **simulated or illustrative**.
> Nothing is marked as validated NSL. Speech recognition and text-to-speech use the browser's own APIs.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run typecheck
```

## Deploy to Vercel

**Option A: dashboard.** Push this folder to GitHub, then Vercel → Add New Project → import the repo. Vercel detects Vite
(build: `npm run build`, output: `dist`). Click Deploy.

**Option B: CLI.**
```bash
npm i -g vercel
vercel --prod
```

Notes
- Routing uses the URL hash (`#/app/...`), so no rewrite rules are needed.
- Microphone and speech recognition need **HTTPS** (Vercel provides it) and a supporting browser (Chrome, Edge, Safari).
  Firefox lacks speech recognition; the typed fallback keeps the app fully usable.
- `vercel.json` sets `Permissions-Policy: microphone=(self)`.

## Demo script (2 minutes)

1. Landing → **Try the Demo** → choose Text or Sign Mode → **Take the guided demo** (8 steps), or explore freely.
2. **Conversation**: say or type a message, then switch Text/Sign at the top; the Deaf screen updates instantly.
3. **Sign → Speech**: pick a gesture, watch sensors, recognition, confidence and spoken audio. Try "Simulate an uncertain result".
4. In Sign Mode, send "Nice to meet you" to see the honest "no sign available" fallback.

## Project structure

```
src/
  data/library.ts       single source of truth: vocabulary, statuses, simulated sensor signatures
  data/motions.ts       placeholder avatar motions (NOT NSL)
  lib/signMapping.ts    message → sign items (phrase lookup + honest fallbacks)
  lib/integration.ts    GloveTransport + GestureRecognizer interfaces and the simulated versions
  lib/stt.ts, tts.ts    Web Speech API wrappers
  state/AppContext.tsx  app state, settings (saved in localStorage), conversation, guided demo
  components/, pages/   UI
```

## Adding real hardware and verified NSL content

- **Glove:** implement `GloveTransport` with Web Bluetooth (ESP32 BLE notifications) and stream `SensorFrame`s.
- **Recognition:** implement `GestureRecognizer` (TensorFlow.js / ONNX / API). Swap it in `AppContext.tsx` where `SimulatedRecognizer` is created.
- **NSL content:** record with Deaf NSL signers, review with linguists, then replace `motionId` / `signature` in `library.ts`
  and only then set `status: 'validated'`. The library UI, filters and fallbacks already handle all three statuses.
