import { DUO_VARIANTS, SOLO_VARIANTS } from "../../const/scoring";
import type { DuoVariant, DuoVariantProfile, SoloVariant, SoloVariantProfile } from "../types";

export function getSoloVariantProfile(id: SoloVariant): SoloVariantProfile | undefined {
    return SOLO_VARIANTS[id];
}

export function getDuoVariantProfile(id: DuoVariant): DuoVariantProfile | undefined {
    return DUO_VARIANTS[id];
}

export const SOLO_VARIANT_LIST: SoloVariantProfile[] = Object.values(SOLO_VARIANTS);
export const DUO_VARIANT_LIST: DuoVariantProfile[] = Object.values(DUO_VARIANTS);
