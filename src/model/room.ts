import { DocumentReference, getDoc, type DocumentData } from "firebase/firestore";

export class CRoom implements DocumentData{
    id: string = '';
    name: string = '';
    tipo: string = '';
    participantes: string[] = [];

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
            if (data['participantes']) {
                await Promise.all(data['participantes'].map(async (part: DocumentReference) =>
                {
                    const doc = await getDoc(part);
                    if (doc.exists()) {
                        room.participantes.push(doc.data().name);
                    }
                }));
            }
        }

        return room;
    }

    get listaParticipantes(): string {
        return this.participantes.join(', ');
    }
}