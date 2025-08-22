import { IHTML, IMessage, IPlayer } from './internals';

export interface IGameState
{
    game: string;
    scenario: string;
    players: IPlayer[];
    round: number;
    phase: string;
    messages: IMessage[],
    summaryPhase: IHTML;
    nextPhasePrompt: IHTML;
    gameStates: {
        gameState: string;
        value: string;
    }[];

    details: IHTML[];
}