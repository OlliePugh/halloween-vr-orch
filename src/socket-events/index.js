import SOCKET_EVENTS from "../SOCKET_EVENTS";
import { getClientIdFromSocket } from "../utils";

const socketHandler = (socket, session, gameManager) => {
    let clientId;
    try {
        clientId = getClientIdFromSocket(socket);
    } catch {
        socket.disconnect(); // close the socket
        return;
    }

    session[clientId]?.sockets.push(socket.id);

    socket.on(SOCKET_EVENTS.TRIGGER_EVENT, (identifier) => {
        // TODO REPLACE MANUAL SESSIONS WITH REDIS
        if (session[clientId].isInGame) {
            console.log("user triggered event");
            gameManager.triggerEvent(identifier);
        }
    });
};

export default socketHandler;
