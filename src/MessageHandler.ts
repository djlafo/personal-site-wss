import WebSocket from "ws";
import jwt from 'jsonwebtoken';
import { WSClient } from "../index.js";
import { pollTextAlerts } from "./TextHandler.js";

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
interface User {
    username: string;
    id: number;
    plannerId: number | null;
    lastIp: string | null;
    phoneNumber: string | null;
}
export interface JWTObjType {
    exp: number;
    data: User;
}

pollTextAlerts();

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
            const json: JWTObjType = jwt.verify(token.token, process.env.AUTH_SECRET);
            if(json && json.data.username) 
                return {server: false, authorized: true, username: json.data.username};
        } catch {}
        return {authorized: false};
    } else {
        const ev: WebSocketEvent = JSON.parse(s.toString());
        switch(ev.event) {
            default: 
                console.log(`Received unknown event: ${ev.event}`);
                break;
        }
        return {};
    }
}