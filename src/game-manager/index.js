import { ERRORS } from "../consts";
import SOCKET_EVENTS from "../SOCKET_EVENTS";
import tools from "../tools";
import gameEvents from "../game-events";

class GameManager {
    unitySocket;
    currentMap = {};
    currentNonTileEvents = {};

    redisClient;

    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    setUnitySocket(unitySocket) {
        this.unitySocket = unitySocket;
    }

    setMap(map) {
        this.currentMap = {};
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

    triggerEvent(identifier) {
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
            setTimeout(() => {
                try {
                    this.currentMap[identifier].triggerable = true; // set back to triggerable
                } catch (e) {
                    console.log(
                        `Could not set tile back to triggerable ${e.message}`
                    );
                }
            }, tile.frequency * 1000);
        } else {
            console.log("Tile is not triggerable");
        }
    }

    triggerNonBlockEvent(data) {
        // TODO check if the user is allowed to perform this (e.g. is there still a cooldown taking place)
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
            setTimeout(() => {
                try {
                    delete this.currentNonTileEvents[key]; // set back to triggerable
                } catch (e) {
                    console.log(
                        `Could not remove currently running non tile event ${e.message}`
                    );
                }
            }, toSend.frequency * 1000);
        } catch (e) {
            console.log(e.message);
            console.log("Failed to emit event to unity client");
        }
    }
}

export default GameManager;
