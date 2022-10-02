import express from "express";
import tools from "./tools";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import SOCKET_EVENTS from "./SOCKET_EVENTS";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let unitySocket;

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
    console.log("new user connected");
    unitySocket = socket;
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/tools", (req, res) => {
    res.send(tools);
});

app.post("/submit", (req, res) => {
    console.log(req.body);
    if (unitySocket) {
        console.log("submitting new map");
        unitySocket.emit("ping");
        unitySocket.emit(SOCKET_EVENTS.MAP_UPDATE, req.body);
    }
    res.status(200).send();
});

server.listen(8080, () => {
    console.log("HTTP Listening");
});
