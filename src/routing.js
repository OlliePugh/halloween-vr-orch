import { createClientId, getClientIdFromRequest } from "./utils";
import consts from "./consts";
import cookies from "cookie-parser";
import tools from "./tools";
import cors from "cors";
import express from "express";

export default (app, gameManager, session) => {
    app.use(cookies());
    app.use(
        cors({
            origin: "http://dev.olliepugh.com:3000",
            credentials: true,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        })
    );
    app.use(express.json());
    app.use((req, res, next) => {
        try {
            const clientId = getClientIdFromRequest(req);
            if (!session[clientId]) {
                // if the cookie exists but the session doesnt
                session[clientId] = { sockets: [] };
            }
        } catch (e) {
            // will throw if a client Id cannot be found
            const clientId = createClientId();
            res.cookie(consts.CLIENT_COOKIE_KEY, clientId, {
                maxAge: 86400 * 1000
            });
            session[clientId] = { sockets: [] }; // create a new session
        }
        next();
    });

    app.get("/start-session", (req, res) => {
        res.status(200).send(); // this is used to get a client id
    });

    app.get("/tools", (req, res) => {
        res.send(tools);
    });

    app.post("/submit", (req, res) => {
        try {
            const clientId = getClientIdFromRequest(req); // TODO replace this with redis maybe
            session[clientId].isInGame = true;
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
