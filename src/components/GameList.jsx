import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Gamepad2, Search, ImageOff, Copy, Check } from 'lucide-react';
import './GameList.css';

const SkeletonCard = () => (
    <div className="game-card skeleton-card">
        <div className="card-image-container skeleton-image"></div>
        <div className="card-content">
            <div className="skeleton-text title-skeleton"></div>
            <div className="skeleton-text button-skeleton"></div>
        </div>
    </div>
);

const Toast = ({ message }) => (
    <div className="toast-notification">
        <Check size={16} />
        {message}
    </div>
);

const GameList = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [gameMetadata, setGameMetadata] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Link copied to clipboard!');
    };

    const fetchGames = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/games');
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            const data = await response.json();
            console.log('Fetched games:', data);
            setGames(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    // Helper to clean game name for search
    const cleanGameName = (filename) => {
        return filename
            .replace(/\.(exe|zip|iso|rar|7z)$/i, '') // Remove extension
            .replace(/v\d+(\.\d+)*.*/i, '') // Remove version numbers
            .replace(/[\._-]/g, ' ') // Replace separators with spaces
            .replace(/\[.*?\]|\(.*?\)/g, '') // Remove brackets/parentheses content
            .replace(/(repack|multi|french|english|iso|codex|rune|tenoke|flt|skidrow|dodi|fitgirl).*/i, '') // Remove common release tags
            .trim();
    };

    // Fetch metadata for visible games
    useEffect(() => {
        const fetchMetadata = async () => {
            const filteredGames = games.filter(game =>
                game.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Limit concurrent requests or just fetch for top results
            const gamesToFetch = filteredGames.slice(0, 20).filter(game => !gameMetadata[game.name]);

            for (const game of gamesToFetch) {
                const cleanName = cleanGameName(game.name);
                if (!cleanName) continue;

                try {
                    const response = await fetch(`http://localhost:3001/api/steam?term=${encodeURIComponent(cleanName)}`);
                    const data = await response.json();

                    if (data.items && data.items.length > 0) {
                        setGameMetadata(prev => ({
                            ...prev,
                            [game.name]: {
                                image: data.items[0].tiny_image,
                                id: data.items[0].id
                            }
                        }));
                    }
                } catch (err) {
                    console.warn(`Failed to fetch metadata for ${game.name}`, err);
                }
            }
        };

        const timeoutId = setTimeout(fetchMetadata, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [games, searchQuery, gameMetadata]);

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="game-list-container">
            {toast && <Toast message={toast} />}

            <div className="library-header">
                <h2 className="library-title">
                    <Gamepad2 size={40} className="text-indigo-400" />
                    CrackMania WebStore
                </h2>

                <div className="controls-container">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button
                        onClick={fetchGames}
                        disabled={loading}
                        className="refresh-button"
                        title="Refresh Library"
                    >
                        <RefreshCw className={loading ? 'spin' : ''} size={18} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="games-grid">
                {loading ? (
                    Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    filteredGames.map((game, index) => {
                        const metadata = gameMetadata[game.name];
                        const cleanName = cleanGameName(game.name);

                        return (
                            <div key={index} className="game-card group">
                                <div className="card-image-container">
                                    {metadata?.image ? (
                                        <img
                                            src={metadata.image}
                                            alt={cleanName}
                                            className="game-cover"
                                        />
                                    ) : (
                                        <div className="no-image">
                                            <ImageOff size={48} />
                                        </div>
                                    )}
                                    <div className="file-type-badge">
                                        {game.type}
                                    </div>
                                </div>

                                <div className="card-content">
                                    <h3 className="game-title" title={game.name}>
                                        {cleanName || game.name}
                                    </h3>

                                    <div className="card-actions">
                                        <button
                                            onClick={() => copyToClipboard(game.url)}
                                            className="action-btn copy-btn"
                                            title="Copy Link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <a
                                            href={game.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn download-btn"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!loading && filteredGames.length === 0 && !error && (
                <div className="empty-state">
                    <Gamepad2 className="empty-icon" />
                    <p>No games found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default GameList;
