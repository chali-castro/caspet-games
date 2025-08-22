import { IAction, IFeature, IHTML, IPhase, IRole, IState, IWinCondition } from './internals';

export interface IScenario
{
    game: string;
    title: string;
    description: IHTML;
    actions: IAction[];
    gameStates: IState[];
    playerStates: IState[];

    recommendedNumPlayers?: number;
    rules?: IHTML[];
    phases?: IPhase[];
    winConditions?: IWinCondition[];
    factions?: string[];
    roles?: IRole[];
    moderatorFeatures?: IFeature[];
    additionalNotes?: string[];
}