import { type DocumentData } from "firebase/firestore";

interface IMensaje
{
    sender: string;
    mensaje: string;
    participante: string;
}

interface IUsuario
{
    id: string;
    name: string;
}

interface CRoom extends DocumentData
{
    id: string;
    name: string;
    tipo: string;
    status: string;
    gameName?: string;
    creadoPor?: IUsuario;
    participantes?: IUsuario[];
    publicos?: IMensaje[];
    privados?: IMensaje[];
}

export type { CRoom };