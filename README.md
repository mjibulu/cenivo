# Cenivo

Cenivo is a video conferencing and streaming product for meetings, presentations, scheduled sessions, recordings, access control, and reporting.

This repository contains an interactive demo of a Cenivo meeting, from joining to the end of the call.

**Live preview:** [https://mjibulu.github.io/cenivo](https://mjibulu.github.io/cenivo)

**Cenivo:** [https://cenivo.com](https://cenivo.com)

## About Cenivo

Cenivo covers the stages around a live session, including preparation, participant entry, the session itself, and what happens after it ends.

Sessions can be created in advance, scheduled, shared with participants, and managed through access controls such as waiting rooms and session locks.

During a session, the interface supports meetings and presentation-style formats. After a session, recordings, attendance information, and reports can be reviewed from the relevant sections of the product.

## Included in This Repository

The demo places the visitor in a product team meeting that is already in progress:

- Device check before joining, with camera preview, microphone level and device selection
- Waiting room, where the host admits the visitor
- Grid and speaker layouts, with pinning
- Active speaker detection, including the visitor's own microphone
- Live captions for each speaker
- Chat, with replies from other participants
- Reactions and raised hands
- A shared slide presentation, and screen sharing from the visitor's browser
- Recording, with a visible indicator and timer
- Host controls: admit or deny a late guest, mute, mute all, lower a hand, remove a participant
- A summary of the meeting after leaving
- Responsive layouts for desktop and mobile

The other participants are simulated. Their speaking, chat messages, reactions and presentation follow a short script, so each visit shows the same meeting.

## Camera and Microphone

Turning on the camera and microphone is optional. They are used only to show the visitor's own tile and microphone level. Nothing is recorded, uploaded or sent to another participant.

## Demo Routes

- `#/` overview
- `#/join` device check
- `#/lobby` waiting room
- `#/meeting` the meeting
- `#/summary` after leaving

## Keyboard Shortcuts

In the meeting:

- `M` microphone
- `V` camera
- `H` raise or lower hand
- `C` chat
- `P` people

Open the hosted version here:

[https://mjibulu.github.io/cenivo](https://mjibulu.github.io/cenivo)

## Cenivo.com

This repository only contains selected parts of Cenivo.

For access to the full product, current product information, or enquiries about contributing, collaborating, or joining the team, visit:

**[cenivo.com](https://cenivo.com)**

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

The camera and microphone need `localhost` or an `https` address.

To build the static site:

```bash
npm run build
```

The output in `dist/` can be served from any static host, including a subfolder. Pushing to `main` publishes it to GitHub Pages.

## Technology

- React
- TypeScript
- Vite
- Lucide Icons
- Custom CSS