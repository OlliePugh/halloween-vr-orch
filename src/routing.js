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
import { compactVerify } from "jose";

export default (app, gameManager, redisClient, serialHandler, publicKey) => {
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
            // has the map been validated?
            const { payload, _ } = await compactVerify(
                req.body.signature,
                publicKey
            );
            const decodedPayload = JSON.parse(
                new TextDecoder().decode(payload)
            );
            await gameManager.setMap(clientId, decodedPayload.map);
        } catch (e) {
            console.log(`Failed on submit endpoint ${e.message}`);
            res.status(403).send();
            return;
        }
        res.status(200).send();
    });
};
