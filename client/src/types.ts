export interface Player {
    id: string;
    name: string;
    teamId: string;
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
}

export interface Innings {
    id: string;
    matchId: string;
    battingTeamId: string;
    bowlingTeamId: string;
    inningsNumber: number;
    score?: number;
    wickets?: number;
    overs?: number;
    events?: any[];
}

export interface Match {
    id: string;
    name: string | null;
    date: string;
    oversLimit: number;
    tossWinner: string | null;
    tossChoice: string | null;
    status: string;
    teams: Team[];
    innings: Innings[];
    liveScore?: MatchStats;
}

export interface MatchStats {
    score: number;
    wickets: number;
    overs: number;
    balls: number;
    batters: Record<string, BatterStats>;
    bowlers: Record<string, BowlerStats>;
    extras: ExtrasStats;
    currentOver: any[];
    currentStrikerId?: string | null;
    currentNonStrikerId?: string | null;
    currentBowlerId?: string | null;
    lastBowlerId?: string | null;
    lastWicket?: any;
}

export interface BatterStats {
    id: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    dismissal?: string;
}

export interface BowlerStats {
    id: string;
    name: string;
    balls: number;
    runs: number;
    wickets: number;
    maidens: number;
    overs: number;
    economy: string | number;
    wides: number;
    noBalls: number;
}

export interface ExtrasStats {
    total: number;
    wide: number;
    noball: number;
    bye: number;
    legbye: number;
}
