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
}

export default GameManager;
