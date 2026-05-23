# Hearthfire

A digital companion for [Stonetop](https://www.kickstarter.com/projects/1956101682/stonetop) — the tabletop RPG by Jeremy Strandberg. Hearthfire lets your whole party manage characters, share game state, and reference playbook content in real time, all from the browser.

**Live:** [hearthfire.camp](https://hearthfire.camp)

---

## Features

- **Shared game sessions** — create a game and share the ID; anyone with the link can join
- **Character sheets** — full digital playbooks for all 9 character classes, with persistent form fields
- **GM playbook** — quick-reference material for the Gamemaster
- **Real-time sync** — Firestore keeps every player's view in sync without a page refresh
- **No account required** — access is gated only by the game ID

---

## Tech Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Framework | React 18 + TypeScript            |
| Build     | Vite                             |
| Routing   | React Router v6                  |
| Database  | Firebase Firestore               |
| Styling   | CSS Modules + clsx               |
| Hosting   | Firebase Hosting (custom domain) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled

### Installation

```bash
git clone git@github.com:gvorbeck/hearthfire.git
cd hearthfire
npm install
```

### Environment Variables

Copy the example env file and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Development

```bash
npm run dev
```

Starts a Vite dev server at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Output goes to `dist/`. Preview the build locally with:

```bash
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── primitives/       # Reusable UI (Button, Input, Checkbox, Dropdown, …)
│   ├── CharacterSheet/   # Per-playbook character form sections
│   ├── Playbook/         # Shared playbook content rendering
│   └── …                 # Modals, guards, navigation
├── hooks/
│   ├── useGame.ts        # Game state: load, update, add characters
│   └── useDebouncedSave.ts
├── lib/
│   ├── firebase.ts       # Firestore client
│   ├── constants.ts      # Playbook definitions
│   └── game.ts           # Game creation helpers
├── pages/
│   ├── Home/             # Create or join a game
│   ├── Game/             # Party roster and session hub
│   ├── CharacterPlaybook/ # Individual character sheet
│   └── GmPlaybook/       # GM reference
└── types/
    └── index.ts          # Shared TypeScript types
```

---

## Firebase Setup

Hearthfire uses Firestore (no authentication). The database structure is:

```
games (collection)
└── {gameId} (document)
    ├── id: string
    ├── name: string
    ├── createdAt: timestamp
    ├── characters: CharacterData[]
    ├── content: ContentLists
    ├── threats: string
    └── iWonder: string
```

Access is unrestricted by user account — anyone with a game ID can read and write it. Adjust your Firestore security rules accordingly for your deployment.

---

## Deployment

The app deploys automatically to Firebase Hosting via GitHub Actions on every push to `main`. No manual steps required — the workflow builds the project, injects Firebase env vars from repository secrets, and deploys to the live channel.

---

## Roadmap

- [x] All 9 playbooks — full content coverage
- [ ] Playbook inserts
  - [ ] Followers
  - [x] Inventory
  - [x] Animal Companion
  - [x] Crew
  - [x] Invocations
  - [x] Initiates of Danu
- [ ] Death-state playbooks
  - [x] Ghost
  - [x] Revenant
  - [x] Thrall
- [ ] Steading Playbook
- [ ] Arcana reference sheets

---

## License

This project is unofficial fan content. _Stonetop_ is designed by Jeremy Strandberg. All game content belongs to its respective owners. This tool is not affiliated with or endorsed by the Stonetop team.

The source code is available under the [MIT License](LICENSE).
