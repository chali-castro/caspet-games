import { DocumentReference, getDoc, type DocumentData } from "firebase/firestore";

export class CRoom implements DocumentData
{
    id: string = '';
    name: string = '';
    tipo: string = '';
    status: string = '';
    gameName: string = '';
    participantes: string[] = [];
    reglamento?: string;

    public constructor ()
    {
    }

    public static async fromFirestore(id: string, data: DocumentData): Promise<CRoom>
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

            if (data['participantes']) {
                room.participantes = await Promise.all(data['participantes'].map(async (part: DocumentReference) =>
                {
                    const doc = await getDoc(part);
                    if (doc.exists()) {
                        return doc.data().name;
                    }
                    return null;
                }));
            }
        }

        return room;
    }

    get listaParticipantes(): string
    {
        return this.participantes.join(', ');
    }

}