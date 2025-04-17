import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

import { handleMessage } from "./src/MessageHandler.js";

export interface WSClient {
  ws: WebSocket;
  authorized: boolean;
  username?: string;
  server: boolean;
}
let sockets: WSClient[] = [];
function findBySocket(ws: WebSocket) {
  return sockets.find(s => s.ws === ws);
}

const wss = new WebSocketServer({port: 8080});
wss.on('listening', () => {
  console.log('Server listening on port 8080');
});
wss.on('error', err => {
  console.error(err);
});

wss.on('connection', ws => {
  console.log('Websocket connection received');
  sockets.push({
    ws: ws,
    authorized: false,
    server: false
  });

  ws.on('error', err => {
    console.error(err);
  });
  ws.on('message', data => {
    const sock = findBySocket(ws);
    if(sock) {
      handleMessage(sock, data).then(r => {
        if('authorized' in r) {
          if(r.authorized) {
            sock.authorized = true;
            if (r.server) {
              sock.server = true;
              console.log(`Accepted server`);
            } else if (r.username) {
              console.log(`Accepted user: ${r.username}`);
              sock.username = r.username;
            }
            ws.send('authorized');
          } else {
            console.log('Unauthorized request, closing');
            ws.close();
          }
        }
      });
    } else {
      ws.close();
    }
  });
  ws.on('close', () => {
    sockets = sockets.filter(s => s.ws.OPEN);
  });
});