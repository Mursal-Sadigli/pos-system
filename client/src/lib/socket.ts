import {io, type Socket} from 'socket.io-client';

const socketUrl=process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null=null;

export function initSocket(): Socket{
    if(!socket){
        socket=io(socketUrl, {
            transports: ['websocket'],
            autoConnect: false,
        });
    }
    return socket;
}

export function getSocket(): Socket | null {
    return socket;
}