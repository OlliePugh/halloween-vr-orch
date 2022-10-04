import secrets from "./secrets";
import express from "express";
import Factory from "./factory";
import http from "http";
import socketHandler from "./socket-events";
import routing from "./routing";
import { getClientIdFromSocket } from "./utils";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const session = {};

app.set("trust proxy", 1); // trust first proxy

const gameManager = Factory.createGameManager();
const io = new Server(server, {
    cors: {
        origin: "http://dev.olliepugh.com:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["connect.sid"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    if (socket.handshake.query?.token === secrets.unityKey) {
        gameManager.setUnitySocket(socket);
        console.log("Unity Client Connected");
    } else {
        try {
            socketHandler(socket, session, gameManager); // add the events to the socket
        } catch {
            // user should not be creating a socket without a client id
            socket.disconnect();
        }
    }
});

routing(app, gameManager, session);

server.listen(8080, () => {
    console.log("HTTP Listening");
});
