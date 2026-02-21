import React, { useState } from 'react';
import clsx from 'clsx';
import type { MatchStats, Team } from '../../types';

interface PlayerSelectorProps {
    teams: Team[];
    liveScore: MatchStats;
    battingTeamId: string;
    bowlingTeamId: string;
    strikerId?: string | null;
    nonStrikerId?: string | null;
    currentBowlerId?: string | null;
    onSelect: (data: { strikerId?: string, nonStrikerId?: string, bowlerId?: string }) => void;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
    teams,
    liveScore,
    battingTeamId,
    bowlingTeamId,
    strikerId,
    nonStrikerId,
    currentBowlerId,
    onSelect
}) => {
    const [sId, setSId] = useState('');
    const [nsId, setNsId] = useState('');
    const [bId, setBId] = useState('');

    const handleSubmit = () => {
        onSelect({
            strikerId: sId || undefined,
            nonStrikerId: nsId || undefined,
            bowlerId: bId || undefined
        });
    };

    const battingTeam = teams.find(t => t.id === battingTeamId);
    const bowlingTeam = teams.find(t => t.id === bowlingTeamId);

    const PlayerList = ({ players, selected, onSelect, label, excludeIds, isStrikerList = false }: {
        players: any[],
        selected: string,
        onSelect: (id: string) => void,
        label: string,
        excludeIds: string[],
        isStrikerList?: boolean
    }) => (
        <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block ml-1">{label}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {players.map(player => {
                    const stats = liveScore.batters[player.id];
                    const isOut = stats?.isOut;
                    const isExcluded = excludeIds.includes(player.id) || isOut;
                    const isSelected = selected === player.id;

                    return (
                        <button
                            key={player.id}
                            type="button"
                            disabled={isExcluded}
                            onClick={() => onSelect(player.id)}
                            className={clsx(
                                "relative px-3 py-3 rounded-xl text-xs font-semibold transition-all border text-left flex flex-col gap-0.5 min-h-[56px] justify-center",
                                isSelected
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-[1.02] z-10"
                                    : isOut
                                        ? "bg-red-50 border-red-100 text-red-200 cursor-not-allowed opacity-60"
                                        : isExcluded
                                            ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                                            : "bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50"
                            )}
                        >
                            <div className="flex items-center gap-1.5 w-full">
                                <span className="truncate flex-1">{player.name}</span>
                                {isStrikerList && isSelected && (
                                    <span className="text-yellow-400 text-sm animate-pulse">★</span>
                                )}
                                {isOut && (
                                    <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-bold">OUT</span>
                                )}
                            </div>
                            <span className={clsx(
                                "text-[8px] uppercase tracking-tighter opacity-60",
                                isSelected ? "text-white/80" : "text-gray-400"
                            )}>
                                {isOut ? stats.dismissal : 'Available'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="space-y-8">
                {!strikerId && battingTeam && (
                    <PlayerList
                        label={`Select Striker (${battingTeam.name})`}
                        players={battingTeam.players}
                        selected={sId}
                        onSelect={setSId}
                        excludeIds={[nsId, liveScore.currentNonStrikerId].filter(Boolean) as string[]}
                        isStrikerList={true}
                    />
                )}

                {!nonStrikerId && battingTeam && (
                    <PlayerList
                        label={`Select Non-Striker (${battingTeam.name})`}
                        players={battingTeam.players}
                        selected={nsId}
                        onSelect={setNsId}
                        excludeIds={[sId, liveScore.currentStrikerId].filter(Boolean) as string[]}
                    />
                )}

                {!currentBowlerId && bowlingTeam && (
                    <PlayerList
                        label={`Select Next Bowler (${bowlingTeam.name})`}
                        players={bowlingTeam.players}
                        selected={bId}
                        onSelect={setBId}
                        excludeIds={[liveScore.lastBowlerId].filter(Boolean) as string[]}
                    />
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={Boolean(
                    (!strikerId && !sId) ||
                    (!nonStrikerId && !nsId) ||
                    (!currentBowlerId && !bId)
                )}
                className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-40 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <span>Confirm Active Players</span>
                <span className="text-xl">➔</span>
            </button>
        </div>
    );
};

export default PlayerSelector;
