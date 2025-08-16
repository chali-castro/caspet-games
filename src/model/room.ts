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

interface IAccion
{
    nombre: string;
    descripcion: string;
    actuanCon?: string[];
    dados?: {
        tipo: string;
        cantidad: number;
        condicionesExito: string;
    };
}

interface IPersonaje
{
    nombre: string;
    tipo: string;
    historia: string;
}

interface IEvento
{
    descripcion: string;
    explicacion: string;
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
    acciones?: IAccion[];
    eventos?: IEvento[];
    personajes?: IPersonaje[];
}

export type { CRoom, IAccion };