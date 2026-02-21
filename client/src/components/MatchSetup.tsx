import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMatch } from '../api';
import clsx from 'clsx';

const MatchSetup: React.FC = () => {
    const navigate = useNavigate();
    const [matchName, setMatchName] = useState('');
    const [teamAName, setTeamAName] = useState('');
    const [teamBName, setTeamBName] = useState('');
    const [oversLimit, setOversLimit] = useState(20);
    const [teamAPlayers, setTeamAPlayers] = useState('');
    const [teamBPlayers, setTeamBPlayers] = useState('');
    const [tossWinner, setTossWinner] = useState('');
    const [tossChoice, setTossChoice] = useState('bat');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const playersA = teamAPlayers.split('\n').filter(n => n.trim()).map(n => ({ name: n.trim() }));
            const playersB = teamBPlayers.split('\n').filter(n => n.trim()).map(n => ({ name: n.trim() }));

            if (playersA.length === 0) {
                for (let i = 1; i <= 11; i++) playersA.push({ name: `Player A${i}` });
            }
            if (playersB.length === 0) {
                for (let i = 1; i <= 11; i++) playersB.push({ name: `Player B${i}` });
            }

            const match = await createMatch({
                name: matchName || `${teamAName || 'Team A'} vs ${teamBName || 'Team B'}`,
                oversLimit,
                tossWinner: tossWinner || null,
                tossChoice: tossWinner ? tossChoice : null,
                teamA: { name: teamAName || 'Team A', players: playersA },
                teamB: { name: teamBName || 'Team B', players: playersB }
            });

            navigate(`/match/${match.id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create match');
        } finally {
            setLoading(false);
        }
    };

    const teamA = teamAName || 'Team A';
    const teamB = teamBName || 'Team B';

    return (
        <div className="max-w-4xl mx-auto p-8 animate-fade-in">
            <div className="glass-card p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-600 p-3 rounded-xl text-white text-2xl animate-bounce-slow">🏏</div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Match Setup</h1>
                        <p className="text-gray-500 text-sm">Configure your match details and playing XI</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <section className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-[0.2em] mb-4">Metadata</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Match Title</label>
                                        <input
                                            type="text"
                                            value={matchName}
                                            onChange={(e) => setMatchName(e.target.value)}
                                            className="w-full border-gray-100 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50 font-semibold"
                                            placeholder="e.g. Sunday League Final"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Overs Limit</label>
                                        <input
                                            type="number"
                                            value={oversLimit}
                                            onChange={(e) => setOversLimit(parseInt(e.target.value))}
                                            className="w-full border-gray-100 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-gray-50/50 font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-[0.2em] mb-4">Toss Result</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Who won the toss?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[teamA, teamB].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setTossWinner(t)}
                                                    className={clsx(
                                                        "p-4 rounded-2xl border font-bold transition-all text-sm",
                                                        tossWinner === t
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]"
                                                            : "bg-white border-gray-100 text-gray-600 hover:border-blue-200"
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {tossWinner && (
                                        <div className="animate-fade-in">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Decision</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['bat', 'bowl'].map(choice => (
                                                    <button
                                                        key={choice}
                                                        type="button"
                                                        onClick={() => setTossChoice(choice)}
                                                        className={clsx(
                                                            "p-4 rounded-2xl border font-bold transition-all text-sm uppercase tracking-widest",
                                                            tossChoice === choice
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]"
                                                                : "bg-white border-gray-100 text-gray-600 hover:border-blue-200"
                                                        )}
                                                    >
                                                        {choice} First
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl space-y-4">
                                <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                    {teamA} Setup
                                </h3>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter Team A Name"
                                    value={teamAName}
                                    onChange={(e) => setTeamAName(e.target.value)}
                                    className="w-full border-none p-4 rounded-2xl bg-white shadow-sm outline-none font-bold"
                                />
                                <textarea
                                    value={teamAPlayers}
                                    onChange={(e) => setTeamAPlayers(e.target.value)}
                                    className="w-full border-none p-4 rounded-2xl bg-white shadow-sm h-32 outline-none text-sm font-medium"
                                    placeholder="Enter/Paste Playing XI (one per line)..."
                                />
                            </div>

                            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl space-y-4">
                                <h3 className="font-bold text-orange-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                    {teamB} Setup
                                </h3>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter Team B Name"
                                    value={teamBName}
                                    onChange={(e) => setTeamBName(e.target.value)}
                                    className="w-full border-none p-4 rounded-2xl bg-white shadow-sm outline-none font-bold"
                                />
                                <textarea
                                    value={teamBPlayers}
                                    onChange={(e) => setTeamBPlayers(e.target.value)}
                                    className="w-full border-none p-4 rounded-2xl bg-white shadow-sm h-32 outline-none text-sm font-medium"
                                    placeholder="Enter/Paste Playing XI (one per line)..."
                                />
                            </div>
                        </section>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-5 rounded-3xl font-bold text-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] mt-4"
                    >
                        {loading ? 'Initializing Digital Scorer...' : '🚀 Start Professional Match'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MatchSetup;
