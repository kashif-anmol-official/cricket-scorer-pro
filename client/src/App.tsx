import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MatchSetup from './components/MatchSetup';
import Scorer from './components/Scorer';
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <div className="min-h-screen relative overflow-x-hidden">
                    {/* Background Decorations */}
                    <div className="bg-blob blob-blue"></div>
                    <div className="bg-blob blob-purple"></div>

                    <Navbar />
                    <main className="relative z-10 px-4 py-8">
                        <Routes>
                            <Route path="/" element={<MatchSetup />} />
                            <Route path="/match/:id" element={<Scorer />} />
                        </Routes>
                    </main>

                    {/* Floating UI Decorative Elements */}
                    <div className="fixed bottom-0 left-0 p-8 opacity-20 pointer-events-none text-8xl grayscale">🏏</div>
                </div>
            </Router>
        </QueryClientProvider>
    )
}

export default App
