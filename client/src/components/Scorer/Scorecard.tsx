import React from 'react';
import type { MatchStats } from '../../types';
import clsx from 'clsx';

interface ScorecardProps {
    stats: MatchStats;
    inningsNumber?: number;
}

const Scorecard: React.FC<ScorecardProps> = ({ stats, inningsNumber = 1 }) => {
    return (
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">📊</div>
                    <h3 className="text-white font-bold tracking-tight">Full Scorecard</h3>
                </div>
                <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Innings {inningsNumber}</div>
            </div>

            <div className="p-1 space-y-1">
                {/* Batting Section */}
                <section className="bg-white rounded-[2rem] p-6 shadow-inner">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Batting Analysis</h4>
                        <div className="grid gap-4 text-right" style={{ gridTemplateColumns: '1fr 3rem 3rem 4rem 4rem 4rem' }}>
                            <span></span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">4s</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">6s</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center border-l border-slate-50">SR</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">R</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">B</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {Object.values(stats.batters).map(b => (
                            <div key={b.id}
                                className={clsx(
                                    "p-4 rounded-[1.5rem] transition-all duration-300 border",
                                    b.isOut
                                        ? "bg-slate-50 border-slate-100 opacity-60 grayscale"
                                        : "bg-white border-slate-100 shadow-sm hover:border-blue-100"
                                )}
                                style={{ display: 'grid', gridTemplateColumns: '1fr 3rem 3rem 4rem 4rem 4rem', alignItems: 'center' }}
                            >
                                <div className="flex flex-col min-w-0 pr-4">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "font-black text-base tracking-tight leading-none truncate",
                                            b.isOut ? "text-slate-400" : "text-slate-900"
                                        )}>
                                            {b.name}
                                        </span>
                                        {stats.currentStrikerId === b.id && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 block h-3">
                                        {b.isOut ? b.dismissal : (stats.currentStrikerId === b.id || stats.currentNonStrikerId === b.id ? 'Not Out*' : '')}
                                    </span>
                                </div>
                                <span className="text-center font-bold text-slate-500">{b.fours}</span>
                                <span className="text-center font-bold text-slate-500">{b.sixes}</span>
                                <span className="text-center font-mono font-bold text-xs border-l border-slate-100 text-blue-600">
                                    {b.balls > 0 ? (b.runs / b.balls * 100).toFixed(0) : '0'}
                                </span>
                                <span className="text-center text-xl font-black font-mono leading-none tracking-tighter text-slate-900">{b.runs}</span>
                                <span className="text-center text-[10px] font-bold uppercase font-mono text-slate-400">{b.balls}</span>
                            </div>
                        ))}
                    </div>

                    {/* Extras & Total Summary */}
                    <div className="mt-8 pt-6 border-t border-slate-100 px-2 space-y-4">
                        <div className="flex justify-between items-center text-slate-500">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Extras & Penalties</span>
                            <div className="text-right flex items-center gap-4">
                                <span className="text-[9px] font-bold opacity-60 uppercase">W:{stats.extras.wide} N:{stats.extras.noball} B:{stats.extras.bye} L:{stats.extras.legbye}</span>
                                <span className="font-black text-xl text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">{stats.extras.total}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Score</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tighter">{stats.score}</span>
                                <span className="text-2xl font-bold text-blue-500">/</span>
                                <span className="text-4xl font-black text-blue-500 tracking-tighter">{stats.wickets}</span>
                                <div className="ml-4 flex flex-col items-end">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Overs</span>
                                    <span className="text-lg font-black text-white/90 leading-none">{stats.overs}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bowling Section */}
                <section className="bg-slate-50 rounded-[2rem] p-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bowling Figures</h4>
                        <div className="grid gap-3 text-right" style={{ gridTemplateColumns: '1fr 3.5rem 2.5rem 3.5rem 3.5rem 4.5rem 2.5rem 2.5rem' }}>
                            <span></span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">O</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">M</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">R</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center text-blue-400">W</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center border-l bg-slate-100/50 rounded-t-lg">ECON</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">WD</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase text-center">NB</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {Object.values(stats.bowlers).map(b => (
                            <div key={b.id}
                                className="p-4 bg-white rounded-2xl border border-slate-100 transition-all hover:shadow-md"
                                style={{ display: 'grid', gridTemplateColumns: '1fr 3.5rem 2.5rem 3.5rem 3.5rem 4.5rem 2.5rem 2.5rem', alignItems: 'center' }}
                            >
                                <div className="flex flex-col min-w-0 pr-4">
                                    <span className="font-black text-slate-900 truncate">{b.name}</span>
                                    {stats.currentBowlerId === b.id && <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">In Attack</span>}
                                </div>
                                <span className="text-center font-mono font-bold text-slate-600">{b.overs}</span>
                                <span className="text-center font-mono font-bold text-slate-300">{b.maidens}</span>
                                <span className="text-center font-mono font-bold text-slate-600">{b.runs}</span>
                                <span className="text-center font-mono font-black text-xl text-blue-500">{b.wickets}</span>
                                <span className="text-center font-mono font-bold border-l border-slate-100 bg-slate-50/50 py-1 rounded-lg text-xs">{b.economy}</span>
                                <span className="text-center font-mono font-bold text-slate-300 text-[10px]">{b.wides || 0}</span>
                                <span className="text-center font-mono font-bold text-slate-300 text-[10px]">{b.noBalls || 0}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Scorecard;
