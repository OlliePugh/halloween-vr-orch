import { v4 as uuidv4 } from "uuid";
import consts from "./consts";
import { ERRORS } from "./consts";
import cookie from "cookie";

export const getClientIdFromRequest = (req) => {
    const clientId = req.cookies[consts.CLIENT_COOKIE_KEY];
    if (!clientId) {
        throw Error(ERRORS.MISSING_CLIENT_ID);
    }
    return clientId;
};

export const getClientIdFromSocket = (socket) => {
    const cookies = cookie.parse(socket.request.headers.cookie);
    if (!cookies[consts.CLIENT_COOKIE_KEY]) {
        socket.emit(socketEvents.MISSING_COOKIE);
        throw Error(ERRORS.MISSING_CLIENT_ID);
    }
    return cookies[consts.CLIENT_COOKIE_KEY];
};

export const createClientId = () => {
    return uuidv4();
};
