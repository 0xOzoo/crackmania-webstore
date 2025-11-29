import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2 } from 'lucide-react';

// Global queue to limit concurrent requests
const requestQueue = [];
let activeRequests = 0;
const MAX_CONCURRENT = 3;

const processQueue = () => {
    while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
        const request = requestQueue.shift();
        activeRequests++;
        request().finally(() => {
            activeRequests--;
            processQueue();
        });
    }
};

const CoverArt = ({ gameName }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!gameName) {
            setLoading(false);
            return;
        }

        const fetchCover = async () => {
            try {
                if (!mountedRef.current) return;

                // Clean game name
                const cleanName = gameName
                    .replace(/\.(zip|exe|rar|iso|bin|cue|7z|apk|msi|pkg|dmg|tar|gz|xz)$/i, '')
                    .replace(/v?\d+(\.\d+)+[a-z]?/gi, '')
                    .replace(/[\(\[].*?[\)\]]/g, '')
                    .replace(/[\._-]/g, ' ')
                    .replace(/(repack|goty|edition|remastered|remake|full|final|complete|collection)/gi, '')
                    .trim();

                if (cleanName.length < 2) {
                    if (mountedRef.current) {
                        setLoading(false);
                        setError(true);
                    }
                    return;
                }

                // Use local proxy server (make sure it's running on port 3001)
                const response = await fetch(`http://localhost:3001/api/steam?term=${encodeURIComponent(cleanName)}`);

                if (!response.ok) throw new Error('Proxy failed');
                if (!mountedRef.current) return;

                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    const appId = data.items[0].id;
                    setImageUrl(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`);
                } else {
                    setError(true);
                }
            } catch (err) {
                if (mountedRef.current) setError(true);
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };

        // Add to queue with delay
        const queueRequest = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    fetchCover().then(resolve);
                }, Math.random() * 2000);
            });
        };

        requestQueue.push(queueRequest);
        processQueue();

        return () => {
            mountedRef.current = false;
        };
    }, [gameName]);

    const handleImageError = () => {
        setError(true);
    };

    const displayName = gameName.replace(/\.(zip|exe|rar|iso|bin|cue|7z|apk|msi|pkg|dmg|tar|gz|xz)$/i, '');

    if (loading) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700/50 animate-pulse">
                <Gamepad2 size={32} className="text-gray-600 mb-3" />
                <h3 className="text-xs font-bold text-gray-500 text-center leading-tight line-clamp-2">
                    {displayName}
                </h3>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700/50">
                <div className="p-3 bg-blue-600/20 rounded-full mb-3">
                    <Gamepad2 size={32} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-300 text-center leading-tight line-clamp-3">
                    {displayName}
                </h3>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-900 relative group">
            <img
                src={imageUrl}
                alt={gameName}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default CoverArt;
