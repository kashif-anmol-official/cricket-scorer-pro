import React, { useState } from 'react';
import clsx from 'clsx';

interface WicketModalProps {
    teams: any[];
    bowlingTeamId: string;
    batterName: string;
    onConfirm: (type: string, fielderId?: string) => void;
    onCancel: () => void;
}

const WicketModal: React.FC<WicketModalProps> = ({ teams, bowlingTeamId, batterName, onConfirm, onCancel }) => {
    const [type, setType] = useState('caught');
    const [fielderId, setFielderId] = useState('');

    const wicketTypes = [
        { id: 'bowled', label: 'Bowled' },
        { id: 'caught', label: 'Caught' },
        { id: 'lbw', label: 'LBW' },
        { id: 'runout', label: 'Run Out' },
        { id: 'stumped', label: 'Stumped' },
        { id: 'hitwicket', label: 'Hit Wicket' },
        { id: 'retired', label: 'Retired' }
    ];

    const needsFielder = ['caught', 'runout', 'stumped'].includes(type);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto">
            <div className="glass-card p-6 sm:p-10 rounded-[3rem] max-w-lg w-full shadow-2xl border-white/20 bg-white/95 my-8 animate-slide-up">
                <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        ☝️
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Wicket Confirmed</h3>
                    <p className="text-gray-500 text-sm mt-1">Select dismissal details for <span className="font-bold text-red-600">{batterName}</span></p>
                </div>

                <div className="space-y-8 mb-8">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 ml-1">Dismissal Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 cricinfo-ballresult">
                            {wicketTypes.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setType(t.id)}
                                    className={clsx(
                                        "px-3 py-3 rounded-xl text-xs font-bold transition-all border",
                                        type === t.id
                                            ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-100"
                                            : "bg-white border-gray-100 text-gray-600 hover:bg-red-50 hover:border-red-200"
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {needsFielder && (
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 ml-1">Involved Fielder ({teams.find(t => t.id === bowlingTeamId)?.name})</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar cricinfo-ballresult">
                                {teams.filter(t => t.id === bowlingTeamId).flatMap(t => t.players.map((p: any) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setFielderId(p.id)}
                                        className={clsx(
                                            "px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left flex flex-col gap-0.5 relative group",
                                            fielderId === p.id
                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02] ring-4 ring-blue-100"
                                                : "bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="truncate flex-1">{p.name}</span>
                                            {fielderId === p.id && (
                                                <svg className="w-3 h-3 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={clsx(
                                            "text-[8px] uppercase tracking-tighter opacity-60",
                                            fielderId === p.id ? "text-white/80" : "text-gray-400"
                                        )}>
                                            Fielder
                                        </span>
                                    </button>
                                )))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onConfirm(type, fielderId || undefined)}
                        disabled={needsFielder && !fielderId}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                    >
                        Confirm Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WicketModal;
