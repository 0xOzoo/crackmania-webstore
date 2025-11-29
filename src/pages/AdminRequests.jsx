import React, { useState, useEffect } from 'react';
import { Trash2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminRequests = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            const storedRequests = JSON.parse(localStorage.getItem('gameRequests') || '[]');
            setRequests(storedRequests.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid password');
        }
    };

    const handleDelete = (id) => {
        const updatedRequests = requests.filter(req => req.id !== id);
        setRequests(updatedRequests);
        localStorage.setItem('gameRequests', JSON.stringify(updatedRequests));
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 rounded-full">
                            <ShieldAlert size={48} className="text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Access Required</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter admin password"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                            Access Requests
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold">Game Requests</h1>
                    </div>
                    <div className="text-sm text-gray-400">
                        Total Requests: {requests.length}
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                        <p className="text-gray-400">No requests found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between group hover:border-gray-600 transition-colors">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-200">{req.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requested on {new Date(req.date).toLocaleDateString()} at {new Date(req.date).toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(req.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete Request"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRequests;
