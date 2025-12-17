# ChatGPT Wrapped

Your year with ChatGPT, visualized. A local-first, privacy-focused "Spotify Wrapped" experience for your ChatGPT conversations.

**🔒 100% Private** — Your data never leaves your browser. No servers, no tracking, no uploads.

![ChatGPT Wrapped Preview](https://img.shields.io/badge/Status-Live-brightgreen)

## 🚀 Try It

**[gptwrapped.sanjeed.in](https://gptwrapped.sanjeed.in)** *(or run locally)*

## ✨ Features

- **Drag & drop** your ChatGPT export (ZIP or JSON)
- **Instant analysis** — all processing happens in your browser
- **Beautiful slides** with your personalized stats
- **Shareable summary card** for social media
- **Zero data collection** — we can't see your conversations even if we wanted to

## 📊 What You'll See

| Slide | What it shows |
|-------|---------------|
| Origin | When your ChatGPT journey began |
| Growth | Year-over-year usage increase |
| Conversations | Total chats this year |
| Words | How much you've written (in novels!) |
| Streak | Your longest consecutive days |
| Activity | GitHub-style contribution graph |
| Peak Time | When you chat most |
| Favorite Model | GPT-4, GPT-5, o3, etc. |
| Personality | Your usage pattern type |
| Summary Card | All stats in one shareable image |

## 🔐 Privacy & Trust

This is a **static website** with **no backend**. Here's how we ensure your privacy:

1. **No server uploads** — The file you drop is read by JavaScript in your browser
2. **No analytics** — No Google Analytics, no tracking pixels, nothing
3. **No cookies** — We don't store anything
4. **Open source** — Read every line of code below
5. **Works offline** — Once loaded, disconnect your internet and it still works

### How to verify

1. Open DevTools → Network tab
2. Upload your file
3. Watch — **zero network requests** are made with your data

## 🛠️ How It Works

```
┌─────────────────────────────────────────────────────────┐
│                     Your Browser                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐     ┌──────────────┐                 │
│   │  Your ZIP    │────▶│   JSZip      │                 │
│   │  or JSON     │     │  (extract)   │                 │
│   └──────────────┘     └──────┬───────┘                 │
│                               │                          │
│                               ▼                          │
│                      ┌──────────────┐                   │
│                      │  stats.js    │                   │
│                      │  (analyze)   │                   │
│                      └──────┬───────┘                   │
│                               │                          │
│                               ▼                          │
│                      ┌──────────────┐                   │
│                      │  slides.js   │                   │
│                      │  (render)    │                   │
│                      └──────┬───────┘                   │
│                               │                          │
│                               ▼                          │
│                      ┌──────────────┐                   │
│                      │   Your       │                   │
│                      │   Wrapped!   │                   │
│                      └──────────────┘                   │
│                                                          │
│            ❌ No data ever leaves this box              │
└─────────────────────────────────────────────────────────┘
```

## 📁 Code Structure

```
├── index.html      # Main page with upload UI
├── styles.css      # All styling
└── js/
    ├── parser.js   # ZIP/JSON file reading
    ├── stats.js    # Statistics computation
    ├── slides.js   # Slide HTML generation
    └── app.js      # Main application logic
```

### What each file does

| File | Purpose | Lines |
|------|---------|-------|
| `parser.js` | Extracts `conversations.json` from ZIP or reads JSON directly | ~70 |
| `stats.js` | Computes all metrics: counts, streaks, peak times, personality | ~280 |
| `slides.js` | Generates slide HTML from computed stats | ~250 |
| `app.js` | Handles UI, file drops, navigation | ~150 |

## 📥 How to Get Your ChatGPT Export

1. Go to [chat.openai.com](https://chat.openai.com)
2. Click your profile picture → **Settings**
3. Go to **Data Controls**
4. Click **Export data**
5. Wait for the email (usually 5-30 minutes)
6. Download the ZIP file
7. Drop it on ChatGPT Wrapped

## 🏃 Run Locally

No build step required. Just open the HTML file:

```bash
# Clone the repo
git clone https://github.com/sanjeed5/chatgpt-wrapped.git
cd chatgpt-wrapped

# Open in browser
open index.html
# or
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 📊 Data Structure Reference

The export ZIP contains several files. We **only read `conversations.json`**:

```
export.zip
├── conversations.json    ← We read this
├── user.json             ✗ Ignored (contains email, phone)
├── sora.json             ✗ Ignored
├── group_chats.json      ✗ Ignored
└── [attachments...]      ✗ Ignored
```

### conversations.json structure

```json
[
  {
    "title": "Chat title",
    "create_time": 1702345678.123,
    "default_model_slug": "gpt-5",
    "mapping": {
      "message-id": {
        "message": {
          "author": { "role": "user" | "assistant" },
          "content": { "parts": ["message text"] },
          "create_time": 1702345678.456
        }
      }
    }
  }
]
```

## 🎨 Tech Stack

- **Vanilla JavaScript** — No framework, no build step
- **JSZip** — For extracting ZIP files in-browser
- **CSS Variables** — For consistent theming
- **Google Fonts** — Inter + JetBrains Mono

## 🤝 Contributing

Contributions welcome! Some ideas:

- [ ] Add more personality types
- [ ] Export summary as image
- [ ] Support for Claude/other AI exports
- [ ] Localization

## 📄 License

MIT — Do whatever you want with it.

---

Built with 🖤 for the AI-curious.

*Not affiliated with OpenAI.*
