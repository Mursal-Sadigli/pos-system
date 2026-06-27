import { useEffect } from "react";
import { initSocket, getSocket } from "@/lib/socket";


export function useSocket(event: string, callback: (...args: any[]) => void){
    useEffect(() => {
        const socket=initSocket();
        socket.connect();

        socket.on(event, callback);

        return() => {
            socket.off(event, callback);
            const current=getSocket();
            if(current){
                current.disconnect();
            }
        };
    }, [event, callback]);
}