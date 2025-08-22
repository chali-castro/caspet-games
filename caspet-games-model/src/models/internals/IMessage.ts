import { IHTML } from './IHTML';

export interface IMessage
{
    to: string;
    message: IHTML;
    from?: string;
}