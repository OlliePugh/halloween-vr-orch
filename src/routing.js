import {
    createClientId,
    createNewSession,
    getClientIdFromRequest
} from "./utils";
import consts from "./consts";
import cookies from "cookie-parser";
import tools from "./tools";
import events from "./game-events";
import cors from "cors";
import express from "express";

export default (app, gameManager, redisClient, serialHandler) => {
    app.use(cookies());
    app.use(
        cors({
            origin: "http://dev.olliepugh.com:3000",
            credentials: true,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        })
    );
    app.use(express.json());
    app.use(async (req, res, next) => {
        try {
            const clientId = getClientIdFromRequest(req);
            createNewSession(redisClient, clientId);
        } catch (e) {
            // will throw if a client Id cannot be found
            const clientId = createClientId();
            res.cookie(consts.CLIENT_COOKIE_KEY, clientId, {
                maxAge: 86400 * 1000
            });
            createNewSession(redisClient, clientId);
        }
        next();
    });

    app.get("/start-session", (req, res) => {
        res.status(200).send(); // this is used to get a client id
    });

    app.get("/tools", (req, res) => {
        res.send(tools);
    });

    app.get("/events", (req, res) => {
        res.send(events);
    });

    app.get("/bpm", (req, res) => {
        res.send(`${serialHandler.state.bpm}`);
    });

    app.post("/submit", async (req, res) => {
        try {
            const clientId = getClientIdFromRequest(req);
            await redisClient.json.set(clientId, `$.isInGame`, true);
        } catch (e) {
            console.log(e);
            res.status(403).send();
            return;
        }

        if (gameManager.unitySocket) {
            gameManager.setMap(req.body);
        }
        res.status(200).send();
    });
};
