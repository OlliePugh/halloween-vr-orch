import { ERRORS } from "../consts";
import SOCKET_EVENTS from "../SOCKET_EVENTS";
import tools from "../tools";
import gameEvents from "../game-events";
import Queue from "../queue";
import { END_GAME_MESSAGES } from "../consts";

class GameManager {
    unitySocket;
    currentMap = {};
    currentNonTileEvents = {};
    gameTimeouts = [];
    currentPlayer;

    redisClient;
    ioRef;

    constructor(redisClient, ioRef) {
        this.redisClient = redisClient;
        this.ioRef = ioRef;
    }

    setUnitySocket(unitySocket) {
        this.unitySocket = unitySocket;
        unitySocket.on(SOCKET_EVENTS.GAME_READY, () => {
            this.ioRef
                .to(this.currentPlayer?.socketId)
                .emit(SOCKET_EVENTS.GAME_READY); // send the current player the ready event
        });
        unitySocket.on(SOCKET_EVENTS.END_GAME, (message) => {
            const convertedMessage =
                END_GAME_MESSAGES?.[message] || "Game Over";
            this.ioRef
                .to(this.currentPlayer?.socketId)
                .emit(SOCKET_EVENTS.END_GAME, convertedMessage); // send the current player the ready event
        });
    }

    setMap(clientId, map) {
        // TODO ARE THESE HANDLED??
        if (clientId !== this.currentPlayer.clientId || !clientId) {
            throw Error(ERRORS.USER_NOT_IN_GAME);
        }

        if (Object.keys(this.currentMap).length !== 0) {
            throw Error(ERRORS.MAP_ALREADY_DEFINED);
        }
        try {
            if (this.unitySocket) {
                this.unitySocket.emit(SOCKET_EVENTS.MAP_UPDATE, map);
            } else {
                throw Error(ERRORS.NO_UNITY_CLIENT);
            }
        } catch (e) {
            console.log(`Could not send message to unity ${e.message}`);
            throw Error(ERRORS.NO_UNITY_CLIENT);
        }

        if (!map) {
            throw Error(ERRORS.NULL_MAP);
        }

        map.forEach((col, colNum) => {
            col.forEach((tile, rowNum) => {
                if (!tile) return;
                try {
                    const tileType = tools[tile?.type.key];
                    if (tileType.interaction) {
                        this.currentMap[`${colNum},${rowNum}`] = {
                            key: tile?.type.key,
                            ...tileType.interaction,
                            lastCalled: 0,
                            triggerable: true
                        };
                    }
                } catch (e) {
                    console.log(e.message);
                    console.log(
                        `Could not find tool with key ${tile?.type.key}`
                    );
                }
            });
        });
    }

    triggerEvent(clientId, identifier) {
        if (clientId !== this.currentPlayer.clientId || !clientId) {
            return;
        }

        const tile = this.currentMap[identifier];
        if (tile?.triggerable) {
            if (this.unitySocket) {
                const splitIdentifier = identifier
                    .split(",")
                    .map((value) => parseInt(value));
                try {
                    console.log("triggered tile");
                    this.unitySocket.emit(
                        SOCKET_EVENTS.TRIGGER_EVENT,
                        splitIdentifier
                    );
                } catch (e) {
                    console.log(e.message);
                    console.log("Failed to emit event to unity client");
                }
            }
            tile.triggerable = false;
            this.gameTimeouts.push(
                setTimeout(() => {
                    // if the map has reset this will throw errors
                    try {
                        this.currentMap[identifier].triggerable = true; // set back to triggerable
                    } catch (e) {
                        console.log(
                            `Could not set tile back to triggerable ${e.message}`
                        );
                    }
                }, tile.frequency * 1000)
            );
        } else {
            console.log("Tile is not triggerable");
        }
    }

    triggerNonBlockEvent(clientId, data) {
        if (clientId !== this.currentPlayer.clientId || !clientId) {
            return;
        }
        const key = data?.key;

        if (!gameEvents[key]) {
            // is it a known event?
            console.log(`Attempted to unknown dispatch non block event ${key}`);
            return;
        }

        if (this.currentNonTileEvents[key]) {
            // event is already running
            console.log(
                `Attempted to start event ${key} when one is currently running`
            );
            return;
        }
        try {
            const event = gameEvents[key];
            const toSend = { ...event, key, location: data.location };
            this.currentNonTileEvents[key] = toSend;
            this.unitySocket.emit(SOCKET_EVENTS.NONBLOCK_EVENT, toSend);
            this.gameTimeouts.push(
                setTimeout(() => {
                    try {
                        delete this.currentNonTileEvents[key]; // set back to triggerable
                    } catch (e) {
                        console.log(
                            `Could not remove currently running non tile event ${e.message}`
                        );
                    }
                }, toSend.frequency * 1000)
            );
        } catch (e) {
            console.log(e.message);
            console.log("Failed to emit event to unity client");
        }
    }

    startMatchIfReady(queue) {
        if (this.isMatchInProgress()) {
            // match is in progress
            return;
        }

        const newPlayer = queue.getNext();

        if (!newPlayer) {
            return; // there is no one in the queue ready to play
        }

        this.startGame(newPlayer[0]);
    }

    isMatchInProgress() {
        return !!this.currentPlayer;
    }

    async startGame(newPlayer) {
        console.log("starting");
        console.log(newPlayer);
        this.currentPlayer = newPlayer;
        this.ioRef.to(newPlayer.socketId).emit(SOCKET_EVENTS.GAME_STARTING);
        // await this.redisClient.json.set(newPlayer.clientId, `$.isInGame`, true);
    }

    async endGame({ informUnity = true } = {}) {
        // TODO CLEAR ANY TIMEOUTS THAT HAVE STARTED FOR CLEANING UP EVENTS TAKING PLACE

        if (this.unitySocket && informUnity) {
            // inform the unity client that the game has ended
            this.unitySocket.emit(SOCKET_EVENTS.END_GAME);
        } else {
            throw Error(ERRORS.NO_UNITY_CLIENT); // TODO HANDLE THIS
        }

        const totalTimeouts = this.gameTimeouts.length;
        for (let i = 0; i < totalTimeouts; i++) {
            // clear all timeouts
            clearTimeout(this.gameTimeouts.shift());
        }

        this.currentNonTileEvents = {};
        this.currentMap = {};
        this.currentPlayer = null;
        this.startMatchIfReady(Queue.getInstance());
    }
}

export default GameManager;
