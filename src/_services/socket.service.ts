import { Injectable } from "@angular/core";
import { environment } from '../environments/environment';
import { io, Socket, SocketOptions } from 'socket.io-client';

@Injectable()
export class SocketService {
    connected: boolean = false;

    public io: Socket;
    public roomId = '';
 
    constructor(){
        this.io = io(environment.endpoint);

    }

}

export interface Connection {
    client_auth: boolean;
    message?: string;
    room?: string;
}