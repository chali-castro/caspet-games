import { IHTML } from './IHTML';

export interface IRole
{
    name: string;
    description: IHTML;
    abilities: string[];
    optional: boolean,
    faction?: string;
}