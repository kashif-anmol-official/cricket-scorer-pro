export const calculateMatchStats = (match: any) => {
    const stats = {
        score: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        currentOver: [] as any[],
        batters: {} as Record<string, any>,
        bowlers: {} as Record<string, any>,
        extras: { total: 0, wide: 0, noball: 0, bye: 0, legbye: 0 },
        currentStrikerId: null as string | null,
        currentNonStrikerId: null as string | null,
        currentBowlerId: null as string | null,
        lastBowlerId: null as string | null,
        lastWicket: null as any
    };

    if (!match.innings || match.innings.length === 0) return stats;

    const currentInnings = match.innings[match.innings.length - 1];
    const events = currentInnings.events || [];

    events.forEach((event: any) => {
        const isLegal = event.extrasType !== 'WD' && event.extrasType !== 'NB';
        const strikerId = event.strikerId;
        const bowlerId = event.bowlerId;

        if (!stats.batters[strikerId]) {
            stats.batters[strikerId] = { id: strikerId, name: event.striker?.name || 'Batter', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false };
        }
        if (!stats.bowlers[bowlerId]) {
            stats.bowlers[bowlerId] = { id: bowlerId, name: event.bowler?.name || 'Bowler', balls: 0, runs: 0, wickets: 0, maidens: 0, economy: 0, wides: 0, noBalls: 0 };
        }

        const batRuns = event.runsScored || 0;
        const totalExtras = event.extrasRuns || 0;

        stats.batters[strikerId].runs += batRuns;
        if (isLegal) stats.batters[strikerId].balls += 1;
        if (batRuns === 4) stats.batters[strikerId].fours += 1;
        if (batRuns === 6) stats.batters[strikerId].sixes += 1;

        if (event.extrasType) {
            stats.extras.total += totalExtras;
            if (event.extrasType === 'WD') {
                stats.extras.wide += totalExtras;
                stats.bowlers[bowlerId].wides += 1;
            }
            if (event.extrasType === 'NB') {
                stats.extras.noball += totalExtras;
                stats.bowlers[bowlerId].noBalls += 1;
            }
            if (event.extrasType === 'B') stats.extras.bye += totalExtras;
            if (event.extrasType === 'LB') stats.extras.legbye += totalExtras;
        }

        stats.score += batRuns + totalExtras;

        let bowlerRuns = batRuns;
        if (event.extrasType === 'WD' || event.extrasType === 'NB') {
            bowlerRuns += totalExtras;
        }
        stats.bowlers[bowlerId].runs += bowlerRuns;
        if (isLegal) {
            stats.bowlers[bowlerId].balls += 1;
            stats.balls += 1;
        }

        if (event.isWicket) {
            stats.wickets += 1;
            const outId = event.outPlayerId || strikerId;
            if (stats.batters[outId]) {
                const batter = stats.batters[outId];
                batter.isOut = true;
                batter.wicketType = event.wicketType;
                batter.bowlerName = event.bowler?.name;
                batter.fielderName = event.assister?.name;

                // Construct standard dismissal string
                if (event.wicketType === 'bowled') batter.dismissal = `b ${event.bowler?.name}`;
                else if (event.wicketType === 'caught') batter.dismissal = `c ${event.assister?.name || 'field'} b ${event.bowler?.name}`;
                else if (event.wicketType === 'lbw') batter.dismissal = `lbw b ${event.bowler?.name}`;
                else if (event.wicketType === 'stumped') batter.dismissal = `st ${event.assister?.name || 'keeper'} b ${event.bowler?.name}`;
                else if (event.wicketType === 'runout') batter.dismissal = `run out (${event.assister?.name || 'field'})`;
                else batter.dismissal = event.wicketType || 'Out';
            }
            if (['bowled', 'caught', 'lbw', 'stumped', 'hitwicket'].includes(event.wicketType)) {
                stats.bowlers[bowlerId].wickets += 1;
            }
        }
    });

    stats.overs = Math.floor(stats.balls / 6) + (stats.balls % 6) / 10;
    Object.values(stats.bowlers).forEach((b: any) => {
        b.overs = Math.floor(b.balls / 6) + (b.balls % 6) / 10;
        const totalOvers = b.balls / 6;
        b.economy = totalOvers > 0 ? (b.runs / totalOvers).toFixed(2) : "0.00";
    });

    // Derive Current State from last event
    const lastEvent = events[events.length - 1];
    if (lastEvent) {
        let sId = lastEvent.strikerId;
        let nsId = lastEvent.nonStrikerId;
        let bId = lastEvent.bowlerId;

        // Rotation
        const runsToRotate = lastEvent.runsScored + (lastEvent.extrasType === 'WD' || lastEvent.extrasType === 'NB' ? lastEvent.extrasRuns : 0);
        if (runsToRotate % 2 !== 0) [sId, nsId] = [nsId, sId];

        const validBalls = events.filter((e: any) => e.extrasType !== 'WD' && e.extrasType !== 'NB').length;
        if (validBalls > 0 && validBalls % 6 === 0) [sId, nsId] = [nsId, sId];

        if (lastEvent.isWicket) {
            if (lastEvent.outPlayerId === nsId) nsId = null;
            else sId = null;
        }

        stats.currentStrikerId = sId;
        stats.currentNonStrikerId = nsId;
        stats.currentBowlerId = (validBalls > 0 && validBalls % 6 === 0) ? null : bId;
        stats.lastBowlerId = bId;

        if (lastEvent.isWicket) {
            const outId = lastEvent.outPlayerId || lastEvent.strikerId;
            const batter = stats.batters[outId];
            if (batter) {
                stats.lastWicket = {
                    name: batter.name,
                    dismissal: batter.dismissal,
                    runs: batter.runs,
                    balls: batter.balls,
                    fours: batter.fours,
                    sixes: batter.sixes
                };
            }
        }
    }

    // Current Over timeline
    const ballsInCurrentOver = stats.balls % 6;
    const currentOverEvents = events.slice(-(ballsInCurrentOver || 6)).filter((e: any, i: any) => {
        // filter events that belong to the current over count
        // simplistic: take the last X events where legal balls sum up to current over balls
        return true; // Simplified for now
    });
    stats.currentOver = currentOverEvents;

    return stats;
};
