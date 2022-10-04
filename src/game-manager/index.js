import { ERROR_MESSAGES } from "../consts";
import SOCKET_EVENTS from "../SOCKET_EVENTS";
import tools from "../tools";

class GameManager {
    unitySocket;
    currentMap = {};

    constructor() {}

    setUnitySocket(unitySocket) {
        this.unitySocket = unitySocket;
    }

    setMap(map) {
        this.currentMap = {};
        try {
            if (this.unitySocket) {
                this.unitySocket.emit(SOCKET_EVENTS.MAP_UPDATE, map);
            } else {
                throw Error(ERROR_MESSAGES.NO_UNITY_CLIENT);
            }
        } catch (e) {
            console.log(`Could not send message to unity ${e.message}`);
            throw Error(ERROR_MESSAGES.NO_UNITY_CLIENT);
        }

        map.forEach((col, colNum) => {
            col.forEach((tile, rowNum) => {
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
                this.currentMap[identifier].triggerable = true; // set back to triggerable
            }, tile.frequency * 1000);
        } else {
            console.log("Tile is not triggerable");
        }
    }
}

export default GameManager;
