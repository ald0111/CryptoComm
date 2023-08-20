import express from "express";
import { WebSocket, WebSocketServer } from "ws";
class Server {
  constructor() {
    this.app = express();
    this.wsS = new WebSocketServer({ noServer: true });
    this.wsS.on("connection", (socket) => {
      //code to execute on connection
    });
    this.connected = 0;
  }
  listen(port) {
    const server = this.app.listen(port || 3000);
    server.on("upgrade", (request, socket, head) => {
      this.wsS.handleUpgrade(request, socket, head, (sockConn) => {
        this.connected++;
        console.log("connected: " + this.connected);
        sockConn.on("message", (message) => {
          //print every incoming message as text to the console
          try {
            let msg = JSON.parse(message);
            console.log(msg);
            this.wsS.clients.forEach((client) => {
              if (client !== sockConn && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msg));
              }
            });
          } catch (e) {
            console.log(e);
          }
          //broadcast every message to all connected clients except the sender
        });
        sockConn.on("close", () => {
          this.connected--;
          console.log("connected: " + this.connected);
        });
        this.wsS.emit("connection", socket, request);
      });
    });
  }
}

export default Server;
