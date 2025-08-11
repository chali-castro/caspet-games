import { type DocumentData } from "firebase/firestore";

class CMensaje
{
    sender: string = '';
    mensaje: string = '';

    public constructor (sender: string, mensaje: string)
    {
        this.sender = sender;
        this.mensaje = mensaje;
    }
}

class CUsuario
{
    id: string = '';
    name: string = '';

    public constructor (id: string, name: string)
    {
        this.id = id;
        this.name = name;
    }
}

export class CRoom implements DocumentData
{
    id: string = '';
    name: string = '';
    tipo: string = '';
    status: string = '';
    gameName: string = '';
    participantes: CUsuario[] = [];
    publicos: CMensaje[] = [];
    privados: CMensaje[] = [];

    public constructor ()
    {
    }

    public static fromFirestore(id: string, data: DocumentData, userName: string): CRoom
    {
        const room = new CRoom();
        if (id) {
            room.id = id;
        }

        if (data) {
            room.name = data['name'];
            room.tipo = data['tipo'] || '';
            room.status = data['status'] || 'create';
            room.gameName = data['gameName'] || '';
            room.publicos = data['publicos'] ? data['publicos'].map((item: { sender:string, mensaje: string }) => new CMensaje(item.sender, item.mensaje)) : [];
            room.privados = data['privados'] ? data['privados'].filter((item: { participante: string }) => item.participante === userName).map((item: { sender:string, mensaje: string }) => new CMensaje(item.sender, item.mensaje)) : [];
            room.participantes = data['participantes'] || [];        
        }

        return room;
    }

    get listaParticipantes(): string
    {
        return this.participantes.map((item) => item.name).join(', ');
    }

}