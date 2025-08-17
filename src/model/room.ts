import { type DocumentData } from "firebase/firestore";

interface IMensaje
{
    sender: string;
    message: string;
    player: string;
}

interface IUsuario
{
    id: string;
    name: string;
}

interface IAccionOpciones
{
    name: string;
    secondTargets?: string[];
}

interface IAccion
{
    name: string;
    description: string;
    targets?: IAccionOpciones[];
    players: string[];
    format: string;
    dice?: {
        type: string;
        amount: number;
        successConditions: string;
        effects: string;
    };
}

interface IPersonaje
{
    name: string;
    type: string;
    history: string;
}

interface IEvento
{
    description: string;
    explanation?: string;
}

interface ILocation
{
    name: string;
    type: string;
    details: string;
}

interface CRoom extends DocumentData
{
    id: string;
    name: string;
    tipo: string;
    status: string;
    gameName?: string;
    owner?: IUsuario;
    players?: IUsuario[];
    publics?: IMensaje[];
    privates?: IMensaje[];
    actions?: IAccion[];
    events?: IEvento[];
    characters?: IPersonaje[];
    locations?: ILocation[];
    progressPercentage?: number;
    userCharacteristics: string;
    rounds: number;
    actionsPerRound: number;
}

export type { CRoom, IAccion, IAccionOpciones };