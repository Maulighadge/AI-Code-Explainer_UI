# AI Code Explainer — Frontend UI 🎨

Beautiful React + Vite frontend for the AI Code Explainer app.

## Features

- **Syntax-highlighted code editor** powered by CodeMirror 6
- **Language selection** — Python, JavaScript, Go
- **4 analysis modes**: Explain · Complexity · Improve · Tests
- **Analyze All** — run every analysis with one click
- **Code history** persisted in `localStorage`
- **One-click copy** for all generated outputs
- Dark, premium UI with glassmorphism & smooth animations

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Maulighadge/AI-Code-Explainer_UI.git
cd AI-Code-Explainer_UI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
# .env is already configured for local backend
# Edit VITE_API_URL if your backend runs on a different port
```

### 4. Start the dev server
```bash
npm run dev
```

App runs at: `http://localhost:5173`

> Make sure the **backend API** is running at `http://localhost:8000` first!
> See: [AI-Code-Explainer_Api](https://github.com/Maulighadge/AI-Code-Explainer_Api)

## Tech Stack

- **Vite + React 18** — Fast build tooling
- **CodeMirror 6** (`@uiw/react-codemirror`) — Code editor
- **react-markdown** — Markdown rendering for AI output
- **react-hot-toast** — Toast notifications
- **Vanilla CSS** — Custom design system (no Tailwind)

## Project Structure

```
AI-Code-Explainer_UI/
├── src/
│   ├── App.jsx                    # Root component
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Full design system
│   ├── hooks/
│   │   └── useAnalysis.js         # API call hook
│   ├── utils/
│   │   └── history.js             # localStorage history utils
│   └── components/
│       ├── ResultPanel.jsx        # Tabbed result display
│       └── HistoryDrawer.jsx      # Slide-in history sidebar
├── index.html
├── .env                           # VITE_API_URL
└── vite.config.js
```

## License

MIT
