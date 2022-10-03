import express from "express";
import tools from "./tools";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import SOCKET_EVENTS from "./SOCKET_EVENTS";
import secrets from "./secrets";
import session from "express-session";

const app = express();
app.set("trust proxy", 1); // trust first proxy
app.use(
    session({
        secret: secrets.sessionSecret, // this will be replaced in the future
        resave: false,
        saveUninitialized: true,
        domain: "dev.olliepugh.com"
        // cookie: { sameSite: "none" }
    })
);
const server = http.createServer(app);
const io = new Server(server);
let unitySocket;

app.use(
    cors({
        origin: "http://dev.olliepugh.com:3000",
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    })
);
app.use(express.json());

io.on("connection", (socket) => {
    if (socket.handshake.query?.token === secrets.unityKey) {
        unitySocket = socket;
        console.log("Unity Client");
    }
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/tools", (req, res) => {
    res.send(tools);
    console.log(req.session.id);
});

app.post("/submit", (req, res) => {
    console.log(req.session.id);
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
