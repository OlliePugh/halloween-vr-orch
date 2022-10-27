import secrets from "./secrets";
import express from "express";
import Factory from "./factory";
import http from "http";
import socketHandshakeSetup from "./socket-events";
import routing from "./routing";
import { Server } from "socket.io";
import config from "./config";
import Queue from "./queue";
import broadcastQueueUpdate from "./socket-events/broadcast-queue-update";
import fs from "fs";
import { importPKCS8, importSPKI } from "jose";

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1); // trust first proxy

const io = new Server(server, {
    cors: {
        origin: "http://dev.olliepugh.com:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["connect.sid"],
        credentials: true
    }
});

let gameManager;
let redisClient;
let serialHandler;

let privateKey;
let publicKey;

io.on("connection", async (socket) => {
    if (socket.handshake.query?.token === secrets.unityKey) {
        gameManager.setUnitySocket(socket);
        console.log("Unity Client Connected");
    }
    socketHandshakeSetup(
        io,
        socket,
        redisClient,
        gameManager,
        queue,
        privateKey
    );
});

const queue = new Queue({
    // onAdd: (user) => {
    //     io.sockets.to(user.socketId).emit(SOCKET_EVENTS.JOINED_QUEUE);
    // },
    onChange: () => {
        broadcastQueueUpdate(queue, io);
        gameManager.startMatchIfReady(queue);
    }
});

server.listen(8080, async () => {
    redisClient = await Factory.createRedisClient();
    gameManager = await Factory.createGameManager(io);
    serialHandler = Factory.createSerialHandler(
        { path: config.port, baudRate: config.baudRate },
        true
    );

    const privateKeyContents = fs.readFileSync("keys/private.pem", "utf-8");
    privateKey = await importPKCS8(privateKeyContents, "RS256");
    const publicKeyContents = fs.readFileSync("keys/public_key.pem", "utf-8");
    publicKey = await importSPKI(publicKeyContents, "RS256");
    routing(app, gameManager, redisClient, serialHandler, publicKey);
    console.log("HTTP Listening");
});
