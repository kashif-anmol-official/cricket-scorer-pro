import axios from 'axios';
import type { Match } from './types.ts';

const api = axios.create({
    baseURL: '/api'
});

export const createMatch = async (data: {
    name: string,
    teamA: any,
    teamB: any,
    oversLimit: number,
    tossWinner?: string | null,
    tossChoice?: string | null
}) => {
    const res = await api.post<Match>('/matches', data);
    return res.data;
};

export const getMatch = async (id: string) => {
    const res = await api.get<Match>(`/matches/${id}`);
    return res.data;
};

export const addBallEvent = async (matchId: string, inningsId: string, eventData: any) => {
    const res = await api.post(`/matches/${matchId}/events`, { inningsId, ...eventData });
    return res.data;
};

export const undoLastEvent = async (matchId: string) => {
    const res = await api.delete(`/matches/${matchId}/events/last`);
    return res.data;
};

export const updatePlayer = async (id: string, name: string) => {
    const res = await api.patch(`/matches/players/${id}`, { name });
    return res.data;
};

export const startNextInnings = async (id: string) => {
    const res = await api.post(`/matches/${id}/next-innings`);
    return res.data;
};
