import tools from "../tools";
import { ERRORS } from "../consts";

const generateItemCount = (map, pathFindingSetup) => {
    const occurences = {};
    Object.keys(tools).forEach((toolName) => (occurences[toolName] = 0));

    map.forEach((row, columnIndex) => {
        row.forEach((item, rowIndex) => {
            if (item) {
                if (
                    item.parent.col === columnIndex &&
                    item.parent.row === rowIndex
                ) {
                    // is it the parent?
                    occurences[item.type.key]++;
                }

                if (item.shelfItems) {
                    if (!tools[item.type.key].hasShelf) {
                        // this item does not support shelves
                        throw Error(ERRORS.NO_AVAILABLE_SHELF);
                    }

                    item.shelfItems.forEach((name) => {
                        if (!tools[name].shelfPlaced) {
                            // this item can not be placed on a shelf
                            throw Error(ERRORS.NOT_SHELF_PLACEABLE);
                        }
                        occurences[name]++;

                        if (name === "Key") {
                            // add the location of the item that the key is on top of
                            pathFindingSetup.keyLocation = item.parent;
                        }
                    });
                }

                if (item.type.key === "SpawnPoint") {
                    pathFindingSetup.spawnLocation = item.parent;
                } else if (item.type.key === "Key") {
                    pathFindingSetup.keyLocation = item.parent;
                }
            }
        });
    });

    return occurences;
};

const isKeyNeighbouring = (map, { centralCol, centralRow }, checkedTiles) => {
    const directions = [-1, 1];
    // const directions = [[-1,0], [0,-1], [1,0], [0,1]]
    for (let i = 0; i < directions.length; i++) {
        const offset = directions[i];
        for (let j = 0; j <= 1; j++) {
            // modify the first or second element of the offset
            const newCoords = [centralCol, centralRow];
            newCoords[j] += offset;
            const [col, row] = newCoords;

            if (
                col >= 0 &&
                col < map.length &&
                row >= 0 &&
                row < map[col].length &&
                checkedTiles?.[`${col},${row}`] !== true // and it has not been checked before
            ) {
                // is it in the map
                const currentNeighbour = map[col][row];
                if (
                    currentNeighbour === null // this tile is empty
                ) {
                    checkedTiles[`${col},${row}`] = true;
                    if (
                        isKeyNeighbouring(
                            map,
                            {
                                centralCol: col,
                                centralRow: row
                            },
                            checkedTiles
                        )
                    ) {
                        return true;
                    } // therefore check its neighbours
                } else if (
                    currentNeighbour?.type.key === "Key" ||
                    currentNeighbour?.shelfItems?.includes("Key")
                ) {
                    // we have found the key therefore there is a path
                    return true;
                }
            }
        }
    }

    return false;
};

export const isKeyAccessible = (map, pathFindingSetup) => {
    const { spawnLocation } = pathFindingSetup;
    const checkedTiles = {
        [`${spawnLocation.col},${spawnLocation.row}`]: true
    }; // array of all checked tiles
    return isKeyNeighbouring(
        map,
        {
            centralCol: spawnLocation.col,
            centralRow: spawnLocation.row
        },
        checkedTiles
    );

    // keep checking neighbours until the key is a neighbour or until we run out of tiles

    // for each tile in the map
};

const isMapValid = (map) => {
    const pathFindingSetup = {
        // pass this to generate item count to reduce the times we have to loop through the map
        spawnLocation: null,
        keyLocation: null
    };
    const occurences = generateItemCount(map, pathFindingSetup);
    Object.entries(occurences).forEach(([key, actualOccurences]) => {
        const respectiveTool = tools[key];
        if (respectiveTool.min && actualOccurences < respectiveTool.min) {
            throw Error(ERRORS.MIN_NOT_SATISFIED);
        }
        if (respectiveTool.max && actualOccurences > respectiveTool.max) {
            throw Error(ERRORS.MAX_NOT_SATISFIED);
        }
        if (
            respectiveTool.category === "compulsory" &&
            actualOccurences === 0
        ) {
            throw Error(ERRORS.MISSING_COMPULSORY);
        }
    });

    if (!isKeyAccessible(map, pathFindingSetup)) {
        throw Error(ERRORS.KEY_NOT_ACCESSABLE);
    }
};

export default isMapValid;
