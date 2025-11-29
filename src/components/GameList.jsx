import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Gamepad2, Search, Copy, Check } from 'lucide-react';
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
    const [visibleGames, setVisibleGames] = useState(new Set());

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

    const cleanGameName = (filename) => {
        return filename
            .replace(/\.(exe|zip|iso|rar|7z)$/i, '')
            .replace(/v\d+(\.\d+)*.*/i, '')
            .replace(/[\._-]/g, ' ')
            .replace(/\[.*?\]|\(.*?\)/g, '')
            .replace(/(repack|multi|french|english|iso|codex|rune|tenoke|flt|skidrow|dodi|fitgirl).*/i, '')
            .trim();
    };

    useEffect(() => {
        const cached = localStorage.getItem('gameMetadataCache');
        if (cached) {
            try {
                setGameMetadata(JSON.parse(cached));
            } catch (err) {
                console.warn('Failed to load cached metadata', err);
            }
        }
    }, []);

    useEffect(() => {
        if (Object.keys(gameMetadata).length > 0) {
            localStorage.setItem('gameMetadataCache', JSON.stringify(gameMetadata));
        }
    }, [gameMetadata]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const gameName = entry.target.dataset.gameName;
                        if (gameName) {
                            setVisibleGames(prev => new Set([...prev, gameName]));
                        }
                    }
                });
            },
            {
                rootMargin: '200px',
                threshold: 0.1
            }
        );

        const cards = document.querySelectorAll('.game-card[data-game-name]');
        cards.forEach(card => observer.observe(card));

        return () => observer.disconnect();
    }, [games, searchQuery]);

    useEffect(() => {
        if (visibleGames.size === 0) return;

        const fetchMetadata = async () => {
            const gamesToFetch = Array.from(visibleGames).filter(
                gameName => !gameMetadata[gameName]
            );

            if (gamesToFetch.length === 0) return;

            const batchSize = 5;
            for (let i = 0; i < gamesToFetch.length; i += batchSize) {
                const batch = gamesToFetch.slice(i, i + batchSize);

                const fetchPromises = batch.map(async (gameName) => {
                    const cleanName = cleanGameName(gameName);
                    if (!cleanName) return null;

                    try {
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('timeout')), 5000)
                        );

                        const fetchPromise = fetch(`http://localhost:3001/api/steam?term=${encodeURIComponent(cleanName)}`)
                            .then(response => response.json());

                        const data = await Promise.race([fetchPromise, timeoutPromise]);

                        if (data.items && data.items.length > 0) {
                            return {
                                gameName: gameName,
                                metadata: {
                                    image: data.items[0].tiny_image,
                                    id: data.items[0].id
                                }
                            };
                        }
                    } catch (err) {
                        if (err.message === 'timeout') {
                            console.warn(`Timeout fetching metadata for ${gameName}, using fallback`);
                        } else {
                            console.warn(`Failed to fetch metadata for ${gameName}`, err);
                        }
                        return {
                            gameName: gameName,
                            metadata: {
                                image: 'https://www.memeatlas.com/images/pepes/pepe-board-nailed-to-head.png',
                                id: null
                            }
                        };
                    }
                    return null;
                });

                const results = await Promise.all(fetchPromises);

                const newMetadata = {};
                results.forEach(result => {
                    if (result) {
                        newMetadata[result.gameName] = result.metadata;
                    }
                });

                if (Object.keys(newMetadata).length > 0) {
                    setGameMetadata(prev => ({ ...prev, ...newMetadata }));
                }

                if (i + batchSize < gamesToFetch.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        };

        const timeoutId = setTimeout(fetchMetadata, 300);
        return () => clearTimeout(timeoutId);
    }, [visibleGames]);

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
                        const isLoading = visibleGames.has(game.name) && !metadata;
                        const fallbackImage = 'https://www.memeatlas.com/images/pepes/pepe-board-nailed-to-head.png';

                        return (
                            <div
                                key={index}
                                className="game-card group"
                                data-game-name={game.name}
                            >
                                <div className="card-image-container">
                                    {isLoading ? (
                                        <div className="image-loading">
                                            <div className="loading-spinner"></div>
                                        </div>
                                    ) : metadata?.image ? (
                                        <img
                                            src={metadata.image}
                                            alt={cleanName}
                                            className="game-cover"
                                            onError={(e) => {
                                                e.target.src = fallbackImage;
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={fallbackImage}
                                            alt={cleanName}
                                            className="game-cover fallback-image"
                                        />
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
