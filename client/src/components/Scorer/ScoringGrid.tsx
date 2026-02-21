import React, { useState } from 'react';
import clsx from 'clsx';

interface ScoringGridProps {
    onScore: (runs: number, extraType?: string, isWicket?: boolean) => void;
    onUndo: () => void;
}

const ScoringGrid: React.FC<ScoringGridProps> = ({ onScore, onUndo }) => {
    const [nbMode, setNbMode] = useState(false);
    const [wdMode, setWdMode] = useState(false);

    const runsOptions = [0, 1, 2, 3, 4, 6];

    const handleRunClick = (runs: number) => {
        if (nbMode) {
            onScore(runs + 1, 'NB');
            setNbMode(false);
        } else if (wdMode) {
            onScore(runs + 1, 'WD');
            setWdMode(false);
        } else {
            onScore(runs);
        }
    };

    if (nbMode || wdMode) {
        return (
            <div className="glass-card p-6 rounded-3xl h-full flex flex-col border-orange-100 animate-in fade-in zoom-in duration-200">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className={clsx(
                            "text-xs font-bold uppercase tracking-widest",
                            nbMode ? "text-orange-500" : "text-yellow-600"
                        )}>
                            {nbMode ? 'No Ball + Runs' : 'Wide + Runs'}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-medium">Select runs scored on this extra</p>
                    </div>
                    <button
                        onClick={() => { setNbMode(false); setWdMode(false); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8 cricinfo-ballresult">
                    {runsOptions.map(runs => (
                        <button
                            key={runs}
                            onClick={() => handleRunClick(runs)}
                            className={clsx(
                                "aspect-square text-xl font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex flex-col items-center justify-center gap-1",
                                nbMode ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                    : "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                            )}
                        >
                            <span className="text-2xl">{runs}</span>
                            <span className="text-[9px] opacity-70 font-bold">RUNS</span>
                        </button>
                    ))}
                </div>

                <div className="mt-auto">
                    <p className="text-[10px] text-center text-gray-400 mb-4 px-4 leading-relaxed font-medium">
                        Choosing a value will record the 1 penalty run automatically.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-3xl h-full flex flex-col justify-between border-blue-100/30">
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ball Result</h3>
                <div className="grid grid-cols-3 gap-3 mb-6 cricinfo-ballresult">
                    {runsOptions.map(runs => (
                        <button
                            key={runs}
                            onClick={() => handleRunClick(runs)}
                            className={clsx(
                                "aspect-square text-2xl font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center",
                                runs === 4 ? "bg-green-500 text-white hover:bg-green-600 shadow-green-100" :
                                    runs === 6 ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100" :
                                        "bg-white text-gray-800 border border-gray-100 hover:border-blue-200 hover:text-blue-600"
                            )}
                        >
                            {runs}
                        </button>
                    ))}
                    <button
                        onClick={() => setWdMode(true)}
                        className="py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-bold hover:bg-yellow-500 transition-all flex flex-col items-center leading-none shadow-lg shadow-yellow-100/50"
                    >
                        <span className="text-lg">WD</span>
                        <span className="text-[10px] opacity-60 mt-1 font-normal tracking-wider">WIDE BALL</span>
                    </button>
                    <button
                        onClick={() => setNbMode(true)}
                        className="py-4 bg-orange-400 text-orange-900 rounded-2xl font-bold hover:bg-orange-500 transition-all flex flex-col items-center leading-none shadow-lg shadow-orange-100/50"
                    >
                        <span className="text-lg">NB</span>
                        <span className="text-[10px] opacity-60 mt-1 font-normal tracking-wider">NO BALL</span>
                    </button>

                    <button
                        onClick={() => onScore(0, undefined, true)}
                        className="w-full py-5 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100/50 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 mb-8"
                    >
                        <span className="text-xl">☝️</span>
                        <span>WICKET</span>
                    </button>
                    <button
                        onClick={onUndo}
                        className="w-full py-3 text-gray-400 hover:text-blue-600 font-bold text-sm bg-gray-50/50 rounded-xl border border-transparent hover:border-blue-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">↩</span>
                        <span>Undo Last Ball</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoringGrid;
