import { IHTML } from './IHTML';

export interface IAction
{
    name: string;
    description: IHTML;
    effect: IHTML;
    phases: string[];
    roles: string;
    playerStatesConditions?: {
        playerState: string;
        value: string;
    }[]
}