import SOCKET_EVENTS from "../SOCKET_EVENTS";
import { getClientIdFromSocket } from "../utils";

const requiresClientId = (socket, data, disconnect, callback) => {
    let clientId;
    try {
        clientId = getClientIdFromSocket(socket);
    } catch (e) {
        console.log(`Missing client id from socket ${e}`);
        if (disconnect) {
            socket.disconnect(); // should send a message before dispatching this
        } else {
            socket.emit(SOCKET_EVENTS.MISSING_CLIENT_ID);
        }
    }

    if (clientId) {
        callback(clientId, data);
    }
};

const socketHandler = async (socket, redisClient, gameManager, queue) => {
    // MOVE THESE TO GAME SOCKETS
    socket.on(SOCKET_EVENTS.TRIGGER_EVENT, (data) => {
        requiresClientId(socket, data, true, async (clientId, identifier) => {
            gameManager.triggerEvent(clientId, identifier);
        });
    });

    socket.on(SOCKET_EVENTS.NONBLOCK_EVENT, (data) => {
        requiresClientId(socket, data, true, async (clientId, data) => {
            gameManager.triggerNonBlockEvent(clientId, data);
        });
    });

    socket.on("disconnect", (data) => {
        requiresClientId(socket, data, true, async (clientId, _) => {
            queue.remove(clientId); // try and remove them from the queue
            if (gameManager.currentPlayer?.clientId === clientId && clientId) {
                gameManager.endGame(); // if the current player's socket disconnects end the game
            }
        });
    });
};

const socketHandshakeSetup = (io, socket, redisClient, gameManager, queue) => {
    socket.on(SOCKET_EVENTS.HANDSHAKE, () => {
        requiresClientId(socket, null, false, async (clientId) => {
            // this requires a client id

            let socketId;
            try {
                socketId = await redisClient.json.get(clientId, {
                    path: ["socket"]
                });
            } catch {}

            if (
                socketId &&
                io.of("/").sockets.get(socketId)?.connected &&
                socketId != socket.id
            ) {
                console.log("multi socket detected");
                // there is already a socket open to this user
                socket.emit(SOCKET_EVENTS.MULTIPLE_SOCKETS);
            } else {
                setPrimarySocket(
                    socket,
                    redisClient,
                    clientId,
                    gameManager,
                    queue
                );
            }
        });
    });

    socket.on(SOCKET_EVENTS.SET_PRIMARY, () => {
        requiresClientId(socket, null, false, async (clientId) => {
            let socketId;
            try {
                socketId = await redisClient.json.get(clientId, {
                    path: ["socket"]
                });
            } catch {}
            const oldSocket = io.of("/").sockets.get(socketId);
            if (socketId && oldSocket?.connected && socketId != socket.id) {
                // an old socket id is in the redis and an old socket is connected
                console.log("closing old socket here");
                oldSocket.disconnect(); // close the old socket
            }
            setPrimarySocket(socket, redisClient, clientId, gameManager, queue);
        });
    });
};

const setPrimarySocket = async (
    socket,
    redisClient,
    clientId,
    gameManager,
    queue
) => {
    try {
        await redisClient.json.set(clientId, `$.socket`, socket.id);
        socketHandler(socket, redisClient, gameManager, queue);
        queue.add({ clientId, socketId: socket.id }, false); // add the user to the queue
    } catch (e) {
        console.log(`Failed to update socket ${e.message}`);
    }
};

export default socketHandshakeSetup;
