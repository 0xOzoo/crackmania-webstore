import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());

// Proxy endpoint for Steam API
app.get('/api/steam', async (req, res) => {
    try {
        const searchTerm = req.query.term;

        if (!searchTerm) {
            return res.status(400).json({ error: 'Missing search term' });
        }

        const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(searchTerm)}&l=english&cc=US`;

        console.log(`Proxying request for: ${searchTerm}`);

        const response = await fetch(steamUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch from Steam API' });
    }
});

// Proxy endpoint for fetching games
app.get('/api/games', async (req, res) => {
    try {
        const targetUrl = 'https://myfiles.debrid.it/cw3a52v3j1/magnets/';
        console.log(`Fetching games from: ${targetUrl}`);

        const response = await fetch(targetUrl);
        const html = await response.text();

        // Simple regex to find links with allowed extensions
        // Allowed: exe, zip, iso, rar, 7z
        const regex = /<a href="([^"]+\.(exe|zip|iso|rar|7z))">([^<]+)<\/a>/gi;
        const games = [];
        let match;

        while ((match = regex.exec(html)) !== null) {
            // match[1] is the href, match[3] is the text (filename)
            // The href in the example output seemed to be relative or full. 
            // Based on the read_url_content output: [Clone.Drone.in.the.Hyperdome.rar](https://myfiles.debrid.it/cw3a52v3j1/magnets/Clone.Drone.in.the.Hyperdome.rar)
            // It seems standard Apache/Nginx directory listing.

            const filename = match[3];
            const href = match[1];

            // Construct full URL if relative
            const fullUrl = href.startsWith('http') ? href : new URL(href, targetUrl).toString();

            games.push({
                name: filename,
                url: fullUrl,
                type: href.split('.').pop()
            });
        }

        res.json(games);
    } catch (error) {
        console.error('Game fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
    console.log(`\n✅ Proxy server running on http://localhost:${PORT}`);
    console.log(`📡 Steam API endpoint: http://localhost:${PORT}/api/steam?term=GAME_NAME\n`);
});
