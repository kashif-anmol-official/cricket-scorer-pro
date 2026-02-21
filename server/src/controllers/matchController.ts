import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { calculateMatchStats } from '../services/matchEngine';

const prisma = new PrismaClient();

interface CreateMatchRequest {
    name: string;
    teamA: { name: string, players: { name: string }[] };
    teamB: { name: string, players: { name: string }[] };
    oversLimit: number;
    tossWinner?: string;
    tossChoice?: string;
}

export const createMatch = async (req: Request, res: Response) => {
    try {
        const { name, teamA, teamB, oversLimit, tossWinner, tossChoice } = req.body as CreateMatchRequest;

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const newMatch = await tx.match.create({
                data: {
                    name: name || `${teamA.name} vs ${teamB.name}`,
                    oversLimit: oversLimit || 20,
                    tossWinner,
                    tossChoice,
                    status: 'live'
                }
            });

            const teamAFinal = await tx.team.create({
                data: {
                    name: teamA.name,
                    matchId: newMatch.id,
                    players: { create: teamA.players.map((p: any) => ({ name: p.name })) }
                },
                include: { players: true }
            });

            const teamBFinal = await tx.team.create({
                data: {
                    name: teamB.name,
                    matchId: newMatch.id,
                    players: { create: teamB.players.map((p: any) => ({ name: p.name })) }
                },
                include: { players: true }
            });

            let battingTeamId: string;
            let bowlingTeamId: string;

            if (tossWinner === teamA.name) {
                battingTeamId = tossChoice === 'bat' ? teamAFinal.id : teamBFinal.id;
                bowlingTeamId = tossChoice === 'bat' ? teamBFinal.id : teamAFinal.id;
            } else if (tossWinner === teamB.name) {
                battingTeamId = tossChoice === 'bat' ? teamBFinal.id : teamAFinal.id;
                bowlingTeamId = tossChoice === 'bat' ? teamAFinal.id : teamBFinal.id;
            } else {
                battingTeamId = teamAFinal.id;
                bowlingTeamId = teamBFinal.id;
            }

            await tx.innings.create({
                data: {
                    matchId: newMatch.id,
                    battingTeamId,
                    bowlingTeamId,
                    inningsNumber: 1
                }
            });

            return { ...newMatch, teams: [teamAFinal, teamBFinal] };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};

export const getMatch = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                teams: { include: { players: true } },
                innings: {
                    include: {
                        events: {
                            orderBy: { timestamp: 'asc' },
                            include: { striker: true, nonStriker: true, bowler: true, outPlayer: true, assister: true }
                        }
                    }
                }
            }
        });

        if (!match) return res.status(404).json({ error: 'Match not found' });

        const liveScore = calculateMatchStats(match);

        res.json({ ...match, liveScore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch match' });
    }
};

export const addBallEvent = async (req: Request, res: Response) => {
    try {
        const { inningsId, ...eventData } = req.body;

        const event = await prisma.ballEvent.create({
            data: {
                inningsId,
                ...eventData
            }
        });

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to record ball' });
    }
};

export const undoLastEvent = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const match = await prisma.match.findUnique({
            where: { id },
            include: { innings: true }
        });

        if (!match) return res.status(404).json({ error: "Match not found" });

        const inningsIds = match.innings.map(i => i.id);

        const lastEvent = await prisma.ballEvent.findFirst({
            where: { inningsId: { in: inningsIds } },
            orderBy: { timestamp: 'desc' }
        });

        if (!lastEvent) return res.status(400).json({ error: 'No plays to undo' });

        await prisma.ballEvent.delete({ where: { id: lastEvent.id } });

        res.json({ success: true, undoId: lastEvent.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to undo' });
    }
};

export const updatePlayer = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name } = req.body;
        console.log(`Updating player ${id} to name: ${name}`);
        const player = await prisma.player.update({
            where: { id },
            data: { name }
        });
        res.json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update player' });
    }
};

export const startNextInnings = async (req: Request, res: Response) => {
    try {
        const matchId = String(req.params.id);
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { innings: true }
        });

        if (!match) return res.status(404).json({ error: 'Match not found' });

        // Find the current innings
        const currentInnings = [...match.innings].sort((a: any, b: any) => b.inningsNumber - a.inningsNumber)[0];

        if (!currentInnings || currentInnings.inningsNumber >= 2) {
            return res.status(400).json({ error: 'Cannot start next innings. It may already be started or match finished.' });
        }

        const nextInnings = await prisma.innings.create({
            data: {
                matchId: match.id,
                battingTeamId: currentInnings.bowlingTeamId,
                bowlingTeamId: currentInnings.battingTeamId,
                inningsNumber: 2
            }
        });

        res.json(nextInnings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start next innings' });
    }
};
