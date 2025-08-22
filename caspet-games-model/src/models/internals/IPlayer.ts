import { IHTML } from './IHTML';

export interface IPlayer
{
    name: string;
    isHuman: boolean;
    role: string;
    faction: string;
    states: {
        playerState: string;
        value: string;
    }[],
    personality?: IHTML;
    stateDescription?: IHTML;
}