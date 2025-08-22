import { IFeature, IHTML, IPhase, IRole, IWinCondition } from './internals';

export interface IGame {
    title: string;
    playerCount: {
        min: number;
        max: number;
    },
    overview: { description: IHTML; },
    rules: IHTML[];
    setup?: string;
    phases?: IPhase[];
    winConditions?: IWinCondition[],
    factions?: string[];
    roles?: IRole[];
    moderatorFeatures?: IFeature[];
    additionalNotes?: string[];
}