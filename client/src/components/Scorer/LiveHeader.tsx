import React from 'react';
import type { Match, MatchStats } from '../../types';
import clsx from 'clsx';

interface LiveHeaderProps {
    match: Match;
    strikerId?: string | null;
    onSwapStrike?: () => void;
    onRenamePlayer?: (id: string, currentName: string) => void;
}

const LiveHeader: React.FC<LiveHeaderProps> = ({ match, strikerId: manualStrikerId, onSwapStrike, onRenamePlayer }) => {
    const stats = match.liveScore as MatchStats;
    if (!stats) return null;

    const currentStrikerId = manualStrikerId || stats.currentStrikerId;

    const currentInnings = match.innings[match.innings.length - 1];
    const battingTeam = match.teams.find(t => t.id === currentInnings.battingTeamId);

    const inningsCount = match.innings.length;
    const isSecondInnings = inningsCount === 2;
    const firstInningsScore = match.innings[0]?.score || 0;
    const target = isSecondInnings ? (firstInningsScore + 1) : null;
    const runsNeeded = target ? (target - stats.score) : null;

    const crr = (stats.score / (stats.balls / 6 || 1)).toFixed(2);
    const ballsRemaining = (match.oversLimit * 6) - stats.balls;
    const oversRemaining = (ballsRemaining / 6).toFixed(1);
    const rrr = (runsNeeded !== null && ballsRemaining > 0) ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : "0.00";

    const prevInnings = isSecondInnings ? match.innings[0] : null;
    const prevTeam = isSecondInnings ? match.teams.find(t => t.id === prevInnings?.battingTeamId) : (match.teams.find(t => t.id !== currentInnings.battingTeamId));

    const currentBatters = Object.values(stats.batters).filter(b => !b.isOut && (b.id === currentStrikerId || b.id === stats.currentNonStrikerId));
    const currBowler = stats.currentBowlerId ? stats.bowlers[stats.currentBowlerId] : null;

    const TableCell = ({ label, value, subValue, highlight, className }: { label: string, value: string | number, subValue?: string, highlight?: boolean, className?: string }) => (
        <div className={clsx("flex-1 px-4 py-3 flex flex-col justify-center border-r border-white/5 last:border-r-0", className)}>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={clsx("text-xl font-mono font-black", highlight ? "text-blue-400" : "text-white")}>
                    {value}
                </span>
                {subValue && <span className="text-[10px] text-white/40 font-bold uppercase">{subValue}</span>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Tabular Broadcast Header */}
            <div className="glass-card-dark rounded-[2.5rem] overflow-hidden border-none shadow-2xl relative cricinfo-header">
                <div className="flex flex-col relative z-10">

                    {/* Row 1: Current Batting Team */}
                    <div className="flex border-b border-white/5 bg-white/5 cricinfo-battop">
                        <div className="w-1/3 px-6 py-4 flex flex-col justify-center border-r border-white/5">
                            <span className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Batting</span>
                            <h2 className="text-white text-xl font-black truncate tracking-tighter uppercase leading-tight cricinfo-high1">{battingTeam?.name}</h2>
                        </div>
                        <TableCell label="Runs/Wkts" value={stats.score} subValue={`/ ${stats.wickets}`} highlight className="bg-white/5" />
                        <TableCell label="Overs" value={stats.overs} subValue={`(${match.oversLimit})`} />
                        <TableCell label="CRR" value={crr} />
                    </div>

                    {/* Row 2: Second Team (Previous Score or Next) */}
                    <div className="flex border-b border-white/5 bg-white/[0.02] cricinfo-battop">
                        <div className="w-1/3 px-6 py-4 flex flex-col justify-center border-r border-white/5">
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Opposition</span>
                            <h3 className="text-white/60 text-lg font-black truncate tracking-tighter uppercase leading-tight cricinfo-high1">{prevTeam?.name}</h3>
                        </div>
                        <TableCell
                            label="Runs/Wkts"
                            value={prevInnings ? prevInnings.score! : '-'}
                            subValue={prevInnings ? `/ ${prevInnings.wickets}` : ''}
                        />
                        <TableCell label="Overs" value={prevInnings ? prevInnings.overs! : '-'} />
                        <TableCell label="CRR" value={prevInnings ? (prevInnings.score! / (prevInnings.overs! || 1)).toFixed(2) : '-'} />
                    </div>

                    {/* Row 3: Target & Equation Bar */}
                    {isSecondInnings && target && (
                        <div className="flex bg-blue-600/90 backdrop-blur-sm group">
                            <div className="w-1/3 px-6 py-5 flex flex-col justify-center border-r border-white/10 bg-blue-700/50">
                                <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Equation</span>
                                <div className="text-white font-black text-lg tracking-tight leading-tight">
                                    Need {runsNeeded} <span className="text-sm opacity-60">runs</span>
                                </div>
                            </div>
                            <div className="flex-1 px-4 py-5 flex flex-col justify-center border-r border-white/10">
                                <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mb-1">In Overs</span>
                                <span className="text-white text-xl font-mono font-black">{oversRemaining}</span>
                            </div>
                            <div className="flex-1 px-4 py-5 flex flex-col justify-center border-r border-white/10">
                                <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mb-1">RRR</span>
                                <span className="text-white text-xl font-mono font-black animate-pulse">{rrr}</span>
                            </div>
                            <div className="flex-1 px-4 py-5 flex flex-col justify-center bg-white/10">
                                <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Target</span>
                                <span className="text-white text-xl font-mono font-black">{target}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
            </div>

            {/* Live Players Detail Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Batters</h3>
                            <div className="flex items-center gap-3">
                                {onSwapStrike && (
                                    <button
                                        onClick={onSwapStrike}
                                        className="group flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-all duration-300 transform active:scale-95"
                                        title="Swap Strike"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">Change Striker</span>
                                    </button>
                                )}
                                <div className="flex gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {(currentBatters.length > 0 || stats.lastWicket) ? (
                                <>
                                    {/* Header Strip */}
                                    <div className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" style={{ display: 'grid', gridTemplateColumns: '1fr 3rem 3rem 4rem 4rem 4rem' }}>
                                        <span>Batter Name</span>
                                        <span className="text-center">4s</span>
                                        <span className="text-center">6s</span>
                                        <span className="text-center border-l border-slate-100/50">SR</span>
                                        <span className="text-center">Runs</span>
                                        <span className="text-center">Balls</span>
                                    </div>

                                    {currentBatters.map(b => (
                                        <div key={b.id}
                                            className={clsx(
                                                "items-center p-5 rounded-[2rem] transition-all duration-300 cursor-pointer group/batter shadow-sm",
                                                b.id === currentStrikerId
                                                    ? "bg-slate-900 text-white shadow-2xl scale-[1.01]"
                                                    : "bg-white border border-slate-100/50 text-slate-600 hover:border-blue-100"
                                            )}
                                            style={{ display: 'grid', gridTemplateColumns: '1fr 3rem 3rem 4rem 4rem 4rem' }}
                                            onClick={() => b.id !== currentStrikerId && onSwapStrike?.()}
                                        >
                                            <div className="flex flex-col min-w-0 pr-4">
                                                <div className="flex items-center gap-2 group/name">
                                                    <span className="font-black text-lg tracking-tight leading-none block truncate">
                                                        {b.name}{b.id === currentStrikerId ? '*' : ''}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onRenamePlayer?.(b.id, b.name); }}
                                                        className="opacity-0 group-hover/name:opacity-40 hover:!opacity-100 transition-opacity p-1 text-current"
                                                    >
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                    </button>
                                                </div>
                                                {b.id === currentStrikerId && (
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1 block tracking-[0.1em]">Striker</span>
                                                )}
                                            </div>
                                            <span className="text-center font-bold">{b.fours}</span>
                                            <span className="text-center font-bold">{b.sixes}</span>
                                            <span className={clsx(
                                                "text-center font-mono font-bold border-l",
                                                b.id === currentStrikerId ? "border-white/10" : "border-slate-100"
                                            )}>
                                                {((b.runs / (b.balls || 1)) * 100).toFixed(0)}
                                            </span>
                                            <span className="text-center text-2xl font-black font-mono leading-none tracking-tighter">{b.runs}</span>
                                            <span className={clsx(
                                                "text-center text-[11px] font-bold uppercase font-mono mt-1",
                                                b.id === currentStrikerId ? "opacity-40" : "opacity-30"
                                            )}>{b.balls}</span>
                                        </div>
                                    ))}

                                    {/* Show Last Dismissal if missing a batter */}
                                    {currentBatters.length < 2 && stats.lastWicket && (
                                        <div
                                            className="items-center p-5 rounded-[2rem] transition-all duration-300 bg-red-50 border border-red-100 text-red-700/60 opacity-80"
                                            style={{ display: 'grid', gridTemplateColumns: '1fr 3rem 3rem 4rem 4rem 4rem' }}
                                        >
                                            <div className="flex flex-col min-w-0 pr-4">
                                                <span className="font-black text-lg tracking-tight leading-none truncate">{stats.lastWicket.name}</span>
                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 block">{stats.lastWicket.dismissal}</span>
                                            </div>
                                            <span className="text-center font-bold">{stats.lastWicket.fours}</span>
                                            <span className="text-center font-bold">{stats.lastWicket.sixes}</span>
                                            <span className="text-center font-mono font-bold border-l border-red-100/50">
                                                {((stats.lastWicket.runs / (stats.lastWicket.balls || 1)) * 100).toFixed(0)}
                                            </span>
                                            <span className="text-center text-2xl font-black font-mono leading-none tracking-tighter">{stats.lastWicket.runs}</span>
                                            <span className="text-center text-[11px] font-bold uppercase font-mono mt-1 opacity-40">{stats.lastWicket.balls}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-slate-300 italic text-sm py-10 text-center bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100 uppercase font-black tracking-widest opacity-50">
                                    Awaiting Batters
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10 h-full flex flex-col">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Current attack</h3>
                        {currBowler ? (
                            <div className="space-y-4 flex-1 flex flex-col">
                                {/* Header Strip */}
                                <div className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" style={{ display: 'grid', gridTemplateColumns: '1fr 3.5rem 2.5rem 3.5rem 3.5rem 4.5rem 3rem 3rem' }}>
                                    <span>Bowler Name</span>
                                    <span className="text-center">O</span>
                                    <span className="text-center">M</span>
                                    <span className="text-center">R</span>
                                    <span className="text-center text-blue-500">W</span>
                                    <span className="text-center border-l border-slate-100/50 pl-2">ECON</span>
                                    <span className="text-center">WD</span>
                                    <span className="text-center">NB</span>
                                </div>

                                <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group/bowler border border-white/5 transition-transform duration-300 hover:scale-[1.01]">
                                    <div className="relative z-10 items-center text-white" style={{ display: 'grid', gridTemplateColumns: '1fr 3.5rem 2.5rem 3.5rem 3.5rem 4.5rem 3rem 3rem' }}>
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <div className="flex items-center gap-2 group/name">
                                                <span className="text-xl font-black tracking-tight leading-none block truncate">{currBowler.name}</span>
                                                <button
                                                    onClick={() => onRenamePlayer?.(currBowler.id, currBowler.name)}
                                                    className="opacity-0 group-hover/name:opacity-40 hover:!opacity-100 transition-opacity p-1 text-white"
                                                >
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                </button>
                                            </div>
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1 block tracking-[0.1em]">Current Bowler</span>
                                        </div>

                                        <span className="text-center font-mono font-bold text-lg">{currBowler.overs}</span>
                                        <span className="text-center font-mono font-bold text-lg opacity-40">{currBowler.maidens}</span>
                                        <span className="text-center font-mono font-bold text-lg">{currBowler.runs}</span>
                                        <span className="text-center font-mono font-black text-2xl text-blue-400">{currBowler.wickets}</span>
                                        <span className="text-center font-mono font-bold border-l border-white/10 pl-2">{currBowler.economy}</span>
                                        <span className="text-center font-mono font-bold opacity-60 text-[11px]">{currBowler.wides || 0}</span>
                                        <span className="text-center font-mono font-bold opacity-60 text-[11px]">{currBowler.noBalls || 0}</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-300 italic text-sm py-16 text-center bg-slate-50/30 rounded-[2rem] border-2 border-dashed border-slate-100 uppercase font-black tracking-widest opacity-50 flex-1 flex items-center justify-center">
                                Select Bowler
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveHeader;
