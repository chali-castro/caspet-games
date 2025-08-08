import { type DocumentData } from "firebase/firestore";

export class CRoom implements DocumentData{
    id: string = '';
    name: string = '';

    constructor(id: string, data: DocumentData){
        console.log('constructor => ', id, data);
        this.id = id;
        this.name = data['name'];
    }
}
