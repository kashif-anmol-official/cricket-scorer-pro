import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMatch, addBallEvent, undoLastEvent, updatePlayer, startNextInnings } from '../../api';
import LiveHeader from './LiveHeader';
import ScoringGrid from './ScoringGrid';
import Timeline from './Timeline';
import Scorecard from './Scorecard';
import PlayerSelector from './PlayerSelector';
import WicketModal from './WicketModal';
import type { MatchStats } from '../../types';
import { LogOut, ArrowRightCircle, Trophy } from 'lucide-react';

const Scorer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const renameMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => updatePlayer(id, name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match', id] })
    });

    const handleRename = (playerId: string, currentName: string) => {
        const newName = window.prompt("Enter new player name:", currentName);
        if (newName && newName !== currentName) {
            renameMutation.mutate({ id: playerId, name: newName });
        }
    };

    const { data: match, isLoading } = useQuery({
        queryKey: ['match', id],
        queryFn: () => getMatch(id!),
        refetchInterval: 2000,
        enabled: !!id
    });

    const addEventMutation = useMutation({
        mutationFn: (data: any) => addBallEvent(id!, match?.innings[match?.innings.length - 1]?.id!, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match', id] })
    });

    const undoMutation = useMutation({
        mutationFn: () => undoLastEvent(id!),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match', id] })
    });

    const nextInningsMutation = useMutation({
        mutationFn: () => startNextInnings(id!),
        onSuccess: () => {
            setTempSelection(null);
            queryClient.invalidateQueries({ queryKey: ['match', id] });
        }
    });

    const [showWicketModal, setShowWicketModal] = useState(false);
    const [tempSelection, setTempSelection] = useState<{ strikerId?: string | null, nonStrikerId?: string | null, bowlerId?: string | null } | null>(null);

    if (isLoading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Initializing Digital Scorer...</div>;
    if (!match || !match.liveScore) return <div className="p-20 text-center text-red-500 font-bold">Match Session Expired or Not Found</div>;

    const liveScore = match.liveScore as MatchStats;
    const currentInnings = match.innings[match.innings.length - 1];
    const strikerId = tempSelection?.strikerId || liveScore.currentStrikerId;
    const nonStrikerId = tempSelection?.nonStrikerId || liveScore.currentNonStrikerId;
    const bowlerId = tempSelection?.bowlerId || liveScore.currentBowlerId;

    const battingTeam = match.teams.find(t => t.id === currentInnings.battingTeamId);
    const isAllOut = liveScore.wickets >= (battingTeam?.players.length || 11) - 1;
    const isOversFinished = liveScore.balls >= match.oversLimit * 6;
    const isInningsComplete = isAllOut || isOversFinished;
    const isFirstInnings = currentInnings.inningsNumber === 1;

    // Check if 2nd innings is also done (chase complete or balls done)
    let isMatchFinished = false;
    let resultMessage = "";
    if (!isFirstInnings) {
        const firstInningsScore = match.innings[0].score || 0;
        const target = firstInningsScore + 1;
        const team1 = match.teams.find(t => t.id === match.innings[0].battingTeamId);
        const team2 = match.teams.find(t => t.id === currentInnings.battingTeamId);

        if (liveScore.score >= target) {
            isMatchFinished = true;
            const wicketsLeft = ((battingTeam?.players.length || 11) - 1) - liveScore.wickets;
            resultMessage = `${team2?.name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
        } else if (isInningsComplete) {
            isMatchFinished = true;
            if (liveScore.score < firstInningsScore) {
                resultMessage = `${team1?.name} won by ${firstInningsScore - liveScore.score} run${(firstInningsScore - liveScore.score) !== 1 ? 's' : ''}`;
            } else {
                resultMessage = "Match Tied!";
            }
        }
    }

    const needsSelection = !strikerId || !nonStrikerId || !bowlerId;

    const handleScore = (runs: number, extrasType?: string, isWicket: boolean = false) => {
        if (isInningsComplete || isMatchFinished) return;
        if (needsSelection) {
            alert("Match state incomplete. Please select participating players.");
            return;
        }
        if (isWicket) {
            setShowWicketModal(true);
            return;
        }
        submitBall(runs, extrasType, false);
    };

    const submitBall = (runs: number, extrasType?: string, isWicket: boolean = false, wicketInfo?: { type: string, fielderId?: string }) => {
        addEventMutation.mutate({
            runsScored: extrasType ? (extrasType === 'NB' || extrasType === 'WD' ? (runs - 1) : 0) : runs,
            extrasRuns: extrasType ? (extrasType === 'NB' || extrasType === 'WD' ? 1 : runs) : 0,
            extrasType,
            isWicket,
            wicketType: wicketInfo?.type,
            assisterId: wicketInfo?.fielderId,
            outPlayerId: strikerId,
            strikerId,
            nonStrikerId,
            bowlerId,
            overNumber: Math.floor(liveScore.balls / 6),
            ballNumber: (liveScore.balls % 6) + 1
        });
        setTempSelection(null);
        setShowWicketModal(false);
    };

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-slide-up">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Scorer Interface */}
                    <div className="lg:col-span-2 space-y-8">
                        <LiveHeader
                            match={match}
                            strikerId={strikerId}
                            onSwapStrike={() => setTempSelection({
                                strikerId: nonStrikerId,
                                nonStrikerId: strikerId,
                                bowlerId: bowlerId
                            })}
                            onRenamePlayer={handleRename}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <Timeline events={match.innings[match.innings.length - 1]?.events || []} />

                                {needsSelection && !isInningsComplete && !isMatchFinished && (
                                    <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden ring-2 ring-blue-100 shadow-2xl">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">🏏</div>
                                        <h3 className="text-slate-900 font-black mb-8 flex items-center gap-2 text-xl tracking-tight">
                                            Active Player Selection
                                        </h3>
                                        <PlayerSelector
                                            teams={match.teams}
                                            liveScore={liveScore}
                                            battingTeamId={match.innings[match.innings.length - 1].battingTeamId}
                                            bowlingTeamId={match.innings[match.innings.length - 1].bowlingTeamId}
                                            strikerId={liveScore.currentStrikerId}
                                            nonStrikerId={liveScore.currentNonStrikerId}
                                            currentBowlerId={liveScore.currentBowlerId}
                                            onSelect={(data) => setTempSelection(prev => ({ ...prev, ...data }))}
                                        />
                                    </div>
                                )}

                                {(isInningsComplete || isMatchFinished) && (
                                    <div className="glass-card p-10 rounded-[3rem] border-4 border-blue-500 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] relative overflow-hidden animate-pulse-slow">
                                        <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                                {isMatchFinished ? <Trophy className="w-10 h-10" /> : <LogOut className="w-10 h-10" />}
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                                                    {isMatchFinished ? 'Match Completed!' : 'Innings Complete'}
                                                </h3>
                                                <p className="text-slate-500 font-bold mt-2">
                                                    {isAllOut ? 'All Batters Dismissed' : 'Maximum Overs Reached'}
                                                </p>
                                            </div>

                                            {isFirstInnings && (
                                                <button
                                                    onClick={() => nextInningsMutation.mutate()}
                                                    disabled={nextInningsMutation.isPending}
                                                    className="w-full py-5 px-8 bg-slate-900 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.03] active:scale-95 shadow-2xl disabled:opacity-50"
                                                >
                                                    {nextInningsMutation.isPending ? 'Starting...' : 'Start 2nd Innings'}
                                                    <ArrowRightCircle className="w-6 h-6" />
                                                </button>
                                            )}

                                            {isMatchFinished && (
                                                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 w-full">
                                                    <p className="text-blue-600 font-black text-xl">{resultMessage}</p>
                                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Final Score: {liveScore.score}/{liveScore.wickets}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl pointer-events-none">🏁</div>
                                    </div>
                                )}
                            </div>

                            <div className={needsSelection || isInningsComplete || isMatchFinished ? 'opacity-30 grayscale pointer-events-none transition-all duration-700 blur-[2px]' : 'transition-all duration-700'}>
                                <ScoringGrid
                                    onScore={handleScore}
                                    onUndo={() => undoMutation.mutate()}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scorecard Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <Scorecard stats={liveScore} inningsNumber={currentInnings.inningsNumber} />

                            <div className="glass-card-dark p-8 rounded-[2.5rem] text-white">
                                <h4 className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mb-6">Match Analytics</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold opacity-60">Run Rate</span>
                                        <span className="font-mono font-black text-2xl text-blue-400">{(liveScore.score / (liveScore.balls / 6 || 1)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold opacity-60">Projected</span>
                                        <span className="font-mono font-black text-2xl text-white">{Math.round((liveScore.score / (liveScore.balls / 6 || 1)) * match.oversLimit)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showWicketModal && (
                <WicketModal
                    teams={match.teams}
                    bowlingTeamId={currentInnings.bowlingTeamId}
                    batterName={Object.values(liveScore.batters).find(b => b.id === strikerId)?.name || 'Striker'}
                    onConfirm={(type, fielderId) => submitBall(0, undefined, true, { type, fielderId })}
                    onCancel={() => setShowWicketModal(false)}
                />
            )}
        </div>
    );
};

export default Scorer;
