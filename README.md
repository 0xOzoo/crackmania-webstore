# CrackMania WebStore

A modern web application for browsing and managing a game library with automatic Steam cover art integration.

## 🚀 Live Demo

**[View Live Demo](https://crackmania-webstore.vercel.app/)**

## Features

- 🎮 **Game Library Browser** - Browse games with a beautiful grid layout
- 🖼️ **Auto Cover Art** - Automatically fetches game covers from Steam API
- 🔍 **Real-time Search** - Filter games instantly as you type
- 📦 **Lazy Loading** - Covers load progressively as you scroll
- 💾 **Smart Caching** - localStorage caching for instant subsequent loads
- ⏱️ **5-Second Timeout** - Automatic fallback if Steam API is slow
- 🎨 **Modern UI** - Dark theme with glassmorphism effects
- 📱 **Responsive Design** - Works on all screen sizes
- 🔄 **Refresh Library** - Update game list on demand
- 📋 **Copy Links** - One-click link copying with toast notifications

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Custom CSS with modern effects
- **Icons**: Lucide React
- **Backend**: Express.js proxy server
- **APIs**: Steam API for game metadata

## Installation

```bash
# Install dependencies
npm install

# Start both servers (proxy + dev)
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── GameList.jsx      # Main game library component
│   │   └── GameList.css      # Styling with animations
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── proxy.js                  # Express proxy server
└── package.json
```

## How It Works

1. **Proxy Server** (`proxy.js`) fetches game data from a remote source and proxies Steam API requests
2. **Frontend** displays games in a responsive grid with lazy loading
3. **Intersection Observer** detects visible cards and triggers cover art fetching
4. **Steam API** provides game metadata and cover images
5. **Fallback System** uses a Pepe meme when covers aren't found or timeout

## Scripts

- `npm run dev` - Start both proxy and Vite dev server
- `npm run proxy` - Start only the proxy server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features in Detail

### Lazy Loading

Covers load as you scroll, with a 200px lookahead for smooth experience.

### Caching

All fetched metadata is cached in localStorage for instant loading on refresh.

### Timeout Protection

If Steam API takes longer than 5 seconds, automatically shows fallback image.

### Search

Real-time filtering with debounced metadata fetching for optimal performance.

## License

MIT

## Author

Built with ❤️ for the gaming community
