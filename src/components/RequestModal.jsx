import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const RequestModal = ({ isOpen, onClose }) => {
    const [gameName, setGameName] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!gameName.trim()) return;

        // Get existing requests
        const existingRequests = JSON.parse(localStorage.getItem('gameRequests') || '[]');

        // Add new request
        const newRequest = {
            id: Date.now(),
            name: gameName.trim(),
            date: new Date().toISOString()
        };

        localStorage.setItem('gameRequests', JSON.stringify([...existingRequests, newRequest]));

        setSubmitted(true);
        setGameName('');

        // Close after a brief success message
        setTimeout(() => {
            setSubmitted(false);
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Request a Game</h2>
                    <p className="text-gray-400 mb-6">Can't find what you're looking for? Let us know!</p>

                    {submitted ? (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                            <p className="text-green-400 font-medium">Request received! We'll look into it.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="gameName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Game Name
                                </label>
                                <input
                                    type="text"
                                    id="gameName"
                                    value={gameName}
                                    onChange={(e) => setGameName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                                    placeholder="e.g. Half-Life 3"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!gameName.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Send size={18} />
                                <span>Submit Request</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestModal;
