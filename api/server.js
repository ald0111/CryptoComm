import express from "express";
import { WebSocketServer } from "ws";
class Server {
  constructor() {
    this.app = express();
    this.wsS = new WebSocketServer({ noServer: true });
    this.wsS.on("connection", (socket) => {
      //code to execute on connection
    });
  }
  listen(port) {
    const server = this.app.listen(port || 3000);
    server.on("upgrade", (request, socket, head) => {
      this.wsS.handleUpgrade(request, socket, head, (sockConn) => {
        sockConn.on("message", (message) => {
          console.log(message);
          sockConn.send("hello");
        });
        this.wsS.emit("connection", socket, request);
      });
    });
  }
}

export default Server;
