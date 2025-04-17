import WebSocket from "ws";
import { WSClient } from "../index.js";
import { sendTo } from "../next-adapter.js";
import { handleTextEvent, TextEvent } from "./TextHandler.js";

export interface SockChange {
    server?: boolean;
    authorized?: boolean;
    username?: string;
}
interface WebSocketOptions {
    token: string;
    user: boolean;
}
interface WebSocketEvent {
    event: string;
    data: object;
}
export async function handleMessage(sock: WSClient, s: WebSocket.RawData): Promise<SockChange> {
    if(!sock.authorized) {
        const token: WebSocketOptions = JSON.parse(s.toString());
        if(!token.token) return {authorized: false};
        if(!token.user && token.token === process.env.AUTH_SECRET) {
            return {server: true, authorized: true};
        }
        if(!token.user) return {authorized: false}; // invalid
        // ask API if this is valid
        try {
            const resp = await sendTo('/api/checkuser', {token: token.token});
            const json = await resp.json();
            if(json.username) return {server: false, authorized: true, username: json.username};
        } catch {}
        return {authorized: false};
    } else {
        const ev: WebSocketEvent = JSON.parse(s.toString());
        switch(ev.event) {
            case 'text':
                if(!sock.server) return {authorized: false};
                handleTextEvent(ev as TextEvent);
                break;
            default: 
                console.log(`Received unknown event: ${ev.event}`);
                break;
        }
        return {};
    }
    return {};
}