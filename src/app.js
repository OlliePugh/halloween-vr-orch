import secrets from "./secrets";
import express from "express";
import Factory from "./factory";
import http from "http";
import socketHandshakeSetup from "./socket-events";
import routing from "./routing";
import { Server } from "socket.io";
import config from "./config";

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
let serialHandler;

server.listen(8080, async () => {
    redisClient = await Factory.createRedisClient();
    serialHandler = Factory.createSerialHandler(
        { path: config.port, baudRate: config.baudRate },
        true
    );
    routing(app, gameManager, redisClient, serialHandler);
    console.log("HTTP Listening");
});
