export type { PersonalResult, PairResult } from './scoring/types';
export { pickType, calculatePersonalResult, calculateScoreVector } from './scoring/personal';
export { decodeResultId, calculatePairResult, buildPairViewFromResult, getPersonalProfilesFromResult } from './scoring/pair';
export { getSoloVariantProfile, getDuoVariantProfile, SOLO_VARIANT_LIST, DUO_VARIANT_LIST } from './scoring/variants';
