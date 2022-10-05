import secrets from "./secrets";
import express from "express";
import Factory from "./factory";
import http from "http";
import socketHandshakeSetup from "./socket-events";
import routing from "./routing";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

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

io.on("connection", async (socket) => {
    if (socket.handshake.query?.token === secrets.unityKey) {
        gameManager.setUnitySocket(socket);
        console.log("Unity Client Connected");
    }
    socketHandshakeSetup(io, socket, redisClient, gameManager);
});

let redisClient;

server.listen(8080, async () => {
    redisClient = await Factory.createRedisClient();
    routing(app, gameManager, redisClient);
    console.log("HTTP Listening");
});
