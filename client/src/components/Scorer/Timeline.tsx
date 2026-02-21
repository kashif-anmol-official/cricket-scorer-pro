import React, { useRef } from 'react';
import clsx from 'clsx';

interface TimelineProps {
    events: any[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Group events by over number
    const oversMap: Record<number, any[]> = {};
    events.forEach(event => {
        const overIdx = event.overNumber ?? 0;
        if (!oversMap[overIdx]) {
            oversMap[overIdx] = [];
        }
        oversMap[overIdx].push(event);
    });

    const sortedOverKeys = Object.keys(oversMap).map(Number).sort((a, b) => a - b);

    return (
        <div className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-blue-900/10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Match Timeline</h3>
                        <p className="text-[10px] font-bold text-slate-900/40 uppercase mt-0.5 tracking-widest">All overs sequence</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sortedOverKeys.length} Overs</span>
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex items-center space-x-6 overflow-x-auto pb-8 scrollbar scroll-smooth px-2 cricinfo-overtime"
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            >
                {sortedOverKeys.length === 0 ? (
                    <div className="w-full py-12 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] italic">Waiting for first delivery...</span>
                    </div>
                ) : (
                    sortedOverKeys.map((overKey, index) => {
                        const over = oversMap[overKey];
                        return (
                            <React.Fragment key={overKey}>
                                {/* Over Block */}
                                <div className="flex items-center gap-4 shrink-0" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">Over</span>
                                        <span className="text-xl font-black text-slate-900 leading-none mt-1">{overKey + 1}</span>
                                    </div>

                                    <div className="flex items-center gap-3" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        {over.map((ball, ballIdx) => {
                                            let label = ball.runsScored.toString();
                                            let dotStyle = "bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:text-blue-600 shadow-sm";
                                            let glow = "ring-transparent";

                                            if (ball.isWicket) {
                                                label = "W";
                                                dotStyle = "bg-red-500 text-white border-red-400 shadow-lg shadow-red-200";
                                                glow = "ring-red-100";
                                            } else if (ball.extrasType) {
                                                const displayRuns = ball.runsScored + (ball.extrasRuns || 0);
                                                label = `${displayRuns}${ball.extrasType}`;
                                                dotStyle = "bg-amber-400 text-amber-950 border-amber-300 shadow-lg shadow-amber-100";
                                                glow = "ring-amber-50";
                                            } else if (ball.runsScored === 4) {
                                                dotStyle = "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200";
                                                glow = "ring-emerald-100";
                                            } else if (ball.runsScored === 6) {
                                                dotStyle = "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200";
                                                glow = "ring-indigo-100";
                                            }

                                            return (
                                                <div
                                                    key={ball.id || `${overKey}-${ballIdx}`}
                                                    className={clsx(
                                                        "w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xs transition-all duration-300 border-2 ring-4 active:scale-90 hover:scale-110 shrink-0",
                                                        dotStyle,
                                                        glow
                                                    )}
                                                    style={{ width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Divider between overs */}
                                {index < sortedOverKeys.length - 1 && (
                                    <div className="h-10 w-0.5 bg-slate-100 shrink-0 mx-2 rounded-full"></div>
                                )}
                            </React.Fragment>
                        );
                    })
                )}
            </div>

            {/* Legend / Key */}
            <div className="mt-4 pt-6 border-t border-slate-50 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-200"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Wicket</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-100"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Extras (WD/NB)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-100"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Boundary (4)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-lg shadow-indigo-100"></div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Maximum (6)</span>
                </div>
                <div className="flex-1"></div>
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Horizontal Scroll for history</span>
            </div>

        </div>
    );
};

export default Timeline;
