# Rachel & Jordan · Afterparty Games 🫓

Real-time party game for the wedding afterparty. Guests scan a QR code, type a name, and play on their phones. No logins.

| Route | Who | What |
|---|---|---|
| `/display` | TV / projector | Big screen: lobby + QR code, questions, results. No controls. |
| `/host` | MC (PIN protected) | Assign roles, run the game, test mode, reset. |
| `/play` | Everyone else | Name entry, then a screen that follows their role and the game. |

Stack: Vite + React, Firebase Realtime Database (asia-southeast1), Anonymous Auth, Firebase Hosting. All game state is in the database, so any screen can refresh and pick up where the game is.

## Editing questions

All question banks are plain JSON in `src/data/`. Edit, then redeploy (`npm run deploy`).

- `buzzer.json` · `type` is `mc` (with `options`, `answer` is a letter) or `open` (`answer` is text)
- `matching.json` · `type` is `text` (whiteboard) or `choice` (two `options`)
- `predictions.json` · 2–4 `options`
- `categories.json`, `forfeits.json` · lists of strings
- `event.json` · couple names, default team size, default categories turn length

## One-time setup

1. Paste your web config into `src/firebaseConfig.js`, and your project id into `.firebaserc`.
2. `npm install`
3. `firebase login`
4. `npm run deploy` (builds, deploys hosting + database rules)
5. `npm run set-pin -- 2468` sets the host PIN (stored at `/secret/hostPin`; no browser can read it). Changing it logs out every host.

## Security model

- Every device signs in anonymously and invisibly. Each browser profile / incognito window is its own player.
- Guests can only write their own player record (name, presence; role only while test mode is on).
- A device becomes host by writing the PIN to `hosts/<uid>`; the database rules compare it to `/secret/hostPin`. Only hosts can write `config`, `game`, `scores` or other players' roles.

## Local development (optional)

```
firebase emulators:start --only auth,database --project demo-party
VITE_EMULATOR=1 npm run dev
```
