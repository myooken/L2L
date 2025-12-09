import type {
    DuoVariant,
    DuoVariantProfile,
    PairView,
    PersonalTypeProfile,
    SoloVariant,
    SoloVariantProfile,
} from "../types";

export interface PersonalResult {
    typeId: number;
    type: PersonalTypeProfile;
    score: {
        distance: number;
        initiative: number;
        security: number;
        affection: number;
    };
    variantId?: SoloVariant;
    variantProfile?: SoloVariantProfile;
}

export interface PairResult {
    resultId: number;
    keyMatch: boolean;
    typeA: number;
    typeB: number;
    viewA: PairView;
    viewB: PairView;
    duoVariant?: DuoVariant;
}
