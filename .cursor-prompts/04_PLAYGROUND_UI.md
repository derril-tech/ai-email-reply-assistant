# 04_PLAYGROUND_UI.md — 2025 Playground UI Specification
*For project: AI-EMAIL-REPLY-ASSISTANT (OpenAI SDK + Gmail API)*  
**Author**: Frontend React Designer • Year: 2025  

---

## 🎨 Brand Palette (Light/Dark Mode)
| Purpose | Light | Dark | Notes |
|----------|-------|------|-------|
| Primary | `#5B86E5` | `#4472CA` | Calm electric blue accent for CTAs |
| Secondary | `#FFD166` | `#E6B85C` | Friendly gold for highlights |
| Background | `#F9FAFB` | `#0D1117` | Neutral background for high readability |
| Surface | `#FFFFFF` | `#1E222A` | Card & modal surfaces |
| Text | `#1A1A1A` | `#F4F4F4` | Adaptive text contrast |

Use Tailwind’s `theme.extend.colors` to inject the palette, and ensure shadcn/ui respects dark mode via `className="dark"` toggled at `<html>`.

---

## 🧩 Architecture: Single-Page, State-Driven
The Playground will be a **single React component tree** that transitions through the following states:
1. **Hero (No Auth)** → call-to-action to connect Gmail.
2. **Thread Picker** → fetch Gmail threads and show a list with previews.
3. **Compose View** → thread summary, tone/length controls, and draft panel.
4. **Result View** → shows generated reply, with buttons to regenerate, copy, or send.
5. **History/Sidebar** (collapsible) → previously generated drafts.

All transitions occur within one page using **Framer Motion** and **state context**.  
No page navigation reloads — only smooth component transitions.

---

## 🧭 Navigation & Layout
### Top Navigation (Desktop)
- Left: Logo + “AI Email Reply Assistant”
- Center: Theme toggle (sun/moon icon)
- Right: User avatar dropdown (profile, logout)

### Mobile Navigation (2025 pattern)
- **Hamburger menu** top-left with animated slide-out nav
- **Bottom navigation bar** (fixed, rounded corners, glassy effect)
  - 🏠 Home / Hero
  - 💬 Threads
  - ✉️ Playground
  - ⚙️ Settings
- Use motion-based icon transitions on tap.

### Footer (Modern 2025-style)
- 3-column layout: product info, quick links, and contact/social.
- Include copyright.
- Subtle gradient underline on hover.
- Responsive stacking for mobile.

---

## 🪄 Components & Features

### 1. Hero Section
- Minimal landing card: product logo + tagline “Reply Smarter. Faster. Politer.”
- Button: **“Connect Gmail”** → triggers OAuth popup flow.
- If authenticated, auto-transition to Thread Picker.

### 2. Thread Picker
- Search bar: “Search threads…” (fuzzy search)
- List: Gmail threads with avatars, subjects, last snippet, date.
- Click → transitions to Compose View with that thread loaded.
- Empty state illustration (shadcn `<EmptyPlaceholder />`).

### 3. Compose View
**Layout:** Two-column (collapsible to vertical on mobile)
- **Left Column:** Thread context
  - Subject, participants
  - Thread messages (scrollable bubble layout)
- **Right Column:** Draft panel
  - Tone selector (`friendly`, `formal`, `brief`)
  - Length slider (50–500 chars)
  - Bullets toggle
  - Button: “Generate Reply” → triggers `useAgent()`

**While generating:**
- Animated progress ring with pulse
- “Composing polite reply...” text with typing effect

**When done:**
- Animated draft text reveal
- Buttons:
  - 🔁 Regenerate (new variant)
  - 📋 Copy to Clipboard
  - ✉️ Send via Gmail (if implemented)

### 4. History Sidebar
- Collapsible panel (slide-in)
- List of past replies with meta tags (subject, tone)
- Clicking opens previous draft in preview.

---

## ⚙️ Interactions & Animations
- Use **Framer Motion** for transitions:
  - Fade-slide between sections
  - Spring in/out modals
  - Button tap feedback via scale ripple
- Use **Lucide icons** with subtle hover glows.
- Use **shadcn/ui Sheet, Dialog, Tooltip, Toast** for polished UX.

---

## 🧠 State Model
```tsx
type UIState =
  | "hero"
  | "threadPicker"
  | "compose"
  | "result";

const [uiState, setUIState] = useState<UIState>("hero");

State transitions are time-stamped in console for analytics.

React Context holds user + OAuth info.

🧩 Libraries to Showcase

TailwindCSS (base styles)

Framer Motion (animation)

shadcn/ui (cards, buttons, toggles)

Radix UI (dropdowns)

lucide-react (icons)

react-hot-toast (feedback)

clsx + tailwind-variants (conditional class management)

🧪 Performance & Accessibility

Use Suspense for Gmail fetches (React 19 streaming).

Lazy-load large components (thread context viewer).

Maintain 90+ Lighthouse score.

All interactive elements ARIA-labeled and tab-navigable.

Respect prefers-color-scheme media query on load.


here are the copy-ready files/snippets to wire up the 5-color palette + dark/light mode in your Next.js (React 19) app. they include a palette.ts, a ThemeProvider with next-themes, Tailwind config, and minimal usage examples:

/web/tailwind.config.ts:
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // important: controlled by next-themes 'class' strategy
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 5-color brand palette (light/dark friendly)
        primary: {
          DEFAULT: "#5B86E5",
          dark: "#4472CA",
          fg: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFD166",
          dark: "#E6B85C",
          fg: "#1A1A1A",
        },
        base: {
          // background layers
          DEFAULT: "#F9FAFB",
          dark: "#0D1117",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#1E222A",
        },
        text: {
          DEFAULT: "#1A1A1A",
          dark: "#F4F4F4",
          muted: "#6B7280",
        },

        // shadcn/ui semantic tokens mapped to our palette (via CSS vars)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primaryToken: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondaryToken: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        glass: "0 10px 40px rgba(0,0,0,0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;



