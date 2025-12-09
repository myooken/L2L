import type { DuoVariant } from "../types";
import type { PersonalResult } from "./types";

export function determineDuoVariant(
    host: PersonalResult,
    guest: PersonalResult,
): DuoVariant {
    const axes: Array<keyof typeof host.score> = ['distance', 'initiative', 'security', 'affection'];
    const rankedHostAxes = [...axes].sort((a, b) => Math.abs(host.score[b]) - Math.abs(host.score[a]));
    const top3 = rankedHostAxes.slice(0, 3);

    const guestScore = guest.score;
    const matchCount = top3.reduce((acc, axis) => {
        const signHost = host.score[axis] >= 0 ? 1 : -1;
        const signGuest = guestScore[axis] >= 0 ? 1 : -1;
        return acc + (signHost === signGuest ? 1 : 0);
    }, 0);
    const diffSum = top3.reduce((acc, axis) => acc + Math.abs(host.score[axis] - guestScore[axis]), 0);

    if (matchCount >= 2) {
        if (diffSum <= 6) return 'sync-strong';
        return 'sync-soft';
    }

    if (matchCount === 1) {
        const initGap = Math.abs(host.score.initiative - guestScore.initiative);
        return initGap >= 4 ? 'complement-active' : 'complement-gentle';
    }

    // matchCount === 0
    const distanceGap = Math.abs(host.score.distance - guestScore.distance);
    const securityGap = Math.abs(host.score.security - guestScore.security);
    const initiativeGap = Math.abs(host.score.initiative - guestScore.initiative);

    if (diffSum >= 12) {
        return securityGap >= distanceGap ? 'contrast-guard' : 'contrast-explore';
    }

    return initiativeGap >= 4 ? 'drift-bridge' : 'drift-stable';
}
