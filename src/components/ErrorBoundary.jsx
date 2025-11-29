import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-gray-800 p-8 rounded-xl border border-red-500/50 shadow-2xl max-w-md w-full text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            The application encountered an unexpected error.
                        </p>
                        {this.state.error && (
                            <div className="bg-gray-900 p-3 rounded-lg mb-6 text-left overflow-auto max-h-32 border border-gray-700">
                                <code className="text-xs text-red-400 font-mono">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <RefreshCw size={18} />
                            <span>Reload Application</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
