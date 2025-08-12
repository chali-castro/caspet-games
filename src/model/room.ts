import { type DocumentData } from "firebase/firestore";

interface IMensaje
{
    sender: string;
    mensaje: string;
}

interface IUsuario
{
    id: string;
    name: string;
}

export class CRoom implements DocumentData
{
    id: string = '';
    name: string = '';
    tipo: string = '';
    status: string = '';
    gameName: string = '';
    participantes: IUsuario[] = [];
    publicos: IMensaje[] = [];
    _privados: IMensaje[] = [];
    _userId: string = '';

    public constructor ()
    {
    }

    public static fromFirestore(id: string, data: DocumentData, userId: string): CRoom
    {
        const room = new CRoom();
        if (id) {
            room.id = id;
        }

        if (data) {
            room._userId = userId;
            room.name = data.name;
            room.tipo = data.tipo;
            room.status = data.status || 'create';
            room.gameName = data.gameName;

            room._privados = data.privados ? data.privados.map((item: any) => ({ ...item })) : [];
            room.publicos = data.publicos ? data.publicos.map((item: { sender: string, mensaje: string; }) => ({ sender: item.sender, mensaje: item.mensaje })) : [];
            room.participantes = data['participantes'] || [];
        }

        return room;
    }

    get listaParticipantes(): string
    {
        return this.participantes.map((item) => item.name).join(', ');
    }

    get privados(): IMensaje[]
    {
        const user = this.participantes.find((item) => item.id === this._userId);
        return this._privados.filter((item: any) => item.participante === user?.name);
    }

}